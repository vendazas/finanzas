import { QueryTypes } from "sequelize";
import { sequelize } from "@/lib/sequelize";

const IMPACTO_SALDO = `
  CASE
    WHEN m.tipo IN ('INGRESO', 'TRANSFERENCIA_ENTRADA', 'AJUSTE') THEN m.monto
    WHEN m.tipo IN ('GASTO', 'TRANSFERENCIA_SALIDA') THEN -m.monto
    ELSE 0
  END
`;

export const finanzasRepository = {
  async saldosPorCuenta(usuarioId, cuentaIds) {
    if (!cuentaIds.length) return [];

    return sequelize.query(
      `
        SELECT c.id AS "cuentaId",
          (c.saldo_inicial + COALESCE(SUM(${IMPACTO_SALDO}) FILTER (WHERE m.deleted_at IS NULL), 0))::text AS saldo
        FROM cuentas c
        LEFT JOIN movimientos m ON m.cuenta_id = c.id AND m.usuario_id = :usuarioId
        WHERE c.usuario_id = :usuarioId AND c.id IN (:cuentaIds) AND c.deleted_at IS NULL
        GROUP BY c.id, c.saldo_inicial
      `,
      { replacements: { usuarioId, cuentaIds }, type: QueryTypes.SELECT }
    );
  },

  async resumenMensual(usuarioId, fechaInicio, fechaFin) {
    return sequelize.query(
      `
        SELECT mo.codigo AS moneda,
          COALESCE(SUM(CASE WHEN m.tipo = 'INGRESO' THEN m.monto ELSE 0 END), 0)::text AS ingresos,
          COALESCE(SUM(CASE WHEN m.tipo = 'GASTO' THEN m.monto ELSE 0 END), 0)::text AS gastos
        FROM movimientos m
        INNER JOIN cuentas c ON c.id = m.cuenta_id
        INNER JOIN monedas mo ON mo.id = c.moneda_id
        WHERE m.usuario_id = :usuarioId AND m.deleted_at IS NULL AND m.fecha BETWEEN :fechaInicio AND :fechaFin
        GROUP BY mo.codigo
      `,
      { replacements: { usuarioId, fechaInicio, fechaFin }, type: QueryTypes.SELECT }
    );
  },

  async gastosPorCategoria(usuarioId, fechaInicio, fechaFin) {
    return sequelize.query(
      `
        SELECT COALESCE(cat.nombre, 'Sin categoría') AS categoria, mo.codigo AS moneda,
          SUM(m.monto)::text AS monto
        FROM movimientos m
        INNER JOIN cuentas c ON c.id = m.cuenta_id
        INNER JOIN monedas mo ON mo.id = c.moneda_id
        LEFT JOIN categorias cat ON cat.id = m.categoria_id
        WHERE m.usuario_id = :usuarioId AND m.deleted_at IS NULL AND m.tipo = 'GASTO'
          AND m.fecha BETWEEN :fechaInicio AND :fechaFin
        GROUP BY cat.nombre, mo.codigo
        ORDER BY SUM(m.monto) DESC
        LIMIT 8
      `,
      { replacements: { usuarioId, fechaInicio, fechaFin }, type: QueryTypes.SELECT }
    );
  },

  async ultimosMovimientos(usuarioId, limit = 8) {
    return sequelize.query(
      `
        SELECT m.id, m.tipo, m.monto::text AS monto, m.fecha, m.descripcion,
          c.nombre AS cuenta, mo.codigo AS moneda, cat.nombre AS categoria
        FROM movimientos m
        INNER JOIN cuentas c ON c.id = m.cuenta_id
        INNER JOIN monedas mo ON mo.id = c.moneda_id
        LEFT JOIN categorias cat ON cat.id = m.categoria_id
        WHERE m.usuario_id = :usuarioId AND m.deleted_at IS NULL
        ORDER BY m.fecha DESC, m.created_at DESC
        LIMIT :limit
      `,
      { replacements: { usuarioId, limit }, type: QueryTypes.SELECT }
    );
  },

  async movimientosDeCuenta(usuarioId, cuentaId) {
    return sequelize.query(
      `
        SELECT m.id, m.tipo, m.monto::text AS monto, m.fecha, m.descripcion, m.observaciones,
          m.comprobante_url AS "comprobanteUrl", cat.nombre AS categoria
        FROM movimientos m
        LEFT JOIN categorias cat ON cat.id = m.categoria_id
        WHERE m.usuario_id = :usuarioId AND m.cuenta_id = :cuentaId AND m.deleted_at IS NULL
        ORDER BY m.fecha DESC, m.created_at DESC
      `,
      { replacements: { usuarioId, cuentaId }, type: QueryTypes.SELECT }
    );
  },
};
