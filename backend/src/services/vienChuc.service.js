import * as vienChucRepo from '../repositories/vienChuc.repository.js';

export const getAllVienChuc = async () => {
  // Có thể bổ sung logic phân quyền, lọc, ... ở đây
  return vienChucRepo.findAll();
};

export const getVienChucById = async (id) => {
  // Có thể bổ sung logic kiểm tra quyền, validate, ... ở đây
  return vienChucRepo.findById(id);
};
