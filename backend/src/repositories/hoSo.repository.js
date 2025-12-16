import HoSoDiNuocNgoai from '../models/HoSoDiNuocNgoai.js';
import sequelize from '../config/sequelize.js';
import { QueryTypes } from 'sequelize';

export const createHoSo = async (hoSoData, options = {}) => {
  return HoSoDiNuocNgoai.create(hoSoData, options);
};

export const getHoSoById = async (hoSoId) => {
  return HoSoDiNuocNgoai.findByPk(hoSoId);
};

export const getHoSoList = async (filter = {}) => {
  // return joined data: ho so + vien chuc (ten, don vi) + current buoc
  const whereClause = []
  const replacements = {}
  if (filter.trangThaiChung) {
    whereClause.push('h.trang_thai_chung = :trangThai')
    replacements.trangThai = filter.trangThaiChung
  }
  const whereSql = whereClause.length ? `WHERE ${whereClause.join(' AND ')}` : ''

  const sql = `
    SELECT h.id_ho_so, h.ma_ho_so, h.loai_hinh_chuyen_di, h.trang_thai_chung, h.id_buoc_hien_tai, h.thoi_gian_tao,
           v.ho_va_ten AS ho_va_ten, dv.ten_don_vi AS don_vi, b.ten_buoc AS buoc_hien_tai
    FROM "HO_SO_DI_NUOC_NGOAI" h
    LEFT JOIN "VIEN_CHUC" v ON h.id_vien_chuc = v.id_vien_chuc
    LEFT JOIN "DON_VI_TO_CHUC" dv ON v.id_don_vi = dv.id_don_vi
    LEFT JOIN "DANH_MUC_BUOC_DUYET" b ON h.id_buoc_hien_tai = b.id_buoc
    ${whereSql}
    ORDER BY h.thoi_gian_tao DESC
  `;

  const rows = await sequelize.query(sql, { replacements, type: QueryTypes.SELECT });
  return rows;
};
