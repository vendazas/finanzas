import { QueryTypes } from "sequelize";
import { sequelize } from "@/lib/sequelize";

export const deudasRepository = {
  listar(usuarioId, filtro = "") {
    const where = ["d.usuario_id = :usuarioId", "d.deleted_at IS NULL"];
    if (["YO_DEBO", "ME_DEBEN"].includes(filtro)) where.push("d.tipo = :filtro");
    if (filtro === "PENDIENTES") where.push("d.estado IN ('PENDIENTE', 'PARCIAL', 'VENCIDO')");
    if (filtro === "PAGADOS") where.push("d.estado = 'PAGADO'");
    if (filtro === "VENCIDOS") where.push("d.estado = 'VENCIDO'");
    return sequelize.query(`SELECT d.*, m.codigo AS moneda,
      (d.monto_original - d.saldo_pendiente)::text AS pagado
      FROM deudas d JOIN monedas m ON m.id = d.moneda_id
      WHERE ${where.join(" AND ")} ORDER BY d.fecha_vencimiento NULLS LAST, d.created_at DESC`,
    { replacements: { usuarioId, filtro }, type: QueryTypes.SELECT });
  },

  obtener(id, usuarioId, transaction) {
    return sequelize.query(`SELECT d.*, m.codigo AS moneda FROM deudas d JOIN monedas m ON m.id=d.moneda_id
      WHERE d.id=:id AND d.usuario_id=:usuarioId AND d.deleted_at IS NULL`,
    { replacements: { id, usuarioId }, type: QueryTypes.SELECT, transaction });
  },

  pagos(id, usuarioId) {
    return sequelize.query(`SELECT p.*, c.nombre AS cuenta, m.codigo AS moneda
      FROM pagos_deuda p JOIN deudas d ON d.id=p.deuda_id
      LEFT JOIN cuentas c ON c.id=p.cuenta_id JOIN monedas m ON m.id=d.moneda_id
      WHERE p.deuda_id=:id AND p.usuario_id=:usuarioId ORDER BY p.fecha DESC, p.created_at DESC`,
    { replacements: { id, usuarioId }, type: QueryTypes.SELECT });
  },

  async crear(usuarioId, data) {
    const [rows] = await sequelize.query(`INSERT INTO deudas(id,usuario_id,tipo,persona_entidad,descripcion,monto_original,saldo_pendiente,moneda_id,fecha,fecha_vencimiento,interes)
      VALUES(gen_random_uuid(),:usuarioId,:tipo,:personaEntidad,:descripcion,:monto,:monto,:monedaId,:fecha,:fechaVencimiento,:interes) RETURNING *`,
    { replacements: {
      usuarioId,
      tipo: data.tipo,
      personaEntidad: data.personaEntidad,
      descripcion: data.descripcion || null,
      monto: data.montoOriginal,
      monedaId: data.monedaId,
      fecha: data.fecha,
      fechaVencimiento: data.fechaVencimiento || null,
      interes: data.interes || null,
    }, type: QueryTypes.INSERT });
    return rows[0];
  },

  actualizar(id, usuarioId, data) {
    return sequelize.query(`UPDATE deudas SET persona_entidad=:personaEntidad, descripcion=:descripcion, fecha=:fecha,
      fecha_vencimiento=:fechaVencimiento, interes=:interes, updated_at=CURRENT_TIMESTAMP
      WHERE id=:id AND usuario_id=:usuarioId AND deleted_at IS NULL RETURNING *`,
    { replacements: { id, usuarioId, ...data }, type: QueryTypes.UPDATE });
  },
};
