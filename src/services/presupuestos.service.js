import { ApiError } from "@/lib/api-response";
import { categoriasRepository } from "@/repositories/categorias.repository";
import { catalogosRepository } from "@/repositories/catalogos.repository";
import { presupuestosRepository } from "@/repositories/presupuestos.repository";
import { restarDinero } from "@/utils/decimal";

export const presupuestosService = {
  async crear(usuarioId, datos) {
    const [categoria, moneda] = await Promise.all([categoriasRepository.buscarDisponible(usuarioId, datos.categoriaId, "GASTO"), catalogosRepository.buscarMonedaActiva(datos.monedaId)]);
    if (!categoria || !moneda) throw new ApiError("La categoría o moneda no es válida.", 422);
    return presupuestosRepository.crear({ ...datos, usuarioId, periodicidad: datos.periodicidad || "MENSUAL" });
  },
  async listar(usuarioId, periodo, periodicidad) {
    const presupuestos = await presupuestosRepository.listarConGasto(usuarioId, periodo, periodicidad);
    return presupuestos.map((item) => {
      const disponible = restarDinero(item.montoPresupuestado, item.gastado);
      const porcentaje = Math.round((Number(item.gastado) / Number(item.montoPresupuestado)) * 10000) / 100;
      return { ...item, disponible, porcentaje, estado: porcentaje >= 100 ? "PELIGRO" : porcentaje >= 80 ? "ADVERTENCIA" : "NORMAL" };
    });
  },
};
