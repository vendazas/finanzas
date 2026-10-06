import { Op } from "sequelize";
import { Categoria } from "@/models";

export const categoriasRepository = {
  async listarDisponibles(usuarioId, tipo = null) {
    const where = { activo: true, [Op.or]: [{ usuarioId }, { usuarioId: null }] };
    if (tipo) where.tipo = tipo;
    return Categoria.findAll({ where, order: [["tipo", "ASC"], ["nombre", "ASC"]] });
  },

  async buscarDisponible(usuarioId, categoriaId, tipo) {
    return Categoria.findOne({
      where: { id: categoriaId, activo: true, tipo, [Op.or]: [{ usuarioId }, { usuarioId: null }] },
    });
  },
};
