import { ApiError } from "@/lib/api-response";
import { hashPassword, verifyPassword } from "@/lib/password";
import { usuariosRepository } from "@/repositories/usuarios.repository";

function normalizarEmail(email) {
  return email.trim().toLowerCase();
}

function usuarioPublico(usuario) {
  return {
    id: usuario.id,
    nombre: usuario.nombre,
    apellido: usuario.apellido,
    email: usuario.email,
    monedaBase: usuario.monedaBase,
    activo: usuario.activo,
    createdAt: usuario.createdAt,
    updatedAt: usuario.updatedAt,
  };
}

export const authService = {
  async registrar(datos) {
    const email = normalizarEmail(datos.email);
    const existente = await usuariosRepository.buscarPorEmailConPassword(email);

    if (existente) {
      throw new ApiError("Ya existe una cuenta con este correo.", 409);
    }

    const passwordHash = await hashPassword(datos.password);
    const usuario = await usuariosRepository.crear({
      nombre: datos.nombre.trim(),
      apellido: datos.apellido.trim(),
      email,
      passwordHash,
      monedaBase: datos.monedaBase || "BOB",
      activo: true,
    });

    return usuarioPublico(usuario);
  },

  async iniciarSesion(datos) {
    const usuario = await usuariosRepository.buscarPorEmailConPassword(normalizarEmail(datos.email));
    const esValida = usuario && usuario.activo && await verifyPassword(datos.password, usuario.passwordHash);

    if (!esValida) {
      throw new ApiError("Correo o contraseña incorrectos.", 401);
    }

    return usuarioPublico(usuario);
  },

  async obtenerPerfil(userId) {
    const usuario = await usuariosRepository.buscarPublicoPorId(userId);

    if (!usuario || !usuario.activo) {
      throw new ApiError("La sesión no corresponde a un usuario activo.", 401);
    }

    return usuarioPublico(usuario);
  },

  async actualizarPerfil(userId, datos) {
    const usuario = await usuariosRepository.actualizarPerfil(userId, {
      nombre: datos.nombre?.trim(),
      apellido: datos.apellido?.trim(),
      monedaBase: datos.monedaBase,
    });

    if (!usuario) {
      throw new ApiError("Usuario no encontrado.", 404);
    }

    return usuarioPublico(usuario);
  },

  async cambiarPassword(userId, datos) {
    const usuario = await usuariosRepository.buscarPorIdConPassword(userId);
    if (!usuario || !await verifyPassword(datos.currentPassword, usuario.passwordHash)) {
      throw new ApiError("La contraseña actual es incorrecta.", 401);
    }

    await usuariosRepository.actualizarPassword(userId, await hashPassword(datos.newPassword));
  },
};
