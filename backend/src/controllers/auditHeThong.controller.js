import * as AuditHeThongService from '../services/auditHeThong.service.js';

export const getAudit = async (req, res) => {
  try {
    const { bang, hoSoId, limit } = req.query;
    let result = [];
    if (bang) {
      result = await AuditHeThongService.getAuditByBang(bang);
    } else if (hoSoId) {
      result = await AuditHeThongService.getAuditByHoSoId(hoSoId);
    } else {
      result = await AuditHeThongService.getRecent(limit ? parseInt(limit, 10) : 50);
    }
    res.json(result || []);
  } catch (err) {
    console.error('[audit.controller] getAudit error', err.message || err);
    res.status(500).json({ message: 'Lỗi khi lấy nhật ký' });
  }
};
