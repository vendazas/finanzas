const DECIMAL_PATTERN = /^-?\d+(\.\d{1,2})?$/;

export function validarCuenta(datos) {
  const errors = [];
  if (!datos?.nombre?.trim()) errors.push({ field: "nombre", message: "El nombre es obligatorio." });
  if (!datos?.tipoCuentaId) errors.push({ field: "tipoCuentaId", message: "Selecciona un tipo de cuenta." });
  if (!datos?.monedaId) errors.push({ field: "monedaId", message: "Selecciona una moneda." });
  if (!DECIMAL_PATTERN.test(String(datos?.saldoInicial ?? ""))) errors.push({ field: "saldoInicial", message: "El saldo inicial debe ser un importe válido." });
  if (!/^\d{4}-\d{2}-\d{2}$/.test(datos?.fechaSaldoInicial || "")) errors.push({ field: "fechaSaldoInicial", message: "La fecha de saldo inicial es obligatoria." });
  return errors;
}
