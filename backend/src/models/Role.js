import { DataTypes } from 'sequelize'
import sequelize from '../config/sequelize.js'

const Role = sequelize.define('Role', {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING(100), allowNull: false, unique: true },
    description: { type: DataTypes.STRING(255) },
    permissions: { type: DataTypes.JSONB, defaultValue: [] },
    active: { type: DataTypes.BOOLEAN, defaultValue: true }
}, {
    tableName: 'ROLES',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
})

export default Role
