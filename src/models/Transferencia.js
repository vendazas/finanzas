import { DataTypes } from "sequelize";
import { sequelize } from "@/lib/sequelize";

export const Transferencia = sequelize?.define("Transferencia", {
  id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
  usuarioId: { type: DataTypes.UUID, allowNull: false, field: "usuario_id" },
  cuentaOrigenId: { type: DataTypes.UUID, allowNull: false, field: "cuenta_origen_id" },
  cuentaDestinoId: { type: DataTypes.UUID, allowNull: false, field: "cuenta_destino_id" },
  montoOrigen: { type: DataTypes.DECIMAL(18, 2), allowNull: false, field: "monto_origen" },
  montoDestino: { type: DataTypes.DECIMAL(18, 2), allowNull: false, field: "monto_destino" },
  tipoCambio: { type: DataTypes.DECIMAL(18, 8), allowNull: true, field: "tipo_cambio" },
  fecha: { type: DataTypes.DATEONLY, allowNull: false },
  descripcion: DataTypes.TEXT,
}, { tableName: "transferencias", underscored: true, paranoid: true });
