module.exports = {
  name: "202610050002-add-budgets-and-recurring",

  async up({ queryInterface, transaction }) {
    await queryInterface.sequelize.query(`
      CREATE TABLE presupuestos (
        id UUID PRIMARY KEY,
        usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
        categoria_id UUID NOT NULL REFERENCES categorias(id) ON DELETE RESTRICT,
        moneda_id UUID NOT NULL REFERENCES monedas(id) ON DELETE RESTRICT,
        periodo DATE NOT NULL,
        monto_presupuestado NUMERIC(18, 2) NOT NULL CHECK (monto_presupuestado > 0),
        activo BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMPTZ,
        CONSTRAINT presupuestos_periodo_mensual CHECK (periodo = date_trunc('month', periodo)::date)
      );

      CREATE TABLE movimientos_recurrentes (
        id UUID PRIMARY KEY,
        usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
        tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('INGRESO', 'GASTO')),
        cuenta_id UUID NOT NULL REFERENCES cuentas(id) ON DELETE RESTRICT,
        categoria_id UUID NOT NULL REFERENCES categorias(id) ON DELETE RESTRICT,
        monto NUMERIC(18, 2) NOT NULL CHECK (monto > 0),
        frecuencia VARCHAR(12) NOT NULL CHECK (frecuencia IN ('DIARIO', 'SEMANAL', 'QUINCENAL', 'MENSUAL', 'ANUAL')),
        fecha_inicio DATE NOT NULL,
        fecha_fin DATE,
        proxima_ejecucion DATE NOT NULL,
        descripcion TEXT,
        observaciones TEXT,
        activo BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMPTZ,
        CONSTRAINT recurrentes_rango_fechas CHECK (fecha_fin IS NULL OR fecha_fin >= fecha_inicio)
      );

      ALTER TABLE movimientos
        ADD CONSTRAINT movimientos_recurrente_fk
        FOREIGN KEY (movimiento_recurrente_id) REFERENCES movimientos_recurrentes(id) ON DELETE RESTRICT;

      CREATE TABLE ejecuciones_movimientos_recurrentes (
        id UUID PRIMARY KEY,
        movimiento_recurrente_id UUID NOT NULL REFERENCES movimientos_recurrentes(id) ON DELETE RESTRICT,
        fecha_programada DATE NOT NULL,
        movimiento_id UUID NOT NULL REFERENCES movimientos(id) ON DELETE RESTRICT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT ejecuciones_recurrente_fecha_unica UNIQUE (movimiento_recurrente_id, fecha_programada),
        CONSTRAINT ejecuciones_movimiento_unico UNIQUE (movimiento_id)
      );

      CREATE UNIQUE INDEX uq_presupuestos_periodo_categoria_moneda ON presupuestos (usuario_id, categoria_id, moneda_id, periodo) WHERE deleted_at IS NULL;
      CREATE INDEX idx_presupuestos_usuario_periodo ON presupuestos (usuario_id, periodo) WHERE deleted_at IS NULL;
      CREATE INDEX idx_recurrentes_pendientes ON movimientos_recurrentes (activo, proxima_ejecucion) WHERE deleted_at IS NULL;
    `, { transaction });
  },

  async down({ queryInterface, transaction }) {
    await queryInterface.sequelize.query(`
      ALTER TABLE movimientos DROP CONSTRAINT IF EXISTS movimientos_recurrente_fk;
      DROP TABLE IF EXISTS ejecuciones_movimientos_recurrentes, movimientos_recurrentes, presupuestos CASCADE;
    `, { transaction });
  },
};
