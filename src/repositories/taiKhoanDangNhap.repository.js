import TaiKhoanDangNhap from '../models/TaiKhoanDangNhap.js';

export const findByEmail = async (email) => {
  return TaiKhoanDangNhap.findOne({ where: { email_dang_nhap: email } });
};

export const findById = async (id) => {
  return TaiKhoanDangNhap.findByPk(id);
};

export const createTaiKhoan = async (data) => {
  return TaiKhoanDangNhap.create(data);
};

export const updateLastLogin = async (id) => {
  return TaiKhoanDangNhap.update({ lan_dang_nhap_cuoi: new Date() }, { where: { id_tai_khoan: id } });
};
