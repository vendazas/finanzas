module.exports = {
  name: "202610050009-add-budget-periodicity",
  async up({ queryInterface, transaction }) {
    await queryInterface.sequelize.query(`
      ALTER TABLE presupuestos DROP CONSTRAINT IF EXISTS presupuestos_periodo_mensual;
      ALTER TABLE presupuestos ADD COLUMN periodicidad VARCHAR(10) NOT NULL DEFAULT 'MENSUAL'
        CHECK (periodicidad IN ('SEMANAL', 'MENSUAL'));
      ALTER TABLE presupuestos ADD CONSTRAINT presupuestos_periodo_inicio_check CHECK (
        (periodicidad = 'MENSUAL' AND periodo = date_trunc('month', periodo)::date)
        OR (periodicidad = 'SEMANAL' AND EXTRACT(ISODOW FROM periodo) = 1)
      );
      DROP INDEX IF EXISTS uq_presupuestos_periodo_categoria_moneda;
      CREATE UNIQUE INDEX uq_presupuestos_periodo_categoria_moneda_frecuencia
        ON presupuestos (usuario_id, categoria_id, moneda_id, periodo, periodicidad)
        WHERE deleted_at IS NULL;
    `, { transaction });
  },
  async down({ queryInterface, transaction }) { await queryInterface.sequelize.query("DROP INDEX IF EXISTS uq_presupuestos_periodo_categoria_moneda_frecuencia;", { transaction }); },
};
