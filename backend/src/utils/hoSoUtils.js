import sequelize from '../config/sequelize.js'
import { QueryTypes } from 'sequelize'

export const generateMaHoSo = async () => {
    const now = new Date()
    const y = now.getFullYear()
    const m = String(now.getMonth() + 1).padStart(2, '0')
    const d = String(now.getDate()).padStart(2, '0')
    const t = String(now.getHours()).padStart(2, '0') + String(now.getMinutes()).padStart(2, '0') + String(now.getSeconds()).padStart(2, '0')
    const rand = Math.floor(Math.random() * 900 + 100)
    return `HS${y}${m}${d}${t}${rand}`
}

/**
 * Get the first approval step (id_buoc) from CAU_HINH_LUONG_DUYET for given trip type and isPartyMember flag.
 * Priority: exact match on loai_hinh_chuyen_di and la_dang_vien, then allow NULLs as wildcards.
 */
export const getFirstBuocDuyet = async (loaiHinh, laDangVien) => {
    try {
        const rows = await sequelize.query(
            `SELECT id_buoc FROM "CAU_HINH_LUONG_DUYET"
       WHERE (loai_hinh_chuyen_di = :loai OR loai_hinh_chuyen_di IS NULL)
         AND (la_dang_vien = :la OR la_dang_vien IS NULL)
       ORDER BY thu_tu_duyet ASC
       LIMIT 1`,
            { replacements: { loai: loaiHinh || null, la: laDangVien === true ? true : (laDangVien === 'true' ? true : false) }, type: QueryTypes.SELECT }
        )
        if (rows && rows[0]) return rows[0].id_buoc
        return null
    } catch (err) {
        console.error('[hoSoUtils] getFirstBuocDuyet error', err && err.message ? err.message : err)
        return null
    }
}

/**
 * Tìm người duyệt phù hợp cho hồ sơ dựa vào vai trò duyệt của bước hiện tại.
 * - Nếu vai_tro chứa 'truong' -> tìm viên chức có chức vụ chứa 'Trưởng' trong cùng đơn vị
 * - Nếu vai_tro chứa 'hieu' hoặc 'bgh' -> tìm viên chức có chức vụ thuộc nhóm BGH (hiệu trưởng/pt-hieu trưởng), không phụ thuộc đơn vị
 * - Fallback: tìm viên chức có cap_do_tham_quyen cao nhất trong đơn vị
 * Trả về đối tượng viên chức (một hàng) hoặc null nếu không tìm thấy.
 */
export const findApproverForHoSo = async ({ id_vien_chuc, id_buoc_hien_tai }) => {
    try {
        // Lấy vai trò duyệt từ DANH_MUC_BUOC_DUYET
        const roleRows = await sequelize.query(
            `SELECT vai_tro_duyet FROM "DANH_MUC_BUOC_DUYET" WHERE "id_buoc" = :id LIMIT 1`,
            { replacements: { id: id_buoc_hien_tai }, type: QueryTypes.SELECT }
        )
        const vaiTro = roleRows && roleRows[0] ? (roleRows[0].vai_tro_duyet || '').toLowerCase() : ''

        // Lấy thông tin viên chức tạo hồ sơ để biết đơn vị
        const creatorRows = await sequelize.query(
            `SELECT id_vien_chuc, id_don_vi FROM "VIEN_CHUC" WHERE "id_vien_chuc" = :id LIMIT 1`,
            { replacements: { id: id_vien_chuc }, type: QueryTypes.SELECT }
        )
        const donVi = creatorRows && creatorRows[0] ? creatorRows[0].id_don_vi : null

        if (!vaiTro) return null

        // Nếu vai trò là trưởng đơn vị
        if (vaiTro.includes('truong')) {
            const rows = await sequelize.query(
                `SELECT v.*, cv.ten_chuc_vu FROM "VIEN_CHUC" v
                 JOIN "CHUC_VU" cv ON v."id_chuc_vu" = cv."id_chuc_vu"
                 WHERE v."id_don_vi" = :donVi AND cv.ten_chuc_vu ILIKE '%Trưởng%' AND v.trang_thai_lam_viec = 'DANG_LAM_VIEC'
                 ORDER BY cv.cap_do_tham_quyen DESC
                 LIMIT 1`,
                { replacements: { donVi }, type: QueryTypes.SELECT }
            )
            if (rows && rows[0]) return rows[0]
        }

        // Nếu vai trò là BGH / hiệu trưởng
        if (vaiTro.includes('hieu') || vaiTro.includes('bgh')) {
            const rows = await sequelize.query(
                `SELECT v.*, cv.ten_chuc_vu FROM "VIEN_CHUC" v
                 JOIN "CHUC_VU" cv ON v."id_chuc_vu" = cv."id_chuc_vu"
                 WHERE (cv.ten_chuc_vu ILIKE '%Hiệu trưởng%' OR cv.ten_chuc_vu ILIKE '%Phó Hiệu trưởng%' OR cv.ten_chuc_vu ILIKE '%BGH%')
                     AND v.trang_thai_lam_viec = 'DANG_LAM_VIEC'
                 ORDER BY cv.cap_do_tham_quyen DESC
                 LIMIT 1`,
                { type: QueryTypes.SELECT }
            )
            if (rows && rows[0]) return rows[0]
        }

        // Fallback: tìm người có cap_do_tham_quyen cao nhất trong cùng đơn vị
        if (donVi) {
            const rows = await sequelize.query(
                `SELECT v.*, cv.ten_chuc_vu FROM "VIEN_CHUC" v
                 JOIN "CHUC_VU" cv ON v."id_chuc_vu" = cv."id_chuc_vu"
                 WHERE v."id_don_vi" = :donVi AND v.trang_thai_lam_viec = 'DANG_LAM_VIEC'
                 ORDER BY cv.cap_do_tham_quyen DESC
                 LIMIT 1`,
                { replacements: { donVi }, type: QueryTypes.SELECT }
            )
            if (rows && rows[0]) return rows[0]
        }

        return null
    } catch (err) {
        console.error('[hoSoUtils] findApproverForHoSo error', err && err.message ? err.message : err)
        return null
    }
}
