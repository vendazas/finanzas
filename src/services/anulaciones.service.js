import { ApiError } from "@/lib/api-response";
import { sequelize } from "@/lib/sequelize";
import { Movimiento } from "@/models";
import { auditoriaFinancieraRepository } from "@/repositories/auditoria-financiera.repository";

export const anulacionesService = {
  async anularMovimiento(usuarioId, movimientoId, motivo = null) {
    if (!sequelize) throw new ApiError("La base de datos no está configurada.", 503);

    return sequelize.transaction(async (transaction) => {
      const movimiento = await Movimiento.findOne({
        where: { id: movimientoId, usuarioId },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (!movimiento) throw new ApiError("No se encontró el movimiento.", 404);
      if (movimiento.transferenciaId) {
        throw new ApiError("Las transferencias se anulan como una operación completa.", 422);
      }

      const anterior = movimiento.get({ plain: true });
      await movimiento.destroy({ transaction });
      await auditoriaFinancieraRepository.registrar({
        usuarioId,
        entidad: "MOVIMIENTO",
        entidadId: movimiento.id,
        accion: "ANULACION",
        datosAnteriores: anterior,
        datosNuevos: { motivo: motivo || null, anuladoAt: new Date().toISOString() },
      }, transaction);

      return { id: movimiento.id, anulado: true };
    });
  },
};
