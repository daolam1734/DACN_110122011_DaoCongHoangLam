import { DataTypes } from 'sequelize';
import sequelize from '../config/sequelize.js';

const HoSoDiNuocNgoai = sequelize.define('HoSoDiNuocNgoai', {
  id_ho_so: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },
  ma_ho_so: {
    type: DataTypes.STRING(50),
    unique: true,
    allowNull: false
  },
  id_vien_chuc: {
    type: DataTypes.BIGINT,
    allowNull: false
  },
  id_chuc_vu_khi_di: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  loai_hinh_chuyen_di: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  muc_dich_chuyen_di: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  quoc_gia_den: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  ngay_di_du_kien: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  ngay_ve_du_kien: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  trang_thai_chung: {
    type: DataTypes.STRING(50),
    defaultValue: 'MOI_TAO'
  },
  id_buoc_hien_tai: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  thoi_gian_tao: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'HO_SO_DI_NUOC_NGOAI',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
});

export default HoSoDiNuocNgoai;
