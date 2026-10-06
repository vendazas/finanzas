import { DataTypes } from "sequelize";
import { sequelize } from "@/lib/sequelize";

export const TipoCuenta = sequelize?.define("TipoCuenta", {
  id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
  nombre: { type: DataTypes.STRING(100), allowNull: false, unique: true },
  icono: DataTypes.STRING(100),
  activo: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
}, { tableName: "tipos_cuenta", underscored: true });
