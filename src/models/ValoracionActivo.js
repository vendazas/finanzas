import { DataTypes } from "sequelize";
import { sequelize } from "@/lib/sequelize";
export const ValoracionActivo = sequelize?.define("ValoracionActivo", { id:{type:DataTypes.UUID,primaryKey:true,defaultValue:DataTypes.UUIDV4},activoId:{type:DataTypes.UUID,field:"activo_id"},valor:DataTypes.DECIMAL(18,2),fecha:DataTypes.DATEONLY,observacion:DataTypes.TEXT},{tableName:"valoraciones_activo",underscored:true,updatedAt:false});
