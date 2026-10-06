import { calendarioRepository } from "@/repositories/calendario.repository";

export const calendarioService = {
  listar(usuarioId, desde, hasta) {
    return calendarioRepository.listar(usuarioId, desde, hasta);
  },
};
