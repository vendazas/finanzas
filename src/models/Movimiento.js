import { DataTypes } from "sequelize";
import { sequelize } from "@/lib/sequelize";

export const Movimiento = sequelize?.define("Movimiento", {
  id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
  usuarioId: { type: DataTypes.UUID, allowNull: false, field: "usuario_id" },
  cuentaId: { type: DataTypes.UUID, allowNull: false, field: "cuenta_id" },
  categoriaId: { type: DataTypes.UUID, allowNull: true, field: "categoria_id" },
  tipo: {
    type: DataTypes.ENUM("INGRESO", "GASTO", "TRANSFERENCIA_ENTRADA", "TRANSFERENCIA_SALIDA", "AJUSTE"),
    allowNull: false,
  },
  monto: { type: DataTypes.DECIMAL(18, 2), allowNull: false },
  fecha: { type: DataTypes.DATEONLY, allowNull: false },
  descripcion: DataTypes.TEXT,
  observaciones: DataTypes.TEXT,
  comprobanteUrl: { type: DataTypes.TEXT, allowNull: true, field: "comprobante_url" },
  transferenciaId: { type: DataTypes.UUID, allowNull: true, field: "transferencia_id" },
  movimientoRecurrenteId: { type: DataTypes.UUID, allowNull: true, field: "movimiento_recurrente_id" },
}, { tableName: "movimientos", underscored: true, paranoid: true });
