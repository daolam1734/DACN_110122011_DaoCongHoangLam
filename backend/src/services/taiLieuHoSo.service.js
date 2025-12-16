import * as TaiLieuHoSoRepository from '../repositories/taiLieuHoSo.repository.js';
import { getCauHinhGiayTo } from '../utils/giayToUtils.js';

export const uploadTaiLieu = async (hoSoId, taiLieuData) => {
  // Đối chiếu cấu hình giấy tờ
  const cauHinh = await getCauHinhGiayTo(taiLieuData.ma_loai_giay_to);
  // Có thể kiểm tra phân biệt tài liệu Đảng ở đây
  return TaiLieuHoSoRepository.createTaiLieu({ ...taiLieuData, id_ho_so: hoSoId });
};

export const getTaiLieuList = async (hoSoId) => {
  return TaiLieuHoSoRepository.getTaiLieuByHoSo(hoSoId);
};
