import * as TaiLieuHoSoService from '../services/taiLieuHoSo.service.js';
import * as auditService from '../services/auditHeThong.service.js';

export const uploadTaiLieu = async (req, res) => {
  try {
    const taiLieu = await TaiLieuHoSoService.uploadTaiLieu(req.params.id, req.body);
    try { await auditService.logAudit('TAI_LIEU_HO_SO', taiLieu.id || '', 'UPLOAD', null, taiLieu, req.user && req.user.email) } catch (e) { console.warn('audit failed', e.message || e) }
    res.status(201).json(taiLieu);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getTaiLieuList = async (req, res) => {
  const list = await TaiLieuHoSoService.getTaiLieuList(req.params.id);
  res.json(list);
};
