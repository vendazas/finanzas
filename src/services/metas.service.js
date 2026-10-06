import { QueryTypes } from "sequelize";
import { ApiError } from "@/lib/api-response";
import { sequelize } from "@/lib/sequelize";
import { metasRepository } from "@/repositories/metas.repository";
import { restarDinero, sumarDinero } from "@/utils/decimal";

const validAmount = (value) => /^\d+(\.\d{1,2})?$/.test(String(value)) && Number(value) > 0;

export const metasService = {
  async listar(usuarioId) {
    const metas = await metasRepository.listar(usuarioId);
    return metas.map((meta) => ({ ...meta, pendiente: restarDinero(meta.monto_objetivo, meta.ahorrado), porcentaje: Number(meta.monto_objetivo) ? Math.min(100, Number(meta.ahorrado) * 100 / Number(meta.monto_objetivo)) : 0 }));
  },
  async obtener(usuarioId, id) {
    const [meta] = await metasRepository.obtener(id, usuarioId);
    if (!meta) throw new ApiError("Meta no encontrada.", 404);
    return { ...meta, aportes: await metasRepository.aportes(id, usuarioId) };
  },
  async crear(usuarioId, data) {
    if (!data.nombre?.trim() || !validAmount(data.montoObjetivo)) throw new ApiError("Revisa los datos de la meta.", 422);
    const [moneda] = await sequelize.query("SELECT id FROM monedas WHERE id=:id AND activo=true", { replacements: { id: data.monedaId }, type: QueryTypes.SELECT });
    if (!moneda) throw new ApiError("La moneda no es válida.", 422);
    const [meta] = await sequelize.query(`INSERT INTO metas_ahorro(id,usuario_id,moneda_id,nombre,descripcion,monto_objetivo,fecha_inicio,fecha_objetivo) VALUES(gen_random_uuid(),:usuarioId,:monedaId,:nombre,:descripcion,:montoObjetivo,:fechaInicio,:fechaObjetivo) RETURNING *`, { replacements: { usuarioId, monedaId: data.monedaId, nombre: data.nombre.trim(), descripcion: data.descripcion || null, montoObjetivo: data.montoObjetivo, fechaInicio: data.fechaInicio || new Date().toISOString().slice(0, 10), fechaObjetivo: data.fechaObjetivo || null }, type: QueryTypes.INSERT });
    return meta;
  },
  async actualizar(usuarioId, id, data) {
    const [meta] = await metasRepository.obtener(id, usuarioId);
    if (!meta) throw new ApiError("Meta no encontrada.", 404);
    if (meta.estado !== "ACTIVA" || !data.nombre?.trim() || !validAmount(data.montoObjetivo)) throw new ApiError("La meta no se puede editar con esos datos.", 422);
    const [updated] = await sequelize.query(`UPDATE metas_ahorro SET nombre=:nombre,descripcion=:descripcion,monto_objetivo=:montoObjetivo,fecha_inicio=:fechaInicio,fecha_objetivo=:fechaObjetivo,updated_at=CURRENT_TIMESTAMP WHERE id=:id AND usuario_id=:usuarioId RETURNING *`, { replacements: { id, usuarioId, nombre: data.nombre.trim(), descripcion: data.descripcion || null, montoObjetivo: data.montoObjetivo, fechaInicio: data.fechaInicio, fechaObjetivo: data.fechaObjetivo || null }, type: QueryTypes.UPDATE });
    return updated;
  },
  async aportar(usuarioId, data) {
    if (!validAmount(data.monto) || !data.cuentaId || !data.fecha) throw new ApiError("El aporte, cuenta y fecha son obligatorios.", 422);
    return sequelize.transaction(async (transaction) => {
      const [meta] = await metasRepository.obtener(data.metaId, usuarioId, transaction);
      if (!meta || meta.estado !== "ACTIVA") throw new ApiError("La meta no admite aportes.", 422);
      const [cuenta] = await sequelize.query("SELECT id FROM cuentas WHERE id=:id AND usuario_id=:usuarioId AND moneda_id=:monedaId AND activo=true AND deleted_at IS NULL FOR UPDATE", { replacements: { id: data.cuentaId, usuarioId, monedaId: meta.moneda_id }, type: QueryTypes.SELECT, transaction });
      if (!cuenta) throw new ApiError("La cuenta debe ser propia, activa y de la misma moneda.", 422);
      const [totals] = await sequelize.query("SELECT COALESCE(SUM(monto),0)::text AS total FROM aportes_meta WHERE meta_id=:id", { replacements: { id: data.metaId }, type: QueryTypes.SELECT, transaction });
      const nuevoTotal = sumarDinero([totals.total, data.monto]);
      const [aporte] = await sequelize.query(`INSERT INTO aportes_meta(id,meta_id,cuenta_id,usuario_id,monto,fecha,observacion,movimiento_id) VALUES(gen_random_uuid(),:metaId,:cuentaId,:usuarioId,:monto,:fecha,:observacion,NULL) RETURNING *`, { replacements: { ...data, usuarioId, observacion: data.observacion || null }, type: QueryTypes.INSERT, transaction });
      if (Number(nuevoTotal) >= Number(meta.monto_objetivo)) await sequelize.query("UPDATE metas_ahorro SET estado='COMPLETADA',updated_at=CURRENT_TIMESTAMP WHERE id=:id", { replacements: { id: data.metaId }, transaction });
      return { aporte, ahorrado: nuevoTotal, estado: Number(nuevoTotal) >= Number(meta.monto_objetivo) ? "COMPLETADA" : "ACTIVA" };
    });
  },
  async cancelar(usuarioId, id) {
    const [meta] = await metasRepository.obtener(id, usuarioId);
    if (!meta) throw new ApiError("Meta no encontrada.", 404);
    await sequelize.query("UPDATE metas_ahorro SET estado='CANCELADA', updated_at=CURRENT_TIMESTAMP WHERE id=:id AND usuario_id=:usuarioId", { replacements: { id, usuarioId } });
    return { id, estado: "CANCELADA" };
  },
};
