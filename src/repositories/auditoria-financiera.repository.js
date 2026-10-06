import { QueryTypes } from "sequelize";
import { sequelize } from "@/lib/sequelize";

export const auditoriaFinancieraRepository = {
  async registrar({ usuarioId, entidad, entidadId, accion, datosAnteriores = null, datosNuevos = null }, transaction) {
    await sequelize.query(
      `INSERT INTO auditoria_financiera
        (usuario_id, entidad, entidad_id, accion, datos_anteriores, datos_nuevos)
       VALUES (:usuarioId, :entidad, :entidadId, :accion,
         CAST(:datosAnteriores AS jsonb), CAST(:datosNuevos AS jsonb))`,
      {
        replacements: {
          usuarioId,
          entidad,
          entidadId,
          accion,
          datosAnteriores: datosAnteriores ? JSON.stringify(datosAnteriores) : null,
          datosNuevos: datosNuevos ? JSON.stringify(datosNuevos) : null,
        },
        transaction,
        type: QueryTypes.INSERT,
      }
    );
  },
};
