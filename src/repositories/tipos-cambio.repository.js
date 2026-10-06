import { Op } from "sequelize";
import { TipoCambio } from "@/models";

export const tiposCambioRepository = {
  async buscarVigente(usuarioId, monedaOrigenId, monedaDestinoId, fecha) {
    return TipoCambio.findOne({
      where: { usuarioId, monedaOrigenId, monedaDestinoId, fecha: { [Op.lte]: fecha } },
      order: [["fecha", "DESC"], ["createdAt", "DESC"]],
    });
  },
};
