import { cuentasRepository } from "@/repositories/cuentas.repository";
import { catalogosRepository } from "@/repositories/catalogos.repository";
import { finanzasService } from "@/services/finanzas.service";
import { ApiError } from "@/lib/api-response";

export const cuentasService = {
  async listar(usuarioId, filtros = {}) {
    const cuentas = await cuentasRepository.listarPorUsuario(usuarioId, filtros);
    return finanzasService.calcularSaldosCuentas(usuarioId, cuentas);
  },

  async obtener(usuarioId, cuentaId) {
    const cuenta = await cuentasRepository.buscarPorIdYUsuario(cuentaId, usuarioId);
    if (!cuenta) throw new ApiError("Cuenta no encontrada.", 404);
    const [cuentaConSaldo] = await finanzasService.calcularSaldosCuentas(usuarioId, [cuenta]);
    return cuentaConSaldo;
  },

  async crear(usuarioId, datos) {
    await this.validarCatalogos(datos);
    return cuentasRepository.crear({ ...datos, usuarioId });
  },

  async actualizar(usuarioId, cuentaId, datos) {
    await this.validarCatalogos(datos);
    const cuenta = await cuentasRepository.actualizar(cuentaId, usuarioId, datos);
    if (!cuenta) throw new ApiError("Cuenta no encontrada.", 404);
    return cuenta;
  },

  async cambiarEstado(usuarioId, cuentaId, activo) {
    const cuenta = await cuentasRepository.cambiarEstado(cuentaId, usuarioId, activo);
    if (!cuenta) throw new ApiError("Cuenta no encontrada.", 404);
    return cuenta;
  },

  async movimientos(usuarioId, cuentaId) {
    await this.obtener(usuarioId, cuentaId);
    return finanzasService.obtenerMovimientosCuenta(usuarioId, cuentaId);
  },

  async catalogos() {
    const [monedas, tiposCuenta] = await Promise.all([
      catalogosRepository.listarMonedas(),
      catalogosRepository.listarTiposCuenta(),
    ]);
    return { monedas, tiposCuenta };
  },

  async validarCatalogos(datos) {
    const [moneda, tipoCuenta] = await Promise.all([
      catalogosRepository.buscarMonedaActiva(datos.monedaId),
      catalogosRepository.buscarTipoCuentaActivo(datos.tipoCuentaId),
    ]);
    if (!moneda || !tipoCuenta) throw new ApiError("La moneda o el tipo de cuenta no son válidos.", 422);
  },
};
