import * as TaiKhoanDangNhapRepository from '../repositories/taiKhoanDangNhap.repository.js';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';

export async function createTaiKhoanAdmin({ idVienChuc, email }) {
  if (!email.endsWith('@tvu.edu.vn')) throw new Error('Chỉ chấp nhận email công vụ!');
  const matKhauTam = randomBytes(4).toString('hex');
  const matKhauHash = await bcrypt.hash(matKhauTam, 10);
  const taiKhoan = await TaiKhoanDangNhapRepository.createTaiKhoan({
    id_vien_chuc: idVienChuc,
    email_dang_nhap: email,
    mat_khau_hash: matKhauHash
  });
  // Demo gửi email: log ra console
  console.log(`[EMAIL DEMO] Gửi mật khẩu tạm cho ${email}: ${matKhauTam}`);
  return taiKhoan;
}

export async function khoaTaiKhoan(idTaiKhoan) {
  return TaiKhoanDangNhapRepository.updateTaiKhoan(idTaiKhoan, { trang_thai: 'KHOA' });
}
