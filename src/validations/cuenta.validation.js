export function validarCuenta(datos) {
  const errores = {};

  if (!datos?.nombre?.trim()) {
    errores.nombre = "El nombre de la cuenta es obligatorio.";
  }

  if (!datos?.tipo) {
    errores.tipo = "El tipo de cuenta es obligatorio.";
  }

  return errores;
}
