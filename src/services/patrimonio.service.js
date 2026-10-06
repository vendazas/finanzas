import { QueryTypes } from "sequelize";
import { ApiError } from "@/lib/api-response";
import { sequelize } from "@/lib/sequelize";
import { restarDinero, sumarDinero } from "@/utils/decimal";

const impact = "CASE WHEN m.tipo IN ('INGRESO','TRANSFERENCIA_ENTRADA','AJUSTE') THEN m.monto WHEN m.tipo IN ('GASTO','TRANSFERENCIA_SALIDA') THEN -m.monto ELSE 0 END";
const amount = (value) => /^-?\d+(\.\d{1,2})?$/.test(String(value));

export const patrimonioService = {
  async resumen(usuarioId) {
    const [cuentas, activos, deudas, tarjetas, usuario] = await Promise.all([
      sequelize.query(`SELECT mo.codigo moneda, COALESCE(SUM(c.saldo_inicial + COALESCE(x.saldo,0)),0)::text monto FROM cuentas c JOIN monedas mo ON mo.id=c.moneda_id LEFT JOIN (SELECT cuenta_id,SUM(${impact}) saldo FROM movimientos m WHERE m.usuario_id=:usuarioId AND m.deleted_at IS NULL GROUP BY cuenta_id) x ON x.cuenta_id=c.id WHERE c.usuario_id=:usuarioId AND c.incluir_patrimonio=true AND c.activo=true AND c.deleted_at IS NULL GROUP BY mo.codigo`, { replacements: { usuarioId }, type: QueryTypes.SELECT }),
      sequelize.query("SELECT mo.codigo moneda,COALESCE(SUM(a.valor_actual),0)::text monto FROM activos_patrimonio a JOIN monedas mo ON mo.id=a.moneda_id WHERE a.usuario_id=:usuarioId AND a.activo=true AND a.deleted_at IS NULL GROUP BY mo.codigo", { replacements: { usuarioId }, type: QueryTypes.SELECT }),
      sequelize.query("SELECT tipo,mo.codigo moneda,COALESCE(SUM(saldo_pendiente),0)::text monto FROM deudas d JOIN monedas mo ON mo.id=d.moneda_id WHERE d.usuario_id=:usuarioId AND d.deleted_at IS NULL AND d.estado NOT IN ('PAGADO','CANCELADO') GROUP BY tipo,mo.codigo", { replacements: { usuarioId }, type: QueryTypes.SELECT }),
      sequelize.query("SELECT mo.codigo moneda,COALESCE(SUM(c.monto),0)::text consumos,COALESCE(SUM(p.monto),0)::text pagos FROM tarjetas_credito t JOIN monedas mo ON mo.id=t.moneda_id LEFT JOIN consumos_tarjeta c ON c.tarjeta_id=t.id LEFT JOIN pagos_tarjeta p ON p.tarjeta_id=t.id WHERE t.usuario_id=:usuarioId AND t.deleted_at IS NULL GROUP BY mo.codigo", { replacements: { usuarioId }, type: QueryTypes.SELECT }),
      sequelize.query("SELECT moneda_base FROM usuarios WHERE id=:usuarioId", { replacements: { usuarioId }, type: QueryTypes.SELECT }),
    ]);
    const codes = new Set([...cuentas, ...activos, ...deudas, ...tarjetas].map((row) => row.moneda));
    const porMoneda = [...codes].map((moneda) => {
      const find = (items, extra) => items.find((item) => item.moneda === moneda)?.[extra] || "0.00";
      const cuentasMonto = find(cuentas, "monto"); const activosMonto = find(activos, "monto");
      const cobrar = deudas.find((item) => item.moneda === moneda && item.tipo === "ME_DEBEN")?.monto || "0.00";
      const pagar = deudas.find((item) => item.moneda === moneda && item.tipo === "YO_DEBO")?.monto || "0.00";
      const tarjeta = tarjetas.find((item) => item.moneda === moneda); const tarjetasMonto = restarDinero(tarjeta?.consumos || "0", tarjeta?.pagos || "0");
      return { moneda, cuentas: cuentasMonto, activos: activosMonto, cuentasPorCobrar: cobrar, deudas: pagar, tarjetas: tarjetasMonto, neto: restarDinero(sumarDinero([cuentasMonto, activosMonto, cobrar]), sumarDinero([pagar, tarjetasMonto])) };
    });
    const base = usuario[0]?.moneda_base;
    const rates = await sequelize.query("SELECT o.codigo origen,d.codigo destino,t.valor::text valor FROM tipos_cambio t JOIN monedas o ON o.id=t.moneda_origen_id JOIN monedas d ON d.id=t.moneda_destino_id WHERE t.usuario_id=:usuarioId ORDER BY t.fecha DESC", { replacements: { usuarioId }, type: QueryTypes.SELECT });
    const values = porMoneda.map((row) => row.moneda === base ? row.neto : null);
    for (const row of porMoneda.filter((row) => row.moneda !== base)) { const rate = rates.find((item) => item.origen === row.moneda && item.destino === base); if (rate) values.push((Number(row.neto) * Number(rate.valor)).toFixed(2)); }
    return { porMoneda, consolidado: values.length === porMoneda.length ? { moneda: base, neto: sumarDinero(values) } : null };
  },
  async listar(usuarioId) { return sequelize.query("SELECT a.*,m.codigo moneda FROM activos_patrimonio a JOIN monedas m ON m.id=a.moneda_id WHERE a.usuario_id=:usuarioId AND a.deleted_at IS NULL ORDER BY a.created_at DESC", { replacements: { usuarioId }, type: QueryTypes.SELECT }); },
  async crear(usuarioId, data) {
    if (!data.nombre?.trim() || !["PROPIEDAD", "VEHICULO", "INVERSION", "OTRO"].includes(data.tipo) || !amount(data.valorActual)) throw new ApiError("Revisa los datos del activo.", 422);
    return sequelize.transaction(async (transaction) => { const [rows] = await sequelize.query("INSERT INTO activos_patrimonio(id,usuario_id,moneda_id,nombre,tipo,valor_actual,fecha_valoracion,descripcion,fecha_adquisicion,valor_adquisicion) VALUES(gen_random_uuid(),:usuarioId,:monedaId,:nombre,:tipo,:valorActual,:fechaValoracion,:descripcion,:fechaAdquisicion,:valorAdquisicion) RETURNING *", { replacements: { usuarioId, monedaId: data.monedaId, nombre: data.nombre.trim(), tipo: data.tipo, valorActual: data.valorActual, fechaValoracion: data.fechaValoracion, descripcion: data.descripcion || null, fechaAdquisicion: data.fechaAdquisicion || null, valorAdquisicion: data.valorAdquisicion || null }, type: QueryTypes.INSERT, transaction }); const activo = rows[0]; await sequelize.query("INSERT INTO valoraciones_activo(id,activo_id,usuario_id,valor,fecha,observacion) VALUES(gen_random_uuid(),:id,:usuarioId,:valor,:fecha,:observacion)", { replacements: { id: activo.id, usuarioId, valor: data.valorActual, fecha: data.fechaValoracion, observacion: data.observacion || null }, transaction }); return activo; });
  },
  async actualizar(usuarioId, id, data) { return sequelize.transaction(async (transaction) => { const [actual] = await sequelize.query("SELECT * FROM activos_patrimonio WHERE id=:id AND usuario_id=:usuarioId AND deleted_at IS NULL FOR UPDATE", { replacements: { id, usuarioId }, type: QueryTypes.SELECT, transaction }); if (!actual) throw new ApiError("Activo no encontrado.", 404); const [activo] = await sequelize.query("UPDATE activos_patrimonio SET nombre=:nombre,tipo=:tipo,descripcion=:descripcion,valor_actual=:valorActual,fecha_valoracion=:fechaValoracion,updated_at=CURRENT_TIMESTAMP WHERE id=:id RETURNING *", { replacements: { id, nombre: data.nombre, tipo: data.tipo, descripcion: data.descripcion || null, valorActual: data.valorActual, fechaValoracion: data.fechaValoracion }, type: QueryTypes.UPDATE, transaction }); if (String(actual.valor_actual) !== String(data.valorActual) || actual.fecha_valoracion !== data.fechaValoracion) await sequelize.query("INSERT INTO valoraciones_activo(id,activo_id,valor,fecha,observacion) VALUES(gen_random_uuid(),:id,:valor,:fecha,:observacion)", { replacements: { id, valor: data.valorActual, fecha: data.fechaValoracion, observacion: data.observacion || null }, transaction }); return activo; }); },
  async desactivar(usuarioId, id) { const [activo] = await sequelize.query("UPDATE activos_patrimonio SET activo=false,updated_at=CURRENT_TIMESTAMP WHERE id=:id AND usuario_id=:usuarioId AND deleted_at IS NULL RETURNING *", { replacements: { id, usuarioId }, type: QueryTypes.UPDATE }); if (!activo) throw new ApiError("Activo no encontrado.", 404); return activo; },
};
