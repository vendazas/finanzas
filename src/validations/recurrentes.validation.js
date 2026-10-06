import { validarMovimiento } from "./movimientos.validation";
export function validarRecurrente(datos) {
  const errors = validarMovimiento(datos).filter((error) => error.field !== "fecha");
  if (!['DIARIO', 'SEMANAL', 'QUINCENAL', 'MENSUAL', 'ANUAL'].includes(datos?.frecuencia)) errors.push({ field: "frecuencia", message: "Selecciona una frecuencia." });
  if (!/^\d{4}-\d{2}-\d{2}$/.test(datos?.fechaInicio || "")) errors.push({ field: "fechaInicio", message: "La fecha de inicio es obligatoria." });
  return errors;
}
