import * as BaoCaoKetQuaService from '../services/baoCaoKetQua.service.js';
import * as auditService from '../services/auditHeThong.service.js';

export const nopBaoCao = async (req, res) => {
  try {
    const baoCao = await BaoCaoKetQuaService.nopBaoCao(req.params.id, req.body);
    try { await auditService.logAudit('BAO_CAO', req.params.id, 'SUBMIT', null, baoCao, req.user && req.user.email) } catch (e) { console.warn('audit failed', e.message || e) }
    res.status(201).json(baoCao);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getBaoCao = async (req, res) => {
  const baoCao = await BaoCaoKetQuaService.getBaoCao(req.params.id);
  if (!baoCao) return res.status(404).json({ message: 'Không tìm thấy báo cáo' });
  res.json(baoCao);
};
