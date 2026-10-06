import { ApiError } from "@/lib/api-response";
import { sequelize } from "@/lib/sequelize";
import { cuentasRepository } from "@/repositories/cuentas.repository";
import { transferenciasRepository } from "@/repositories/transferencias.repository";
import { auditoriaFinancieraRepository } from "@/repositories/auditoria-financiera.repository";
import { convertirDinero } from "@/utils/decimal";

function esMontoPositivo(monto, decimals = 2) {
  const expression = new RegExp(`^(?:0|[1-9]\\d*)(?:\\.\\d{1,${decimals}})?$`);
  return typeof monto === "string" && expression.test(monto) && !/^0(?:\.0+)?$/.test(monto);
}

export const transferenciasService = {
  async crear(datos) {
    if (!sequelize) throw new ApiError("La base de datos no está configurada.", 503);
    if (datos.cuentaOrigenId === datos.cuentaDestinoId) throw new ApiError("La cuenta de origen y destino deben ser diferentes.", 422);
    if (!esMontoPositivo(datos.montoOrigen) || !esMontoPositivo(datos.montoDestino)) {
      throw new ApiError("Los montos de una transferencia deben ser decimales positivos.", 422);
    }

    return sequelize.transaction(async (transaction) => {
      const cuentas = await cuentasRepository.buscarActivasPorUsuario([datos.cuentaOrigenId, datos.cuentaDestinoId], datos.usuarioId, transaction);
      if (cuentas.length !== 2) throw new ApiError("Las cuentas deben estar activas y pertenecer al usuario.", 422);

      const origen = cuentas.find((cuenta) => cuenta.id === datos.cuentaOrigenId);
      const destino = cuentas.find((cuenta) => cuenta.id === datos.cuentaDestinoId);
      if (origen.moneda.id === destino.moneda.id) {
        datos.montoDestino = datos.montoOrigen;
        datos.tipoCambio = null;
      } else {
        if (!esMontoPositivo(datos.tipoCambio, 8)) throw new ApiError("Ingresa un tipo de cambio válido.", 422);
        if (convertirDinero(datos.montoOrigen, datos.tipoCambio) !== datos.montoDestino) {
          throw new ApiError("El monto destino no coincide con el tipo de cambio indicado.", 422);
        }
      }

      const transferencia = await transferenciasRepository.crear(datos, transaction);
      const movimientos = await transferenciasRepository.crearMovimientos([
        { usuarioId: datos.usuarioId, cuentaId: datos.cuentaOrigenId, categoriaId: null, tipo: "TRANSFERENCIA_SALIDA", monto: datos.montoOrigen, fecha: datos.fecha, descripcion: datos.descripcion || null, transferenciaId: transferencia.id },
        { usuarioId: datos.usuarioId, cuentaId: datos.cuentaDestinoId, categoriaId: null, tipo: "TRANSFERENCIA_ENTRADA", monto: datos.montoDestino, fecha: datos.fecha, descripcion: datos.descripcion || null, transferenciaId: transferencia.id },
      ], transaction);
      await auditoriaFinancieraRepository.registrar({
        usuarioId: datos.usuarioId,
        entidad: "TRANSFERENCIA",
        entidadId: transferencia.id,
        accion: "CREACION",
        datosNuevos: {
          transferencia: transferencia.get({ plain: true }),
          movimientos: movimientos.map((movimiento) => movimiento.get({ plain: true })),
        },
      }, transaction);
      return { transferencia, movimientos };
    });
  },
};
