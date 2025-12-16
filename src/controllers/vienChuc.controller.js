import * as vienChucService from '../services/vienChuc.service.js';

export const getVienChucList = async (req, res) => {
  try {
    const data = await vienChucService.getAllVienChuc();
    console.log(`[vienChuc] getVienChucList success - returned ${Array.isArray(data) ? data.length : 0} records`);
    return res.json(data);
  } catch (error) {
    console.error('[vienChuc] getVienChucList error:', error.message || error);
    return res.status(500).json({ message: 'Lỗi server khi lấy danh sách viên chức' });
  }
};

export const getVienChucById = async (req, res) => {
  try {
    const data = await vienChucService.getVienChucById(req.params.id);
    if (!data) {
      console.log(`[vienChuc] getVienChucById - not found id=${req.params.id}`);
      return res.status(404).json({ message: 'Không tìm thấy viên chức' });
    }
    console.log(`[vienChuc] getVienChucById success - id=${req.params.id}`);
    return res.json(data);
  } catch (error) {
    console.error(`[vienChuc] getVienChucById error id=${req.params.id}:`, error.message || error);
    return res.status(500).json({ message: 'Lỗi server khi lấy viên chức' });
  }
};

// GET /vien-chuc/:id/chuc-vu
export const getChucVuByVienChuc = async (req, res) => {
  try {
    const data = await vienChucService.getVienChucById(req.params.id);
    if (!data) {
      console.log(`[vienChuc] getChucVuByVienChuc - not found id=${req.params.id}`);
      return res.status(404).json({ message: 'Không tìm thấy viên chức' });
    }
    console.log(`[vienChuc] getChucVuByVienChuc success - id=${req.params.id} chuc_vu=${data.id_chuc_vu}`);
    return res.json({ id_chuc_vu: data.id_chuc_vu });
  } catch (error) {
    console.error(`[vienChuc] getChucVuByVienChuc error id=${req.params.id}:`, error.message || error);
    return res.status(500).json({ message: 'Lỗi server khi lấy chức vụ viên chức' });
  }
};
