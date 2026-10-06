export function validarTransferencia(datos) {
  const errores = {};

  if (!datos?.usuarioId) errores.usuarioId = "El usuario es obligatorio.";
  if (!datos?.cuentaOrigenId) errores.cuentaOrigenId = "La cuenta de origen es obligatoria.";
  if (!datos?.cuentaDestinoId) errores.cuentaDestinoId = "La cuenta de destino es obligatoria.";
  if (datos?.cuentaOrigenId && datos?.cuentaOrigenId === datos?.cuentaDestinoId) {
    errores.cuentaDestinoId = "La cuenta de destino debe ser diferente.";
  }
  if (!datos?.fecha) errores.fecha = "La fecha es obligatoria.";

  return errores;
}
