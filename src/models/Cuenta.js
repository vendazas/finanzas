import { DataTypes } from "sequelize";
import { sequelize } from "@/lib/sequelize";

export const Cuenta = sequelize?.define("Cuenta", {
  id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
  usuarioId: { type: DataTypes.UUID, allowNull: false, field: "usuario_id" },
  tipoCuentaId: { type: DataTypes.UUID, allowNull: false, field: "tipo_cuenta_id" },
  monedaId: { type: DataTypes.UUID, allowNull: false, field: "moneda_id" },
  nombre: { type: DataTypes.STRING(150), allowNull: false },
  descripcion: DataTypes.TEXT,
  saldoInicial: { type: DataTypes.DECIMAL(18, 2), allowNull: false, defaultValue: 0, field: "saldo_inicial" },
  fechaSaldoInicial: { type: DataTypes.DATEONLY, allowNull: false, field: "fecha_saldo_inicial" },
  color: DataTypes.STRING(20),
  icono: DataTypes.STRING(100),
  incluirPatrimonio: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true, field: "incluir_patrimonio" },
  activo: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
}, { tableName: "cuentas", underscored: true, paranoid: true });
