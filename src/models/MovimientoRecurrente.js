import { DataTypes } from "sequelize";
import { sequelize } from "@/lib/sequelize";

export const MovimientoRecurrente = sequelize?.define("MovimientoRecurrente", {
  id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
  usuarioId: { type: DataTypes.UUID, allowNull: false, field: "usuario_id" },
  tipo: { type: DataTypes.ENUM("INGRESO", "GASTO"), allowNull: false },
  cuentaId: { type: DataTypes.UUID, allowNull: false, field: "cuenta_id" },
  categoriaId: { type: DataTypes.UUID, allowNull: false, field: "categoria_id" },
  monto: { type: DataTypes.DECIMAL(18, 2), allowNull: false },
  frecuencia: { type: DataTypes.ENUM("DIARIO", "SEMANAL", "QUINCENAL", "MENSUAL", "ANUAL"), allowNull: false },
  fechaInicio: { type: DataTypes.DATEONLY, allowNull: false, field: "fecha_inicio" },
  fechaFin: { type: DataTypes.DATEONLY, allowNull: true, field: "fecha_fin" },
  proximaEjecucion: { type: DataTypes.DATEONLY, allowNull: false, field: "proxima_ejecucion" },
  descripcion: DataTypes.TEXT,
  observaciones: DataTypes.TEXT,
  activo: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
}, { tableName: "movimientos_recurrentes", underscored: true, paranoid: true });
