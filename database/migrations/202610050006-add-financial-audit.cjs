module.exports = {
  name: "202610050006-add-financial-audit",

  async up({ queryInterface, transaction }) {
    await queryInterface.sequelize.query(
      `
        CREATE TABLE auditoria_financiera (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
          entidad VARCHAR(80) NOT NULL,
          entidad_id UUID NOT NULL,
          accion VARCHAR(20) NOT NULL CHECK (accion IN ('CREACION', 'MODIFICACION', 'ANULACION')),
          datos_anteriores JSONB,
          datos_nuevos JSONB,
          created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
        CREATE INDEX idx_auditoria_financiera_consulta
          ON auditoria_financiera (usuario_id, entidad, entidad_id, created_at DESC);
      `,
      { transaction }
    );
  },

  async down({ queryInterface, transaction }) {
    await queryInterface.sequelize.query(
      "DROP TABLE IF EXISTS auditoria_financiera;",
      { transaction }
    );
  },
};
