module.exports = {
  name: "202610050008-complete-cards-and-assets",
  async up({ queryInterface, transaction }) {
    await queryInterface.sequelize.query(`
      ALTER TABLE tarjetas_credito ADD COLUMN ultimos_digitos VARCHAR(4);
      ALTER TABLE tarjetas_credito ADD COLUMN color VARCHAR(20);
      ALTER TABLE tarjetas_credito ADD CONSTRAINT tarjetas_ultimos_digitos_check CHECK (ultimos_digitos IS NULL OR ultimos_digitos ~ '^[0-9]{4}$');
      ALTER TABLE consumos_tarjeta ALTER COLUMN movimiento_id DROP NOT NULL;
      ALTER TABLE consumos_tarjeta ADD COLUMN cantidad_cuotas INTEGER NOT NULL DEFAULT 1 CHECK (cantidad_cuotas >= 1);
      ALTER TABLE consumos_tarjeta ADD COLUMN estado VARCHAR(12) NOT NULL DEFAULT 'PENDIENTE' CHECK (estado IN ('PENDIENTE','PAGADO','ANULADO'));
      ALTER TABLE consumos_tarjeta ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP;
      ALTER TABLE pagos_tarjeta ADD COLUMN observacion TEXT;
      ALTER TABLE activos_patrimonio ADD COLUMN fecha_adquisicion DATE;
      ALTER TABLE activos_patrimonio ADD COLUMN valor_adquisicion NUMERIC(18,2);
      ALTER TABLE activos_patrimonio DROP CONSTRAINT IF EXISTS activos_patrimonio_tipo_check;
      ALTER TABLE activos_patrimonio ADD CONSTRAINT activos_patrimonio_tipo_check CHECK (tipo IN ('PROPIEDAD','VEHICULO','INVERSION','NEGOCIO','TERRENO','OTRO'));
      ALTER TABLE valoraciones_activo ADD COLUMN usuario_id UUID REFERENCES usuarios(id) ON DELETE RESTRICT;
      UPDATE valoraciones_activo v SET usuario_id=a.usuario_id FROM activos_patrimonio a WHERE a.id=v.activo_id AND v.usuario_id IS NULL;
      CREATE INDEX idx_consumos_tarjeta_tarjeta_estado ON consumos_tarjeta(tarjeta_id, estado, fecha DESC);
    `, { transaction });
  },
  async down({ queryInterface, transaction }) { await queryInterface.sequelize.query("DROP INDEX IF EXISTS idx_consumos_tarjeta_tarjeta_estado;", { transaction }); },
};
