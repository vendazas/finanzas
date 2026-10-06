import { Moneda, TipoCuenta } from "@/models";

export const catalogosRepository = {
  async listarMonedas() {
    return Moneda.findAll({ where: { activo: true }, order: [["codigo", "ASC"]] });
  },

  async listarTiposCuenta() {
    return TipoCuenta.findAll({ where: { activo: true }, order: [["nombre", "ASC"]] });
  },

  async buscarMonedaActiva(id) {
    return Moneda.findOne({ where: { id, activo: true } });
  },

  async buscarTipoCuentaActivo(id) {
    return TipoCuenta.findOne({ where: { id, activo: true } });
  },
};
