module.exports = {
  name: "202610050007-complete-debts-goals-assets",

  async up({ queryInterface, transaction }) {
    await queryInterface.sequelize.query(`
      ALTER TABLE deudas RENAME COLUMN saldo TO saldo_pendiente;
      ALTER TABLE pagos_deuda ADD COLUMN observacion TEXT;
      ALTER TABLE metas_ahorro ADD COLUMN fecha_inicio DATE NOT NULL DEFAULT CURRENT_DATE;
      ALTER TABLE metas_ahorro ADD COLUMN estado VARCHAR(12) NOT NULL DEFAULT 'ACTIVA'
        CHECK (estado IN ('ACTIVA', 'COMPLETADA', 'CANCELADA'));
      ALTER TABLE aportes_meta ALTER COLUMN movimiento_id DROP NOT NULL;
      ALTER TABLE aportes_meta ADD COLUMN observacion TEXT;
      ALTER TABLE valoraciones_activo ADD COLUMN observacion TEXT;
      CREATE INDEX idx_pagos_deuda_deuda ON pagos_deuda(deuda_id, fecha DESC);
      CREATE INDEX idx_aportes_meta_meta ON aportes_meta(meta_id, fecha DESC);
      CREATE INDEX idx_activos_patrimonio_usuario ON activos_patrimonio(usuario_id, activo)
        WHERE deleted_at IS NULL;
    `, { transaction });
  },

  async down({ queryInterface, transaction }) {
    await queryInterface.sequelize.query(`
      DROP INDEX IF EXISTS idx_pagos_deuda_deuda, idx_aportes_meta_meta, idx_activos_patrimonio_usuario;
      ALTER TABLE valoraciones_activo DROP COLUMN IF EXISTS observacion;
      ALTER TABLE aportes_meta DROP COLUMN IF EXISTS observacion;
      ALTER TABLE aportes_meta ALTER COLUMN movimiento_id SET NOT NULL;
      ALTER TABLE metas_ahorro DROP COLUMN IF EXISTS estado;
      ALTER TABLE metas_ahorro DROP COLUMN IF EXISTS fecha_inicio;
      ALTER TABLE pagos_deuda DROP COLUMN IF EXISTS observacion;
      ALTER TABLE deudas RENAME COLUMN saldo_pendiente TO saldo;
    `, { transaction });
  },
};
