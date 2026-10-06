import { QueryTypes } from "sequelize";
import { ApiError } from "@/lib/api-response";
import { sequelize } from "@/lib/sequelize";
import { auditoriaFinancieraRepository } from "@/repositories/auditoria-financiera.repository";
import { deudasRepository } from "@/repositories/deudas.repository";
import { restarDinero } from "@/utils/decimal";

function positive(value) { return /^\d+(\.\d{1,2})?$/.test(String(value)) && Number(value) > 0; }

export const deudasService = {
  listar(usuarioId, filtro) { return deudasRepository.listar(usuarioId, filtro); },
  async obtener(usuarioId, id) {
    const [deuda] = await deudasRepository.obtener(id, usuarioId);
    if (!deuda) throw new ApiError("Deuda no encontrada.", 404);
    return { ...deuda, pagos: await deudasRepository.pagos(id, usuarioId) };
  },
  async crear(usuarioId, data) {
    if (!["YO_DEBO", "ME_DEBEN"].includes(data.tipo) || !data.personaEntidad?.trim() || !positive(data.montoOriginal)) throw new ApiError("Revisa los datos de la deuda.", 422);
    const [moneda] = await sequelize.query("SELECT id FROM monedas WHERE id=:id AND activo=true", { replacements: { id: data.monedaId }, type: QueryTypes.SELECT });
    if (!moneda) throw new ApiError("La moneda no es válida.", 422);
    const deuda = await deudasRepository.crear(usuarioId, data);
    await auditoriaFinancieraRepository.registrar({ usuarioId, entidad: "DEUDA", entidadId: deuda.id, accion: "CREACION", datosNuevos: deuda });
    return deuda;
  },
  async actualizar(usuarioId, id, data) {
    const [actual] = await deudasRepository.obtener(id, usuarioId);
    if (!actual) throw new ApiError("Deuda no encontrada.", 404);
    if (!data.personaEntidad?.trim()) throw new ApiError("La persona o entidad es obligatoria.", 422);
    const [updated] = await deudasRepository.actualizar(id, usuarioId, data);
    await auditoriaFinancieraRepository.registrar({ usuarioId, entidad: "DEUDA", entidadId: id, accion: "MODIFICACION", datosAnteriores: actual, datosNuevos: updated });
    return updated;
  },
  async pagar(usuarioId, data) {
    if (!positive(data.monto) || !data.cuentaId || !data.fecha) throw new ApiError("El pago y la cuenta son obligatorios.", 422);
    return sequelize.transaction(async (transaction) => {
      const [deuda] = await deudasRepository.obtener(data.deudaId, usuarioId, transaction);
      if (!deuda || ["PAGADO", "CANCELADO"].includes(deuda.estado)) throw new ApiError("La deuda no admite pagos.", 422);
      const [cuenta] = await sequelize.query(`SELECT c.id FROM cuentas c WHERE c.id=:id AND c.usuario_id=:usuarioId AND c.moneda_id=:monedaId AND c.activo=true AND c.deleted_at IS NULL FOR UPDATE`, { replacements: { id: data.cuentaId, usuarioId, monedaId: deuda.moneda_id }, type: QueryTypes.SELECT, transaction });
      if (!cuenta) throw new ApiError("La cuenta debe estar activa, ser propia y usar la misma moneda.", 422);
      if (BigInt(String(data.monto).replace(".", "")) > BigInt(String(deuda.saldo_pendiente).replace(".", ""))) throw new ApiError("El pago excede el saldo pendiente.", 422);
      const saldo = restarDinero(deuda.saldo_pendiente, data.monto);
      const estado = saldo === "0.00" ? "PAGADO" : "PARCIAL";
      const tipo = deuda.tipo === "YO_DEBO" ? "GASTO" : "INGRESO";
      const [movimiento] = await sequelize.query(`INSERT INTO movimientos(id,usuario_id,cuenta_id,tipo,monto,fecha,descripcion,observaciones) VALUES(gen_random_uuid(),:usuarioId,:cuentaId,:tipo,:monto,:fecha,:descripcion,:observacion) RETURNING *`, { replacements: { usuarioId, cuentaId: data.cuentaId, tipo, monto: data.monto, fecha: data.fecha, descripcion: `Pago de deuda: ${deuda.persona_entidad}`, observacion: data.observacion || null }, type: QueryTypes.INSERT, transaction });
      const [pago] = await sequelize.query(`INSERT INTO pagos_deuda(id,deuda_id,cuenta_id,usuario_id,monto,fecha,observacion,movimiento_id) VALUES(gen_random_uuid(),:deudaId,:cuentaId,:usuarioId,:monto,:fecha,:observacion,:movimientoId) RETURNING *`, { replacements: { deudaId: data.deudaId, cuentaId: data.cuentaId, usuarioId, monto: data.monto, fecha: data.fecha, observacion: data.observacion || null, movimientoId: movimiento.id }, type: QueryTypes.INSERT, transaction });
      await sequelize.query("UPDATE deudas SET saldo_pendiente=:saldo, estado=:estado, updated_at=CURRENT_TIMESTAMP WHERE id=:id", { replacements: { saldo, estado, id: data.deudaId }, transaction });
      return { pago, movimiento, saldoPendiente: saldo, estado };
    });
  },
  async cancelar(usuarioId, id) {
    const [deuda] = await deudasRepository.obtener(id, usuarioId);
    if (!deuda) throw new ApiError("Deuda no encontrada.", 404);
    if (deuda.estado === "PAGADO") throw new ApiError("Una deuda pagada no se puede cancelar.", 422);
    await sequelize.query("UPDATE deudas SET estado='CANCELADO', updated_at=CURRENT_TIMESTAMP WHERE id=:id AND usuario_id=:usuarioId", { replacements: { id, usuarioId } });
    return { id, estado: "CANCELADO" };
  },
};
