import HoSoTienDo from '../models/HoSoTienDo.js';

export const createTienDo = async (tienDoData, options = {}) => {
  return HoSoTienDo.create(tienDoData, options);
};

export const getTienDoByHoSo = async (hoSoId) => {
  return HoSoTienDo.findAll({ where: { id_ho_so: hoSoId } });
};
