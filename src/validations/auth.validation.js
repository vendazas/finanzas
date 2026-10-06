const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validarRegistro(datos) {
  const errors = [];
  if (!datos?.nombre?.trim()) errors.push({ field: "nombre", message: "El nombre es obligatorio." });
  if (!datos?.apellido?.trim()) errors.push({ field: "apellido", message: "El apellido es obligatorio." });
  if (!EMAIL_PATTERN.test(datos?.email || "")) errors.push({ field: "email", message: "Ingresa un correo válido." });
  if (!datos?.password || datos.password.length < 10) errors.push({ field: "password", message: "La contraseña debe tener al menos 10 caracteres." });
  return errors;
}

export function validarLogin(datos) {
  const errors = [];
  if (!EMAIL_PATTERN.test(datos?.email || "")) errors.push({ field: "email", message: "Ingresa un correo válido." });
  if (!datos?.password) errors.push({ field: "password", message: "La contraseña es obligatoria." });
  return errors;
}

export function validarCambioPassword(datos) {
  const errors = [];
  if (!datos?.currentPassword) errors.push({ field: "currentPassword", message: "Ingresa tu contraseña actual." });
  if (!datos?.newPassword || datos.newPassword.length < 10) errors.push({ field: "newPassword", message: "La nueva contraseña debe tener al menos 10 caracteres." });
  return errors;
}

export function validarPerfil(datos) {
  const errors = [];
  if (!datos?.nombre?.trim()) errors.push({ field: "nombre", message: "El nombre es obligatorio." });
  if (!datos?.apellido?.trim()) errors.push({ field: "apellido", message: "El apellido es obligatorio." });
  if (datos?.monedaBase && !/^[A-Z]{3}$/.test(datos.monedaBase)) {
    errors.push({ field: "monedaBase", message: "La moneda base debe usar un código ISO de tres letras." });
  }
  return errors;
}
