import { cuentasRepository } from "@/repositories/cuentas.repository";
import { finanzasService } from "@/services/finanzas.service";
import { presupuestosService } from "@/services/presupuestos.service";
import { recurrentesRepository } from "@/repositories/recurrentes.repository";

export const dashboardService = {
  async obtenerResumen(usuario) {
    const cuentas = await cuentasRepository.listarPorUsuario(usuario.id, { incluirInactivas: false });
    const resumen = await finanzasService.resumenDashboard(usuario, cuentas);
    const periodo = `${new Date().toISOString().slice(0, 7)}-01`;
    return { ...resumen, presupuestos: await presupuestosService.listar(usuario.id, periodo), proximosMovimientos: await recurrentesRepository.proximos(usuario.id, new Date().toISOString().slice(0, 10)) };
  },
};
