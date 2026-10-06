import { ApiError } from "@/lib/api-response";
import { categoriasRepository } from "@/repositories/categorias.repository";
import { cuentasRepository } from "@/repositories/cuentas.repository";
import { movimientosRepository } from "@/repositories/movimientos.repository";
import { auditoriaFinancieraRepository } from "@/repositories/auditoria-financiera.repository";
import { sequelize } from "@/lib/sequelize";
import { restarDinero } from "@/utils/decimal";

export const movimientosService = {
  async crear(usuarioId, datos) {
    const [cuenta, categoria] = await Promise.all([
      cuentasRepository.buscarPorIdYUsuario(datos.cuentaId, usuarioId),
      categoriasRepository.buscarDisponible(usuarioId, datos.categoriaId, datos.tipo),
    ]);
    if (!cuenta?.activo) throw new ApiError("La cuenta no existe o está inactiva.", 422);
    if (!categoria) throw new ApiError("La categoría no es válida para este movimiento.", 422);

    if (!sequelize) throw new ApiError("La base de datos no está configurada.", 503);
    return sequelize.transaction(async (transaction) => {
      const movimiento = await movimientosRepository.crear({
        usuarioId,
        cuentaId: datos.cuentaId,
        categoriaId: datos.categoriaId,
        tipo: datos.tipo,
        monto: datos.monto,
        fecha: datos.fecha,
        descripcion: datos.descripcion || null,
        observaciones: datos.observaciones || null,
      }, transaction);
      await auditoriaFinancieraRepository.registrar({
        usuarioId,
        entidad: "MOVIMIENTO",
        entidadId: movimiento.id,
        accion: "CREACION",
        datosNuevos: movimiento.get({ plain: true }),
      }, transaction);
      return movimiento;
    });
  },

  async listar(usuarioId, filtros) {
    const data = await movimientosRepository.listarPaginado(usuarioId, filtros);
    return {
      ...data,
      page: filtros.page,
      limit: filtros.limit,
      totalPages: Math.ceil(data.total / filtros.limit),
      resumen: data.resumen.map((row) => ({ ...row, balance: restarDinero(row.ingresos, row.gastos) })),
    };
  },

  async catalogos(usuarioId, tipo) {
    const [cuentas, categorias] = await Promise.all([
      cuentasRepository.listarPorUsuario(usuarioId, { incluirInactivas: false }),
      categoriasRepository.listarDisponibles(usuarioId, tipo),
    ]);
    return { cuentas, categorias };
  },
};
