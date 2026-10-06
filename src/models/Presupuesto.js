import { DataTypes } from "sequelize";
import { sequelize } from "@/lib/sequelize";

export const Presupuesto = sequelize?.define("Presupuesto", {
  id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
  usuarioId: { type: DataTypes.UUID, allowNull: false, field: "usuario_id" },
  categoriaId: { type: DataTypes.UUID, allowNull: false, field: "categoria_id" },
  monedaId: { type: DataTypes.UUID, allowNull: false, field: "moneda_id" },
  periodo: { type: DataTypes.DATEONLY, allowNull: false },
  periodicidad: { type: DataTypes.ENUM("SEMANAL", "MENSUAL"), allowNull: false, defaultValue: "MENSUAL" },
  montoPresupuestado: { type: DataTypes.DECIMAL(18, 2), allowNull: false, field: "monto_presupuestado" },
  activo: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
}, { tableName: "presupuestos", underscored: true, paranoid: true });
