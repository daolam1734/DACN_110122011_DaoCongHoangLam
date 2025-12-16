import * as AuditHeThongRepository from '../repositories/auditHeThong.repository.js';

export const logAudit = async (tenBang, khoaChinh, hanhDong, duLieuCu, duLieuMoi, nguoiThucHien) => {
  return AuditHeThongRepository.createAudit({
    ten_bang: tenBang,
    khoa_chinh: String(khoaChinh),
    hanh_dong: hanhDong,
    du_lieu_cu: duLieuCu,
    du_lieu_moi: duLieuMoi,
    nguoi_thuc_hien: nguoiThucHien,
    thoi_gian: new Date()
  });
};

export const getAuditByBang = async (tenBang) => {
  return AuditHeThongRepository.getAuditByBang(tenBang);
};

export const getAuditByHoSoId = async (hoSoId) => {
  return AuditHeThongRepository.getAuditByHoSoId(hoSoId);
};

export const getRecent = async (limit = 50) => {
  return AuditHeThong.findAll({ order: [['thoi_gian', 'DESC']], limit });
};
