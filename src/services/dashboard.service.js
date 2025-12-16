import sequelize from '../config/sequelize.js'
import { QueryTypes } from 'sequelize'
import * as HoSoRepository from '../repositories/hoSo.repository.js'
import { findApproverForHoSo } from '../utils/hoSoUtils.js'

export const getDashboardForUser = async (user) => {
  const userId = user?.id_vien_chuc || null
  if (!userId) throw new Error('User not authenticated')

  // 1. Counts of my hồ sơ by trạng_thai_chung
  const countsRows = await sequelize.query(
    `SELECT trang_thai_chung, COUNT(*) AS cnt FROM "HO_SO_DI_NUOC_NGOAI" WHERE "id_vien_chuc" = :id GROUP BY trang_thai_chung`,
    { replacements: { id: userId }, type: QueryTypes.SELECT }
  )
  const myHoSoCounts = {}
  countsRows.forEach(r => { myHoSoCounts[r.trang_thai_chung] = parseInt(r.cnt, 10) })

  // 2. Recent my hồ sơ
  const recent = await sequelize.query(
    `SELECT h.id_ho_so, h.ma_ho_so, h.loai_hinh_chuyen_di, h.trang_thai_chung, h.id_buoc_hien_tai, h.thoi_gian_tao, v.ho_va_ten
     FROM "HO_SO_DI_NUOC_NGOAI" h
     LEFT JOIN "VIEN_CHUC" v ON h."id_vien_chuc" = v."id_vien_chuc"
     WHERE h."id_vien_chuc" = :id
     ORDER BY h.thoi_gian_tao DESC
     LIMIT 6`,
    { replacements: { id: userId }, type: QueryTypes.SELECT }
  )

  // 3. Pending approvals that this user should act on (scan candidates and run approver resolver)
  const candidates = await sequelize.query(
    `SELECT h.id_ho_so, h.id_vien_chuc, h.id_buoc_hien_tai, h.ma_ho_so, h.loai_hinh_chuyen_di, h.trang_thai_chung
     FROM "HO_SO_DI_NUOC_NGOAI" h
     WHERE h."id_buoc_hien_tai" IS NOT NULL AND h.trang_thai_chung IN ('CHO_DUYET','DANG_XU_LY')
     ORDER BY h.thoi_gian_tao DESC
     LIMIT 200`,
    { type: QueryTypes.SELECT }
  )

  let myPending = []
  for (const c of candidates) {
    const approver = await findApproverForHoSo({ id_vien_chuc: c.id_vien_chuc, id_buoc_hien_tai: c.id_buoc_hien_tai })
    if (approver && approver.id_vien_chuc === userId) {
      myPending.push(c)
    }
  }

  // 4. Recent activities (HO_SO_TIEN_DO) by/for user
  const activities = await sequelize.query(
    `SELECT t.* FROM "HO_SO_TIEN_DO" t WHERE t."nguoi_xu_ly" = :id OR t."id_ho_so" IN (SELECT id_ho_so FROM "HO_SO_DI_NUOC_NGOAI" WHERE "id_vien_chuc" = :id) ORDER BY t.thoi_gian_xu_ly DESC LIMIT 10`,
    { replacements: { id: userId }, type: QueryTypes.SELECT }
  )

  return {
    myHoSoCounts,
    recentHoSo: recent,
    myPendingApprovals: myPending,
    recentActivities: activities
  }
}

export default { getDashboardForUser }
