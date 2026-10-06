import { DataTypes } from "sequelize";
import { sequelize } from "@/lib/sequelize";

export const Categoria = sequelize?.define("Categoria", {
  id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
  usuarioId: { type: DataTypes.UUID, allowNull: true, field: "usuario_id" },
  categoriaPadreId: { type: DataTypes.UUID, allowNull: true, field: "categoria_padre_id" },
  tipo: { type: DataTypes.ENUM("INGRESO", "GASTO"), allowNull: false },
  nombre: { type: DataTypes.STRING(100), allowNull: false },
  icono: DataTypes.STRING(100),
  color: DataTypes.STRING(20),
  activo: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
}, { tableName: "categorias", underscored: true });
