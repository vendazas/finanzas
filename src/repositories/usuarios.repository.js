import { Usuario } from "@/models";

const PUBLIC_ATTRIBUTES = ["id", "nombre", "apellido", "email", "monedaBase", "activo", "createdAt", "updatedAt"];

export const usuariosRepository = {
  async buscarPorEmailConPassword(email) {
    return Usuario.unscoped().findOne({ where: { email } });
  },

  async buscarPorIdConPassword(id) {
    return Usuario.unscoped().findByPk(id);
  },

  async buscarPublicoPorId(id) {
    return Usuario.findByPk(id, { attributes: PUBLIC_ATTRIBUTES });
  },

  async crear(datos) {
    return Usuario.create(datos);
  },

  async actualizarPerfil(id, datos) {
    const usuario = await Usuario.findByPk(id);
    if (!usuario) return null;
    await usuario.update(datos);
    return usuario;
  },

  async actualizarPassword(id, passwordHash) {
    return Usuario.update({ passwordHash }, { where: { id } });
  },
};
