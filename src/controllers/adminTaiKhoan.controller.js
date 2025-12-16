import * as AdminTaiKhoanService from '../services/adminTaiKhoan.service.js';
import * as auditService from '../services/auditHeThong.service.js';

export const createTaiKhoan = async (req, res) => {
  try {
    const { idVienChuc, email } = req.body;
    const taiKhoan = await AdminTaiKhoanService.createTaiKhoanAdmin({ idVienChuc, email });
    try { await auditService.logAudit('TAI_KHOAN_DANG_NHAP', taiKhoan.id_tai_khoan || taiKhoan.email || '', 'CREATE', null, taiKhoan, req.user && req.user.email) } catch (e) { console.warn('audit failed', e.message || e) }
    res.status(201).json(taiKhoan);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const khoaTaiKhoan = async (req, res) => {
  try {
    await AdminTaiKhoanService.khoaTaiKhoan(req.params.id);
    try { await auditService.logAudit('TAI_KHOAN_DANG_NHAP', req.params.id, 'LOCK', null, null, req.user && req.user.email) } catch (e) { console.warn('audit failed', e.message || e) }
    res.json({ message: 'Đã khóa tài khoản' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
