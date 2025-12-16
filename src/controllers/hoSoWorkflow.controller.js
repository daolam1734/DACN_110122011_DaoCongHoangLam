import * as HoSoWorkflowService from '../services/hoSoWorkflow.service.js';
import * as auditService from '../services/auditHeThong.service.js';

export const duyetHoSo = async (req, res) => {
  try {
    const nguoiXuLyId = req.user?.id_vien_chuc || null;
    const hoSo = await HoSoWorkflowService.duyetHoSo(req.params.id, req.body, nguoiXuLyId);
    try { await auditService.logAudit('HO_SO', req.params.id, 'DUYET', null, hoSo, req.user && req.user.email) } catch (e) { console.warn('audit failed', e.message || e) }
    res.json(hoSo);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const tuChoiHoSo = async (req, res) => {
  try {
    const nguoiXuLyId = req.user?.id_vien_chuc || null;
    await HoSoWorkflowService.tuChoiHoSo(req.params.id, req.body, nguoiXuLyId);
    try { await auditService.logAudit('HO_SO', req.params.id, 'TU_CHOI', null, req.body, req.user && req.user.email) } catch (e) { console.warn('audit failed', e.message || e) }
    res.json({ message: 'Hồ sơ đã bị từ chối' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const traLaiHoSo = async (req, res) => {
  try {
    const nguoiXuLyId = req.user?.id_vien_chuc || null;
    await HoSoWorkflowService.traLaiHoSo(req.params.id, req.body, nguoiXuLyId);
    try { await auditService.logAudit('HO_SO', req.params.id, 'TRA_LAI', null, req.body, req.user && req.user.email) } catch (e) { console.warn('audit failed', e.message || e) }
    res.json({ message: 'Hồ sơ đã được trả lại' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
