import { ApiError } from "@/lib/api-response";
import { sequelize } from "@/lib/sequelize";
import { categoriasRepository } from "@/repositories/categorias.repository";
import { cuentasRepository } from "@/repositories/cuentas.repository";
import { recurrentesRepository } from "@/repositories/recurrentes.repository";

function siguienteFecha(fecha, frecuencia) {
  const result = new Date(`${fecha}T00:00:00Z`);
  if (frecuencia === "DIARIO") result.setUTCDate(result.getUTCDate() + 1);
  if (frecuencia === "SEMANAL") result.setUTCDate(result.getUTCDate() + 7);
  if (frecuencia === "QUINCENAL") result.setUTCDate(result.getUTCDate() + 15);
  if (frecuencia === "MENSUAL") result.setUTCMonth(result.getUTCMonth() + 1);
  if (frecuencia === "ANUAL") result.setUTCFullYear(result.getUTCFullYear() + 1);
  return result.toISOString().slice(0, 10);
}

export const recurrentesService = {
  async crear(usuarioId, datos) {
    const [cuenta, categoria] = await Promise.all([cuentasRepository.buscarPorIdYUsuario(datos.cuentaId, usuarioId), categoriasRepository.buscarDisponible(usuarioId, datos.categoriaId, datos.tipo)]);
    if (!cuenta?.activo || !categoria) throw new ApiError("La cuenta o categoría no es válida.", 422);
    return recurrentesRepository.crear({ ...datos, usuarioId, proximaEjecucion: datos.proximaEjecucion || datos.fechaInicio });
  },
  async listar(usuarioId) { return recurrentesRepository.listar(usuarioId); },
  async ejecutarPendientes(usuarioId, fecha) {
    if (!sequelize) throw new ApiError("La base de datos no está configurada.", 503);
    return sequelize.transaction(async (transaction) => {
      const pendientes = await recurrentesRepository.pendientes(fecha, usuarioId, transaction);
      const created = [];
      for (const recurrente of pendientes) {
        const fechaProgramada = recurrente.proximaEjecucion;
        const movimiento = await recurrentesRepository.crearMovimiento({ usuarioId: recurrente.usuarioId, cuentaId: recurrente.cuentaId, categoriaId: recurrente.categoriaId, movimientoRecurrenteId: recurrente.id, tipo: recurrente.tipo, monto: recurrente.monto, fecha: fechaProgramada, descripcion: recurrente.descripcion, observaciones: recurrente.observaciones }, transaction);
        await recurrentesRepository.registrarEjecucion({ movimientoRecurrenteId: recurrente.id, fechaProgramada, movimientoId: movimiento.id }, transaction);
        const next = siguienteFecha(fechaProgramada, recurrente.frecuencia);
        await recurrente.update({ proximaEjecucion: next, activo: recurrente.fechaFin && next > recurrente.fechaFin ? false : recurrente.activo }, { transaction });
        created.push(movimiento);
      }
      return created;
    });
  },
};
