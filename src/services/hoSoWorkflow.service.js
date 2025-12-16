import * as HoSoTienDoRepository from '../repositories/hoSoTienDo.repository.js';
import HoSoDiNuocNgoai from '../models/HoSoDiNuocNgoai.js';
import { HO_SO_TRANG_THAI, KET_QUA_XU_LY } from '../constants/enum.js';
import { logAudit } from '../utils/audit.js';
import sequelize from '../config/sequelize.js'
import * as workflowEngine from '../utils/workflowEngine.js'
import { QueryTypes } from 'sequelize'
import TaiLieuHoSo from '../models/TaiLieuHoSo.js'

export const duyetHoSo = async (hoSoId, tienDoData, nguoiXuLyId) => {
  return await sequelize.transaction(async (t) => {
    // Lấy hồ sơ hiện tại với lock
    const hoSo = await HoSoDiNuocNgoai.findByPk(hoSoId, { transaction: t, lock: t.LOCK.UPDATE });
    if (!hoSo) throw new Error('Không tìm thấy hồ sơ')

    // Lấy danh sách bước duyệt cho loại hồ sơ
    const steps = await workflowEngine.getWorkflowSteps(hoSo.loai_hinh_chuyen_di, hoSo.la_dang_vien);
    const idx = steps.findIndex(s => s.id_buoc === hoSo.id_buoc_hien_tai);

    // Trước khi tạo tiến độ, kiểm tra giấy tờ bắt buộc nếu cần
    if (idx >= 0) {
      // Nếu sẽ chuyển sang bước tiếp theo hoặc hoàn tất, đều phải kiểm tra giấy tờ bắt buộc
      const cauHinhGiayTo = await sequelize.query(
        `SELECT ma_loai_giay_to, ten_giay_to, la_bat_buoc FROM "CAU_HINH_GIAY_TO"
         WHERE (loai_hinh_chuyen_di = :loai OR loai_hinh_chuyen_di IS NULL)
           AND (ap_dung_cho_dang_vien = :la OR ap_dung_cho_dang_vien IS NULL)`,
        { replacements: { loai: hoSo.loai_hinh_chuyen_di, la: hoSo.la_dang_vien }, type: QueryTypes.SELECT, transaction: t }
      )

      // danh sách mã loại giấy tờ đã upload cho hồ sơ
      const uploaded = await sequelize.query(
        `SELECT DISTINCT ma_loai_giay_to FROM "TAI_LIEU_HO_SO" WHERE "id_ho_so" = :id`,
        { replacements: { id: hoSoId }, type: QueryTypes.SELECT, transaction: t }
      )
      const uploadedSet = new Set((uploaded || []).map(r => r.ma_loai_giay_to))

      const missing = (cauHinhGiayTo || []).filter(g => g.la_bat_buoc).filter(g => !uploadedSet.has(g.ma_loai_giay_to))
      if (missing.length) {
        const names = missing.map(m => m.ten_giay_to || m.ma_loai_giay_to).join(', ')
        throw new Error(`Thiếu giấy tờ bắt buộc: ${names}`)
      }
    }

    // Tạo bản ghi tiến độ (trong transaction)
    const tienDo = await HoSoTienDoRepository.createTienDo({
      ...tienDoData,
      id_ho_so: hoSoId,
      ket_qua_xu_ly: KET_QUA_XU_LY.DONG_Y,
      nguoi_xu_ly: nguoiXuLyId,
      thoi_gian_xu_ly: new Date()
    }, { transaction: t });

    let updatePayload = {}
    if (idx >= 0 && idx < steps.length - 1) {
      // Chuyển sang bước tiếp theo
      const next = steps[idx + 1]
      updatePayload.id_buoc_hien_tai = next.id_buoc
      // Chờ duyệt ở bước tiếp theo
      updatePayload.trang_thai_chung = HO_SO_TRANG_THAI.CHO_DUYET
    } else if (idx === steps.length - 1) {
      // Đây là bước cuối hiện tại: đánh dấu hoàn tất và khóa luồng duyệt
      updatePayload.trang_thai_chung = HO_SO_TRANG_THAI.HOAN_THANH
      updatePayload.id_buoc_hien_tai = null
    } else {
      // Nếu không xác định được thứ tự, giữ nguyên trạng thái
      updatePayload = {}
    }

    // Lưu thay đổi hồ sơ nếu có
    if (Object.keys(updatePayload).length) {
      await HoSoDiNuocNgoai.update(updatePayload, { where: { id_ho_so: hoSoId }, transaction: t });
    }

    // Ghi log audit trong cùng transaction: ghi UPDATE của hồ sơ (trước có thể là hoSo, sau là patched)
    const afterHoSo = await HoSoDiNuocNgoai.findByPk(hoSoId, { transaction: t });
    await logAudit('HO_SO_DI_NUOC_NGOAI', hoSoId, 'UPDATE', hoSo, afterHoSo, nguoiXuLyId, { transaction: t });

    return afterHoSo;
  })
};

export const tuChoiHoSo = async (hoSoId, tienDoData, nguoiXuLyId) => {
  return await sequelize.transaction(async (t) => {
    // create tien do
    const tienDo = await HoSoTienDoRepository.createTienDo({
      ...tienDoData,
      id_ho_so: hoSoId,
      ket_qua_xu_ly: KET_QUA_XU_LY.TU_CHOI,
      nguoi_xu_ly: nguoiXuLyId,
      thoi_gian_xu_ly: new Date()
    }, { transaction: t });

    // fetch old ho so
    const hoSoOld = await HoSoDiNuocNgoai.findByPk(hoSoId, { transaction: t, lock: t.LOCK.UPDATE });
    if (!hoSoOld) throw new Error('Không tìm thấy hồ sơ')

    // update status
    await HoSoDiNuocNgoai.update({ trang_thai_chung: HO_SO_TRANG_THAI.TU_CHOI }, { where: { id_ho_so: hoSoId }, transaction: t });

    const hoSoNew = await HoSoDiNuocNgoai.findByPk(hoSoId, { transaction: t });
    await logAudit('HO_SO_DI_NUOC_NGOAI', hoSoId, 'UPDATE', hoSoOld, hoSoNew, nguoiXuLyId, { transaction: t });
    return hoSoNew;
  })
};

export const traLaiHoSo = async (hoSoId, tienDoData, nguoiXuLyId) => {
  return await sequelize.transaction(async (t) => {
    const tienDo = await HoSoTienDoRepository.createTienDo({
      ...tienDoData,
      id_ho_so: hoSoId,
      ket_qua_xu_ly: KET_QUA_XU_LY.TRA_LAI,
      nguoi_xu_ly: nguoiXuLyId,
      thoi_gian_xu_ly: new Date()
    }, { transaction: t });

    const hoSoOld = await HoSoDiNuocNgoai.findByPk(hoSoId, { transaction: t, lock: t.LOCK.UPDATE });
    if (!hoSoOld) throw new Error('Không tìm thấy hồ sơ')

    await HoSoDiNuocNgoai.update({ trang_thai_chung: HO_SO_TRANG_THAI.TRA_LAI }, { where: { id_ho_so: hoSoId }, transaction: t });

    const hoSoNew = await HoSoDiNuocNgoai.findByPk(hoSoId, { transaction: t });
    await logAudit('HO_SO_DI_NUOC_NGOAI', hoSoId, 'UPDATE', hoSoOld, hoSoNew, nguoiXuLyId, { transaction: t });
    return hoSoNew;
  })
};
