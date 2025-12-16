import sequelize from '../config/sequelize.js';
import { QueryTypes } from 'sequelize';

export const findAll = async () => {
  // Return vien chuc with human-friendly unit and title names
  const sql = `
    SELECT v.id_vien_chuc, v.ma_so_vien_chuc, v.ho_va_ten, v.email_cong_vu, v.ngay_sinh,
           v.id_don_vi, v.id_chuc_vu, v.id_ngach, v.la_dang_vien, v.trang_thai_lam_viec,
           dv.ten_don_vi AS don_vi, cv.ten_chuc_vu AS chuc_danh
    FROM "VIEN_CHUC" v
    LEFT JOIN "DON_VI_TO_CHUC" dv ON v."id_don_vi" = dv."id_don_vi"
    LEFT JOIN "CHUC_VU" cv ON v."id_chuc_vu" = cv."id_chuc_vu"
    ORDER BY v.ma_so_vien_chuc
  `;
  return sequelize.query(sql, { type: QueryTypes.SELECT });
};

export const findById = async (id) => {
  const sql = `
    SELECT v.id_vien_chuc, v.ma_so_vien_chuc, v.ho_va_ten, v.email_cong_vu, v.ngay_sinh,
           v.id_don_vi, v.id_chuc_vu, v.id_ngach, v.la_dang_vien, v.trang_thai_lam_viec,
           dv.ten_don_vi AS don_vi, cv.ten_chuc_vu AS chuc_danh
    FROM "VIEN_CHUC" v
    LEFT JOIN "DON_VI_TO_CHUC" dv ON v."id_don_vi" = dv."id_don_vi"
    LEFT JOIN "CHUC_VU" cv ON v."id_chuc_vu" = cv."id_chuc_vu"
    WHERE v."id_vien_chuc" = :id
    LIMIT 1
  `;
  const rows = await sequelize.query(sql, { replacements: { id }, type: QueryTypes.SELECT });
  return rows && rows.length ? rows[0] : null;
};
