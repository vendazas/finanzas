import { finanzasRepository } from "@/repositories/finanzas.repository";
import { tiposCambioRepository } from "@/repositories/tipos-cambio.repository";
import { convertirDinero, restarDinero, sumarDinero } from "@/utils/decimal";

function fechaActual() {
  return new Date().toISOString().slice(0, 10);
}

function rangoMesActual() {
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0, 10);
  return { fechaInicio: start, fechaFin: fechaActual() };
}

export const finanzasService = {
  async calcularSaldosCuentas(usuarioId, cuentas) {
    const rows = await finanzasRepository.saldosPorCuenta(usuarioId, cuentas.map((cuenta) => cuenta.id));
    const saldos = new Map(rows.map((row) => [row.cuentaId, row.saldo]));

    return cuentas.map((cuenta) => ({ ...cuenta.toJSON(), saldo: saldos.get(cuenta.id) || "0.00" }));
  },

  async obtenerMovimientosCuenta(usuarioId, cuentaId) {
    return finanzasRepository.movimientosDeCuenta(usuarioId, cuentaId);
  },

  async resumenDashboard(usuario, cuentas) {
    const cuentasConSaldo = await this.calcularSaldosCuentas(usuario.id, cuentas);
    const porMoneda = new Map();

    for (const cuenta of cuentasConSaldo) {
      const codigo = cuenta.moneda.codigo;
      const actual = porMoneda.get(codigo) || [];
      actual.push(cuenta.saldo);
      porMoneda.set(codigo, actual);
    }

    const totalesPorMoneda = [...porMoneda.entries()].map(([moneda, valores]) => ({
      moneda,
      saldo: sumarDinero(valores),
    }));
    const { fechaInicio, fechaFin } = rangoMesActual();
    const flujoMensual = await finanzasRepository.resumenMensual(usuario.id, fechaInicio, fechaFin);
    const resumenMensual = flujoMensual.map((row) => ({
      ...row,
      ahorro: restarDinero(row.ingresos, row.gastos),
    }));

    return {
      cuentas: cuentasConSaldo,
      cantidadCuentas: cuentasConSaldo.length,
      totalesPorMoneda,
      resumenMensual,
      patrimonioConvertido: await this.calcularPatrimonioConvertido(usuario, cuentasConSaldo),
      gastosPorCategoria: await finanzasRepository.gastosPorCategoria(usuario.id, fechaInicio, fechaFin),
      ultimosMovimientos: await finanzasRepository.ultimosMovimientos(usuario.id),
    };
  },

  async calcularPatrimonioConvertido(usuario, cuentas) {
    const cuentasPatrimonio = cuentas.filter((cuenta) => cuenta.incluirPatrimonio);
    const monedaBase = cuentas.find((cuenta) => cuenta.moneda.codigo === usuario.monedaBase)?.moneda;
    if (!monedaBase) return null;

    const valores = [];
    for (const cuenta of cuentasPatrimonio) {
      if (cuenta.moneda.id === monedaBase.id) {
        valores.push(cuenta.saldo);
        continue;
      }

      const tasa = await tiposCambioRepository.buscarVigente(usuario.id, cuenta.moneda.id, monedaBase.id, fechaActual());
      if (!tasa) return null;
      valores.push(convertirDinero(cuenta.saldo, tasa.valor));
    }

    return { moneda: monedaBase.codigo, saldo: sumarDinero(valores) };
  },
};
