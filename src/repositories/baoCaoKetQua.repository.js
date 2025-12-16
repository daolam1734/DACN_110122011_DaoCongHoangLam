import BaoCaoKetQua from '../models/BaoCaoKetQua.js';

export const createBaoCao = async (baoCaoData) => {
  return BaoCaoKetQua.create(baoCaoData);
};

export const getBaoCaoByHoSo = async (hoSoId) => {
  return BaoCaoKetQua.findOne({ where: { id_ho_so: hoSoId } });
};
