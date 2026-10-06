import { Op } from "sequelize";
import { EjecucionMovimientoRecurrente, Movimiento, MovimientoRecurrente } from "@/models";

export const recurrentesRepository = {
  async listar(usuarioId) { return MovimientoRecurrente.findAll({ where: { usuarioId }, order: [["proximaEjecucion", "ASC"]] }); },
  async proximos(usuarioId, fecha, limit = 5) { return MovimientoRecurrente.findAll({ where: { usuarioId, activo: true, proximaEjecucion: { [Op.gte]: fecha } }, order: [["proximaEjecucion", "ASC"]], limit }); },
  async crear(datos) { return MovimientoRecurrente.create(datos); },
  async pendientes(fecha, usuarioId, transaction) {
    return MovimientoRecurrente.findAll({ where: { usuarioId, activo: true, proximaEjecucion: { [Op.lte]: fecha }, [Op.or]: [{ fechaFin: null }, { fechaFin: { [Op.gte]: fecha } }] }, transaction, lock: transaction.LOCK.UPDATE });
  },
  async crearMovimiento(datos, transaction) { return Movimiento.create(datos, { transaction }); },
  async registrarEjecucion(datos, transaction) { return EjecucionMovimientoRecurrente.create(datos, { transaction }); },
};
