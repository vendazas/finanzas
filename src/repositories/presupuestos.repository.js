import { QueryTypes } from "sequelize";
import { Presupuesto } from "@/models";
import { sequelize } from "@/lib/sequelize";

export const presupuestosRepository = {
  async crear(datos) { return Presupuesto.create(datos); },
  async listarConGasto(usuarioId, periodo, periodicidad) {
    return sequelize.query(`
      SELECT p.id, p.periodo, p.periodicidad, p.monto_presupuestado::text AS "montoPresupuestado", c.nombre AS categoria,
        mo.codigo AS moneda, COALESCE(SUM(m.monto), 0)::text AS gastado
      FROM presupuestos p
      INNER JOIN categorias c ON c.id = p.categoria_id
      INNER JOIN monedas mo ON mo.id = p.moneda_id
      LEFT JOIN movimientos m ON m.usuario_id = p.usuario_id AND m.categoria_id = p.categoria_id
        AND m.deleted_at IS NULL AND m.tipo = 'GASTO' AND m.fecha >= p.periodo
        AND m.fecha < (p.periodo + CASE WHEN p.periodicidad = 'SEMANAL' THEN INTERVAL '1 week' ELSE INTERVAL '1 month' END)
      WHERE p.usuario_id = :usuarioId AND p.periodo = :periodo AND p.periodicidad = :periodicidad AND p.deleted_at IS NULL AND p.activo = TRUE
      GROUP BY p.id, c.nombre, mo.codigo
      ORDER BY c.nombre`, { replacements: { usuarioId, periodo, periodicidad }, type: QueryTypes.SELECT });
  },
};
