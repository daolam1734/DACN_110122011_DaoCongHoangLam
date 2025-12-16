import * as HoSoRepository from '../repositories/hoSo.repository.js';
import * as VienChucRepository from '../repositories/vienChuc.repository.js'
import { HO_SO_TRANG_THAI } from '../constants/enum.js';
import { generateMaHoSo, getFirstBuocDuyet, findApproverForHoSo } from '../utils/hoSoUtils.js';
import * as workflowEngine from '../utils/workflowEngine.js'
import { logAudit } from '../utils/audit.js';
import sequelize from '../config/sequelize.js'

export const createHoSo = async (hoSoData, nguoiTaoId) => {
  // perform create inside a transaction to ensure consistency
  return await sequelize.transaction(async (t) => {
    // Ensure id_vien_chuc is set (creator) and populate defaults from VIEN_CHUC
    const creatorId = hoSoData.id_vien_chuc || nguoiTaoId || null
    if (!creatorId) throw new Error('Thiếu id viên chức tạo hồ sơ')
    const vc = await VienChucRepository.findById(creatorId)
    if (!vc) throw new Error('Không tìm thấy viên chức tạo hồ sơ')
    // Populate derived fields if not provided
    hoSoData.id_vien_chuc = creatorId
    if (!hoSoData.id_chuc_vu_khi_di) hoSoData.id_chuc_vu_khi_di = vc.id_chuc_vu
    const laDangVien = vc.la_dang_vien === true || vc.la_dang_vien === 'true'

    // Sinh mã hồ sơ tự động
    const maHoSo = await generateMaHoSo();
    // Gán bước duyệt đầu tiên (dựa trên loại và trạng thái đảng viên)
    const buocDuyetDauTienId = await getFirstBuocDuyet(hoSoData.loai_hinh_chuyen_di, laDangVien);
    const hoSo = await HoSoRepository.createHoSo({
      ...hoSoData,
      ma_ho_so: maHoSo,
      id_buoc_hien_tai: buocDuyetDauTienId,
      trang_thai_chung: HO_SO_TRANG_THAI.MOI_TAO
    }, { transaction: t });
    // Tìm người duyệt phù hợp cho bước hiện tại (không lưu vào DB — trả về thông tin để controller xử lý)
    const approver = await findApproverForHoSo({ id_vien_chuc: hoSoData.id_vien_chuc, id_buoc_hien_tai: buocDuyetDauTienId });
    if (approver) {
      // đính kèm thông tin người duyệt vào kết quả trả về cho controller (transient)
      hoSo.dataValues.approver = approver
    }
    // Sinh luồng duyệt động (danh sách các bước theo thứ tự) và đính kèm vào đối tượng trả về
    const steps = await workflowEngine.getWorkflowSteps(hoSoData.loai_hinh_chuyen_di, laDangVien)
    hoSo.dataValues.workflowSteps = steps || []
    // Ghi log audit trong cùng transaction
    await logAudit('HO_SO_DI_NUOC_NGOAI', hoSo.id_ho_so, 'INSERT', null, hoSo, nguoiTaoId, { transaction: t });
    return hoSo;
  })
};

export const getHoSoById = async (hoSoId) => {
  return HoSoRepository.getHoSoById(hoSoId);
};

export const getHoSoList = async (filter) => {
  return HoSoRepository.getHoSoList(filter);
};
