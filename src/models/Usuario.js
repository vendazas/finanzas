import { DataTypes } from "sequelize";
import { sequelize } from "@/lib/sequelize";

export const Usuario = sequelize?.define("Usuario", {
  id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
  nombre: { type: DataTypes.STRING(100), allowNull: false },
  apellido: { type: DataTypes.STRING(100), allowNull: false },
  email: { type: DataTypes.STRING(255), allowNull: false, unique: true },
  passwordHash: { type: DataTypes.STRING(255), allowNull: false, field: "password_hash" },
  monedaBase: { type: DataTypes.STRING(3), allowNull: false, defaultValue: "BOB", field: "moneda_base" },
  activo: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
}, {
  tableName: "usuarios",
  underscored: true,
  paranoid: true,
  defaultScope: { attributes: { exclude: ["passwordHash"] } },
});
