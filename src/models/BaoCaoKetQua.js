import { DataTypes } from 'sequelize';
import sequelize from '../config/sequelize.js';

const BaoCaoKetQua = sequelize.define('BaoCaoKetQua', {
  id_bao_cao: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  id_ho_so: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true
  },
  noi_dung_chuyen_mon: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  noi_dung_dang: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  ngay_ve_thuc_te: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  han_nop_bao_cao: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  ngay_nop: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'BAO_CAO_KET_QUA',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
});

export default BaoCaoKetQua;
