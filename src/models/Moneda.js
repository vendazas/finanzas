import { DataTypes } from "sequelize";
import { sequelize } from "@/lib/sequelize";

export const Moneda = sequelize?.define("Moneda", {
  id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
  codigo: { type: DataTypes.STRING(3), allowNull: false, unique: true },
  nombre: { type: DataTypes.STRING(100), allowNull: false },
  simbolo: { type: DataTypes.STRING(10), allowNull: false },
  decimales: { type: DataTypes.SMALLINT, allowNull: false, defaultValue: 2 },
  activo: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
}, { tableName: "monedas", underscored: true });
