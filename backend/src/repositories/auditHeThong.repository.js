import AuditHeThong from '../models/AuditHeThong.js';
import { Op } from 'sequelize';

export const createAudit = async (auditData) => {
  return AuditHeThong.create(auditData);
};

export const getAuditByBang = async (tenBang) => {
  return AuditHeThong.findAll({ where: { ten_bang: tenBang } });
};

export const getAuditByHoSoId = async (hoSoId) => {
  return AuditHeThong.findAll({
    where: {
      [Op.or]: [
        { khoa_chinh: hoSoId },
        { du_lieu_cu: { id_ho_so: hoSoId } },
        { du_lieu_moi: { id_ho_so: hoSoId } }
      ]
    }
  });
};
