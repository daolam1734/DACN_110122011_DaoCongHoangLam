import { DataTypes } from 'sequelize';
import sequelize from '../config/sequelize.js';

const VienChuc = sequelize.define('VienChuc', {
  id_vien_chuc: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  ma_so_vien_chuc: { type: DataTypes.STRING(20), unique: true, allowNull: false },
  ho_va_ten: { type: DataTypes.STRING(100), allowNull: false },
  email_cong_vu: { type: DataTypes.STRING(100), unique: true, allowNull: false },
  ngay_sinh: { type: DataTypes.DATEONLY, allowNull: false },
  so_cccd: { type: DataTypes.STRING(20) },
  dia_chi: { type: DataTypes.STRING(255) },
  id_don_vi: { type: DataTypes.INTEGER, allowNull: false },
  id_chuc_vu: { type: DataTypes.INTEGER, allowNull: false },
  id_ngach: { type: DataTypes.INTEGER },
  la_dang_vien: { type: DataTypes.BOOLEAN, defaultValue: false },
  so_ho_chieu_pho_thong: { type: DataTypes.STRING(20) },
  so_ho_chieu_cong_vu: { type: DataTypes.STRING(20) },
  ngay_het_han_ho_chieu: { type: DataTypes.DATEONLY },
  trang_thai_lam_viec: { type: DataTypes.STRING(50), defaultValue: 'DANG_LAM_VIEC' },
}, {
  tableName: 'VIEN_CHUC',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
});

export default VienChuc;
