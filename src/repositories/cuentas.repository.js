import { Op } from "sequelize";
import { Cuenta, Moneda, TipoCuenta } from "@/models";

const includeCatalogos = [
  { model: TipoCuenta, as: "tipoCuenta", attributes: ["id", "nombre", "icono"] },
  { model: Moneda, as: "moneda", attributes: ["id", "codigo", "nombre", "simbolo", "decimales"] },
];

export const cuentasRepository = {
  async listarPorUsuario(usuarioId, filtros = {}) {
    if (!Cuenta) {
      return [];
    }

    const where = { usuarioId };
    if (!filtros.incluirInactivas) where.activo = true;
    if (filtros.buscar) where.nombre = { [Op.iLike]: `%${filtros.buscar}%` };
    if (filtros.tipoCuentaId) where.tipoCuentaId = filtros.tipoCuentaId;
    if (filtros.monedaId) where.monedaId = filtros.monedaId;

    return Cuenta.findAll({
      where,
      include: includeCatalogos,
      order: [["createdAt", "DESC"]],
    });
  },

  async buscarPorIdYUsuario(id, usuarioId) {
    return Cuenta.findOne({ where: { id, usuarioId }, include: includeCatalogos });
  },

  async crear(datos) {
    return Cuenta.create(datos);
  },

  async actualizar(id, usuarioId, datos) {
    const cuenta = await Cuenta.findOne({ where: { id, usuarioId } });
    if (!cuenta) return null;
    return cuenta.update(datos);
  },

  async cambiarEstado(id, usuarioId, activo) {
    return this.actualizar(id, usuarioId, { activo });
  },

  async buscarActivasPorUsuario(ids, usuarioId, transaction) {
    return Cuenta.findAll({
      where: { id: ids, usuarioId, activo: true },
      include: [{ model: Moneda, as: "moneda", attributes: ["id", "codigo"] }],
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
  },
};
