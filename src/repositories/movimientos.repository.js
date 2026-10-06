import { QueryTypes } from "sequelize";
import { Movimiento } from "@/models";
import { sequelize } from "@/lib/sequelize";

function construirFiltros(usuarioId, filtros) {
  const conditions = ["m.usuario_id = :usuarioId", "m.deleted_at IS NULL"];
  const replacements = { usuarioId };
  if (filtros.fechaDesde) { conditions.push("m.fecha >= :fechaDesde"); replacements.fechaDesde = filtros.fechaDesde; }
  if (filtros.fechaHasta) { conditions.push("m.fecha <= :fechaHasta"); replacements.fechaHasta = filtros.fechaHasta; }
  if (filtros.cuentaId) { conditions.push("m.cuenta_id = :cuentaId"); replacements.cuentaId = filtros.cuentaId; }
  if (filtros.categoriaId) { conditions.push("m.categoria_id = :categoriaId"); replacements.categoriaId = filtros.categoriaId; }
  if (filtros.tipo) { conditions.push("m.tipo = :tipo"); replacements.tipo = filtros.tipo; }
  if (filtros.moneda) { conditions.push("mo.codigo = :moneda"); replacements.moneda = filtros.moneda; }
  if (filtros.texto) { conditions.push("(m.descripcion ILIKE :texto OR m.observaciones ILIKE :texto OR cat.nombre ILIKE :texto)"); replacements.texto = `%${filtros.texto}%`; }
  return { where: conditions.join(" AND "), replacements };
}

export const movimientosRepository = {
  async crear(datos, transaction) { return Movimiento.create(datos, { transaction }); },

  async listarPaginado(usuarioId, filtros) {
    const { where, replacements } = construirFiltros(usuarioId, filtros);
    const offset = (filtros.page - 1) * filtros.limit;
    const baseFrom = "FROM movimientos m INNER JOIN cuentas c ON c.id = m.cuenta_id INNER JOIN monedas mo ON mo.id = c.moneda_id LEFT JOIN categorias cat ON cat.id = m.categoria_id";
    const [items, countRows, resumen] = await Promise.all([
      sequelize.query(`SELECT m.id, m.fecha, m.tipo, m.monto::text AS monto, m.descripcion, c.nombre AS cuenta, cat.nombre AS categoria, mo.codigo AS moneda ${baseFrom} WHERE ${where} ORDER BY m.fecha DESC, m.created_at DESC LIMIT :limit OFFSET :offset`, { replacements: { ...replacements, limit: filtros.limit, offset }, type: QueryTypes.SELECT }),
      sequelize.query(`SELECT COUNT(*)::int AS total ${baseFrom} WHERE ${where}`, { replacements, type: QueryTypes.SELECT }),
      sequelize.query(`SELECT mo.codigo AS moneda, COALESCE(SUM(CASE WHEN m.tipo = 'INGRESO' THEN m.monto ELSE 0 END), 0)::text AS ingresos, COALESCE(SUM(CASE WHEN m.tipo = 'GASTO' THEN m.monto ELSE 0 END), 0)::text AS gastos ${baseFrom} WHERE ${where} GROUP BY mo.codigo`, { replacements, type: QueryTypes.SELECT }),
    ]);
    return { items, total: countRows[0].total, resumen };
  },
};
