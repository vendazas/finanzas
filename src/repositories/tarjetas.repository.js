import { QueryTypes } from "sequelize";
import { sequelize } from "@/lib/sequelize";

export const tarjetasRepository = {
  listar(usuarioId) { return sequelize.query(`SELECT t.*,m.codigo moneda,COALESCE((SELECT SUM(monto) FROM consumos_tarjeta c WHERE c.tarjeta_id=t.id AND c.estado<>'ANULADO'),0)::text utilizado,COALESCE((SELECT SUM(monto) FROM pagos_tarjeta p WHERE p.tarjeta_id=t.id),0)::text pagado FROM tarjetas_credito t JOIN monedas m ON m.id=t.moneda_id WHERE t.usuario_id=:usuarioId AND t.deleted_at IS NULL ORDER BY t.created_at DESC`, { replacements: { usuarioId }, type: QueryTypes.SELECT }); },
  obtener(id, usuarioId, transaction) { return sequelize.query("SELECT * FROM tarjetas_credito WHERE id=:id AND usuario_id=:usuarioId AND deleted_at IS NULL", { replacements: { id, usuarioId }, type: QueryTypes.SELECT, transaction }); },
  detalle(id, usuarioId) { return Promise.all([this.obtener(id, usuarioId), sequelize.query("SELECT c.*,g.nombre categoria FROM consumos_tarjeta c LEFT JOIN categorias g ON g.id=c.categoria_id WHERE c.tarjeta_id=:id AND c.usuario_id=:usuarioId ORDER BY c.fecha DESC", { replacements:{id,usuarioId},type:QueryTypes.SELECT }), sequelize.query("SELECT p.*,c.nombre cuenta FROM pagos_tarjeta p JOIN cuentas c ON c.id=p.cuenta_id WHERE p.tarjeta_id=:id AND p.usuario_id=:usuarioId ORDER BY p.fecha DESC", { replacements:{id,usuarioId},type:QueryTypes.SELECT })]); },
};
