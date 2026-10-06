import { Movimiento, Transferencia } from "@/models";

export const transferenciasRepository = {
  async crear(datos, transaction) {
    return Transferencia.create(datos, { transaction });
  },

  async crearMovimientos(movimientos, transaction) {
    return Movimiento.bulkCreate(movimientos, { transaction });
  },
};
