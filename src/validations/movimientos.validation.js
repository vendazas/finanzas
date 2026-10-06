const MONEY = /^(?:0|[1-9]\d*)(?:\.\d{1,2})?$/;

export function validarMovimiento(datos) {
  const errors = [];
  if (!["INGRESO", "GASTO"].includes(datos?.tipo)) errors.push({ field: "tipo", message: "Selecciona ingreso o gasto." });
  if (!datos?.cuentaId) errors.push({ field: "cuentaId", message: "Selecciona una cuenta." });
  if (!datos?.categoriaId) errors.push({ field: "categoriaId", message: "Selecciona una categoría." });
  if (!MONEY.test(datos?.monto || "") || /^0(?:\.0+)?$/.test(datos?.monto || "")) errors.push({ field: "monto", message: "El monto debe ser mayor que cero." });
  if (!/^\d{4}-\d{2}-\d{2}$/.test(datos?.fecha || "")) errors.push({ field: "fecha", message: "La fecha es obligatoria." });
  return errors;
}
