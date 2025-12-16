import * as BaoCaoKetQuaRepository from '../repositories/baoCaoKetQua.repository.js';
import { addDays } from '../utils/dateUtils.js';
import HoSoDiNuocNgoai from '../models/HoSoDiNuocNgoai.js'
import { HO_SO_TRANG_THAI } from '../constants/enum.js'

export const nopBaoCao = async (hoSoId, baoCaoData) => {
  // Kiểm tra trạng thái hồ sơ phải là HOAN_THANH
  const hoSo = await HoSoDiNuocNgoai.findByPk(hoSoId);
  if (!hoSo) throw new Error('Không tìm thấy hồ sơ')
  if (hoSo.trang_thai_chung !== HO_SO_TRANG_THAI.HOAN_THANH) {
    throw new Error('Chỉ được nộp báo cáo khi hồ sơ đã HOAN_THANH')
  }
  // Tự sinh deadline nếu chưa có
  let hanNop = baoCaoData.han_nop_bao_cao;
  if (!hanNop) {
    // Ví dụ: deadline mặc định là 15 ngày sau ngày về thực tế
    hanNop = addDays(baoCaoData.ngay_ve_thuc_te, 15);
  }
  return BaoCaoKetQuaRepository.createBaoCao({ ...baoCaoData, id_ho_so: hoSoId, han_nop_bao_cao: hanNop, ngay_nop: new Date() });
};

export const getBaoCao = async (hoSoId) => {
  const baoCao = await BaoCaoKetQuaRepository.getBaoCaoByHoSo(hoSoId);
  // Cảnh báo quá hạn
  let canhBaoQuaHan = false;
  if (baoCao && baoCao.han_nop_bao_cao && baoCao.ngay_nop && new Date(baoCao.ngay_nop) > new Date(baoCao.han_nop_bao_cao)) {
    canhBaoQuaHan = true;
  }
  return { ...baoCao?.toJSON(), canhBaoQuaHan };
};
