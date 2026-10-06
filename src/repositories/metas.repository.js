import { QueryTypes } from "sequelize";
import { sequelize } from "@/lib/sequelize";

export const metasRepository = {
  listar(usuarioId) {
    return sequelize.query(`SELECT g.*, m.codigo AS moneda, COALESCE(SUM(a.monto),0)::text AS ahorrado
      FROM metas_ahorro g JOIN monedas m ON m.id=g.moneda_id
      LEFT JOIN aportes_meta a ON a.meta_id=g.id WHERE g.usuario_id=:usuarioId AND g.deleted_at IS NULL
      GROUP BY g.id,m.codigo ORDER BY g.fecha_objetivo NULLS LAST, g.created_at DESC`,
    { replacements: { usuarioId }, type: QueryTypes.SELECT });
  },
  obtener(id, usuarioId, transaction) {
    return sequelize.query(`SELECT * FROM metas_ahorro WHERE id=:id AND usuario_id=:usuarioId AND deleted_at IS NULL`,
      { replacements: { id, usuarioId }, type: QueryTypes.SELECT, transaction });
  },
  aportes(id, usuarioId) {
    return sequelize.query(`SELECT a.*, c.nombre AS cuenta FROM aportes_meta a JOIN metas_ahorro g ON g.id=a.meta_id
      JOIN cuentas c ON c.id=a.cuenta_id WHERE a.meta_id=:id AND a.usuario_id=:usuarioId ORDER BY a.fecha DESC, a.created_at DESC`,
      { replacements: { id, usuarioId }, type: QueryTypes.SELECT });
  },
};
