import { DataTypes } from 'sequelize';
import sequelize from '../config/sequelize.js';

const HoSoTienDo = sequelize.define('HoSoTienDo', {
  id_tien_do: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  id_ho_so: {
    type: DataTypes.UUID,
    allowNull: false
  },
  id_buoc: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  ket_qua_xu_ly: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  nguoi_xu_ly: {
    type: DataTypes.BIGINT,
    allowNull: true
  },
  thoi_gian_xu_ly: {
    type: DataTypes.DATE,
    allowNull: true
  },
  y_kien: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'HO_SO_TIEN_DO',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
});

export default HoSoTienDo;
