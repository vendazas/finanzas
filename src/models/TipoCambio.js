import { DataTypes } from "sequelize";
import { sequelize } from "@/lib/sequelize";

export const TipoCambio = sequelize?.define("TipoCambio", {
  id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
  monedaOrigenId: { type: DataTypes.UUID, allowNull: false, field: "moneda_origen_id" },
  monedaDestinoId: { type: DataTypes.UUID, allowNull: false, field: "moneda_destino_id" },
  valor: { type: DataTypes.DECIMAL(18, 8), allowNull: false },
  fecha: { type: DataTypes.DATEONLY, allowNull: false },
  usuarioId: { type: DataTypes.UUID, allowNull: false, field: "usuario_id" },
}, { tableName: "tipos_cambio", underscored: true, updatedAt: false });
