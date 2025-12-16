import { DataTypes } from 'sequelize';
import sequelize from '../config/sequelize.js';

const AuditHeThong = sequelize.define('AuditHeThong', {
  id_audit: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  ten_bang: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  khoa_chinh: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  hanh_dong: {
    type: DataTypes.STRING(10),
    allowNull: true
  },
  du_lieu_cu: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  du_lieu_moi: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  nguoi_thuc_hien: {
    type: DataTypes.BIGINT,
    allowNull: true
  },
  thoi_gian: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'AUDIT_HE_THONG',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
});

export default AuditHeThong;
