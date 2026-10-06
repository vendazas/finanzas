import { DataTypes } from "sequelize";
import { sequelize } from "@/lib/sequelize";
export const AporteMeta = sequelize?.define("AporteMeta", { id:{type:DataTypes.UUID,primaryKey:true,defaultValue:DataTypes.UUIDV4},metaId:{type:DataTypes.UUID,field:"meta_id"},usuarioId:{type:DataTypes.UUID,field:"usuario_id"},cuentaId:{type:DataTypes.UUID,field:"cuenta_id"},monto:DataTypes.DECIMAL(18,2),fecha:DataTypes.DATEONLY,observacion:DataTypes.TEXT,movimientoId:{type:DataTypes.UUID,field:"movimiento_id"}},{tableName:"aportes_meta",underscored:true,updatedAt:false});
