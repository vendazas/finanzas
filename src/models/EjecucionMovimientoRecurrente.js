import { DataTypes } from "sequelize";
import { sequelize } from "@/lib/sequelize";

export const EjecucionMovimientoRecurrente = sequelize?.define("EjecucionMovimientoRecurrente", {
  id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
  movimientoRecurrenteId: { type: DataTypes.UUID, allowNull: false, field: "movimiento_recurrente_id" },
  fechaProgramada: { type: DataTypes.DATEONLY, allowNull: false, field: "fecha_programada" },
  movimientoId: { type: DataTypes.UUID, allowNull: false, field: "movimiento_id" },
}, { tableName: "ejecuciones_movimientos_recurrentes", underscored: true, updatedAt: false });
