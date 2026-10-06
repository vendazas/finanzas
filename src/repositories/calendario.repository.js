import { QueryTypes } from "sequelize";
import { sequelize } from "@/lib/sequelize";

export const calendarioRepository = {
  listar(usuarioId, desde, hasta) {
    return sequelize.query(`SELECT proxima_ejecucion AS fecha,descripcion,tipo,monto::text AS monto,'RECURRENTE' AS origen,NULL::text AS moneda FROM movimientos_recurrentes WHERE usuario_id=:usuarioId AND activo=true AND proxima_ejecucion BETWEEN :desde AND :hasta UNION ALL SELECT fecha_vencimiento AS fecha,persona_entidad AS descripcion,tipo,saldo_pendiente::text AS monto,'DEUDA' AS origen,mo.codigo AS moneda FROM deudas d JOIN monedas mo ON mo.id=d.moneda_id WHERE d.usuario_id=:usuarioId AND estado IN('PENDIENTE','PARCIAL') AND fecha_vencimiento BETWEEN :desde AND :hasta UNION ALL SELECT m.fecha,m.descripcion,m.tipo,m.monto::text AS monto,'MOVIMIENTO' AS origen,mo.codigo AS moneda FROM movimientos m JOIN cuentas c ON c.id=m.cuenta_id JOIN monedas mo ON mo.id=c.moneda_id WHERE m.usuario_id=:usuarioId AND m.deleted_at IS NULL AND m.fecha BETWEEN :desde AND :hasta ORDER BY fecha`, { replacements: { usuarioId, desde, hasta }, type: QueryTypes.SELECT });
  },
};
