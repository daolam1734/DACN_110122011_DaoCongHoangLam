import * as HoSoService from '../services/hoSo.service.js';
import * as auditService from '../services/auditHeThong.service.js';

export const createHoSo = async (req, res) => {
  try {
    // Lấy id người tạo từ context/middleware xác thực
    const nguoiTaoId = req.user?.id_vien_chuc || null;
    const hoSo = await HoSoService.createHoSo(req.body, nguoiTaoId);
    try { await auditService.logAudit('HO_SO', hoSo.id_ho_so || hoSo.id || '', 'CREATE', null, hoSo, req.user && req.user.email) } catch (e) { console.warn('audit failed', e.message || e) }
    res.status(201).json(hoSo);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getHoSoById = async (req, res) => {
  const hoSo = await HoSoService.getHoSoById(req.params.id);
  if (!hoSo) return res.status(404).json({ message: 'Không tìm thấy hồ sơ' });
  res.json(hoSo);
};

export const getHoSoList = async (req, res) => {
  const { trangThaiChung } = req.query;
  const hoSoList = await HoSoService.getHoSoList({ trangThaiChung });
  res.json(hoSoList);
};
