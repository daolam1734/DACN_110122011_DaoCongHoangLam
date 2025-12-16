import { DataTypes } from 'sequelize';
import sequelize from '../config/sequelize.js';

const TaiKhoanDangNhap = sequelize.define('TaiKhoanDangNhap', {
  id_tai_khoan: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  id_vien_chuc: {
    type: DataTypes.BIGINT,
    allowNull: false,
    unique: true
  },
  // property names keep existing JS-friendly names but map to DB column names
  email_dang_nhap: {
    type: DataTypes.STRING(150),
    allowNull: false,
    unique: true,
    field: 'email'
  },
  mat_khau_hash: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'mat_khau'
  },
  loai_dang_nhap: {
    type: DataTypes.STRING(30),
    defaultValue: 'SSO_EMAIL',
    field: 'vai_tro'
  },
  trang_thai: {
    type: DataTypes.STRING(30),
    defaultValue: 'ACTIVE',
    field: 'trang_thai'
  },
  lan_dang_nhap_cuoi: {
    type: DataTypes.DATE,
    allowNull: true
  },
}, {
  tableName: 'TAI_KHOAN_DANG_NHAP',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
});

export default TaiKhoanDangNhap;
