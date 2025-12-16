import { DataTypes } from 'sequelize';
import sequelize from '../config/sequelize.js';

const TaiLieuHoSo = sequelize.define('TaiLieuHoSo', {
  id_tai_lieu: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  id_ho_so: {
    type: DataTypes.UUID,
    allowNull: false
  },
  ma_loai_giay_to: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  ten_tap_tin: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  duong_dan: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  la_tai_lieu_bao_mat: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  thoi_gian_tai_len: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'TAI_LIEU_HO_SO',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
});

export default TaiLieuHoSo;
