const MONEY = /^(?:0|[1-9]\d*)(?:\.\d{1,2})?$/;
export function validarPresupuesto(datos) {
  const errors = [];
  if (!datos?.categoriaId) errors.push({ field: "categoriaId", message: "Selecciona una categoría." });
  if (!datos?.monedaId) errors.push({ field: "monedaId", message: "Selecciona una moneda." });
  if (datos?.periodicidad && !["SEMANAL", "MENSUAL"].includes(datos.periodicidad)) errors.push({ field: "periodicidad", message: "La periodicidad debe ser semanal o mensual." });
  if (!MONEY.test(datos?.montoPresupuestado || "") || /^0(?:\.0+)?$/.test(datos?.montoPresupuestado || "")) errors.push({ field: "montoPresupuestado", message: "El monto debe ser mayor que cero." });
  return errors;
}
