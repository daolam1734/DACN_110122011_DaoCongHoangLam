import TaiLieuHoSo from '../models/TaiLieuHoSo.js';

export const createTaiLieu = async (taiLieuData) => {
  return TaiLieuHoSo.create(taiLieuData);
};

export const getTaiLieuByHoSo = async (hoSoId) => {
  return TaiLieuHoSo.findAll({ where: { id_ho_so: hoSoId } });
};
