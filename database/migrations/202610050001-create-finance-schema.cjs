module.exports = {
  name: "202610050001-create-finance-schema",

  async up({ queryInterface, transaction }) {
    await queryInterface.sequelize.query(
      `
        CREATE TABLE usuarios (
          id UUID PRIMARY KEY,
          nombre VARCHAR(100) NOT NULL,
          apellido VARCHAR(100) NOT NULL,
          email VARCHAR(255) NOT NULL UNIQUE,
          password_hash VARCHAR(255) NOT NULL,
          moneda_base VARCHAR(3) NOT NULL DEFAULT 'BOB',
          activo BOOLEAN NOT NULL DEFAULT TRUE,
          created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
          deleted_at TIMESTAMPTZ
        );

        CREATE TABLE monedas (
          id UUID PRIMARY KEY,
          codigo VARCHAR(3) NOT NULL UNIQUE,
          nombre VARCHAR(100) NOT NULL,
          simbolo VARCHAR(10) NOT NULL,
          decimales SMALLINT NOT NULL DEFAULT 2 CHECK (decimales BETWEEN 0 AND 6),
          activo BOOLEAN NOT NULL DEFAULT TRUE,
          created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE tipos_cuenta (
          id UUID PRIMARY KEY,
          nombre VARCHAR(100) NOT NULL UNIQUE,
          icono VARCHAR(100),
          activo BOOLEAN NOT NULL DEFAULT TRUE,
          created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
        );

        ALTER TABLE usuarios
          ADD CONSTRAINT usuarios_moneda_base_fk
          FOREIGN KEY (moneda_base) REFERENCES monedas(codigo) ON DELETE RESTRICT;

        CREATE TABLE cuentas (
          id UUID PRIMARY KEY,
          usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
          tipo_cuenta_id UUID NOT NULL REFERENCES tipos_cuenta(id) ON DELETE RESTRICT,
          moneda_id UUID NOT NULL REFERENCES monedas(id) ON DELETE RESTRICT,
          nombre VARCHAR(150) NOT NULL,
          descripcion TEXT,
          saldo_inicial NUMERIC(18, 2) NOT NULL DEFAULT 0,
          fecha_saldo_inicial DATE NOT NULL DEFAULT CURRENT_DATE,
          color VARCHAR(20),
          icono VARCHAR(100),
          incluir_patrimonio BOOLEAN NOT NULL DEFAULT TRUE,
          activo BOOLEAN NOT NULL DEFAULT TRUE,
          created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
          deleted_at TIMESTAMPTZ
        );

        CREATE TABLE categorias (
          id UUID PRIMARY KEY,
          usuario_id UUID REFERENCES usuarios(id) ON DELETE RESTRICT,
          categoria_padre_id UUID REFERENCES categorias(id) ON DELETE RESTRICT,
          tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('INGRESO', 'GASTO')),
          nombre VARCHAR(100) NOT NULL,
          icono VARCHAR(100),
          color VARCHAR(20),
          activo BOOLEAN NOT NULL DEFAULT TRUE,
          created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE tipos_cambio (
          id UUID PRIMARY KEY,
          moneda_origen_id UUID NOT NULL REFERENCES monedas(id) ON DELETE RESTRICT,
          moneda_destino_id UUID NOT NULL REFERENCES monedas(id) ON DELETE RESTRICT,
          valor NUMERIC(18, 8) NOT NULL CHECK (valor > 0),
          fecha DATE NOT NULL,
          usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
          created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT tipos_cambio_monedas_distintas CHECK (moneda_origen_id <> moneda_destino_id)
        );

        CREATE TABLE transferencias (
          id UUID PRIMARY KEY,
          usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
          cuenta_origen_id UUID NOT NULL REFERENCES cuentas(id) ON DELETE RESTRICT,
          cuenta_destino_id UUID NOT NULL REFERENCES cuentas(id) ON DELETE RESTRICT,
          monto_origen NUMERIC(18, 2) NOT NULL CHECK (monto_origen > 0),
          monto_destino NUMERIC(18, 2) NOT NULL CHECK (monto_destino > 0),
          tipo_cambio NUMERIC(18, 8),
          fecha DATE NOT NULL,
          descripcion TEXT,
          created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
          deleted_at TIMESTAMPTZ,
          CONSTRAINT transferencias_cuentas_distintas CHECK (cuenta_origen_id <> cuenta_destino_id),
          CONSTRAINT transferencias_tipo_cambio_positivo CHECK (tipo_cambio IS NULL OR tipo_cambio > 0)
        );

        CREATE TABLE movimientos (
          id UUID PRIMARY KEY,
          usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
          cuenta_id UUID NOT NULL REFERENCES cuentas(id) ON DELETE RESTRICT,
          categoria_id UUID REFERENCES categorias(id) ON DELETE RESTRICT,
          tipo VARCHAR(25) NOT NULL CHECK (tipo IN ('INGRESO', 'GASTO', 'TRANSFERENCIA_ENTRADA', 'TRANSFERENCIA_SALIDA', 'AJUSTE')),
          monto NUMERIC(18, 2) NOT NULL CHECK (monto <> 0),
          fecha DATE NOT NULL,
          descripcion TEXT,
          observaciones TEXT,
          comprobante_url TEXT,
          transferencia_id UUID REFERENCES transferencias(id) ON DELETE RESTRICT,
          movimiento_recurrente_id UUID,
          created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
          deleted_at TIMESTAMPTZ,
          CONSTRAINT movimientos_transferencia_categoria CHECK (
            (tipo IN ('TRANSFERENCIA_ENTRADA', 'TRANSFERENCIA_SALIDA') AND transferencia_id IS NOT NULL)
            OR (tipo NOT IN ('TRANSFERENCIA_ENTRADA', 'TRANSFERENCIA_SALIDA') AND transferencia_id IS NULL)
          )
        );
      `,
      { transaction }
    );

    await queryInterface.sequelize.query(
      `
        CREATE INDEX idx_cuentas_usuario_activo ON cuentas (usuario_id, activo) WHERE deleted_at IS NULL;
        CREATE INDEX idx_cuentas_moneda ON cuentas (moneda_id);
        CREATE INDEX idx_categorias_usuario_tipo ON categorias (usuario_id, tipo);
        CREATE UNIQUE INDEX uq_categorias_personales ON categorias (usuario_id, categoria_padre_id, tipo, nombre) WHERE usuario_id IS NOT NULL;
        CREATE INDEX idx_tipos_cambio_consulta ON tipos_cambio (usuario_id, moneda_origen_id, moneda_destino_id, fecha DESC);
        CREATE UNIQUE INDEX uq_tipos_cambio_fecha ON tipos_cambio (usuario_id, moneda_origen_id, moneda_destino_id, fecha);
        CREATE INDEX idx_transferencias_usuario_fecha ON transferencias (usuario_id, fecha DESC) WHERE deleted_at IS NULL;
        CREATE INDEX idx_movimientos_usuario_fecha ON movimientos (usuario_id, fecha DESC) WHERE deleted_at IS NULL;
        CREATE INDEX idx_movimientos_cuenta_fecha ON movimientos (cuenta_id, fecha DESC) WHERE deleted_at IS NULL;
        CREATE INDEX idx_movimientos_categoria ON movimientos (categoria_id) WHERE categoria_id IS NOT NULL;
        CREATE INDEX idx_movimientos_transferencia ON movimientos (transferencia_id) WHERE transferencia_id IS NOT NULL;
      `,
      { transaction }
    );
  },

  async down({ queryInterface, transaction }) {
    await queryInterface.sequelize.query(
      "DROP TABLE IF EXISTS movimientos, transferencias, tipos_cambio, categorias, cuentas, tipos_cuenta, monedas, usuarios CASCADE;",
      { transaction }
    );
  },
};
