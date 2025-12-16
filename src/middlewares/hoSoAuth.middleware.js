import * as HoSoRepository from '../repositories/hoSo.repository.js'
import sequelize from '../config/sequelize.js'
import { QueryTypes } from 'sequelize'

export default async function requireHoSoStepAuthority(req, res, next) {
    try {
        const hoSoId = req.params.id
        if (!hoSoId) return res.status(400).json({ message: 'Thiếu id hồ sơ' })

        const hoSo = await HoSoRepository.getHoSoById(hoSoId)
        if (!hoSo) return res.status(404).json({ message: 'Không tìm thấy hồ sơ' })

        const buocId = hoSo.id_buoc_hien_tai || hoSo.idBuoc || null
        if (!buocId) return res.status(400).json({ message: 'Hồ sơ chưa có bước xử lý' })

        const rows = await sequelize.query(
            `SELECT vai_tro_duyet FROM "DANH_MUC_BUOC_DUYET" WHERE "id_buoc" = :id LIMIT 1`,
            { replacements: { id: buocId }, type: QueryTypes.SELECT }
        )
        const expectedRole = (rows && rows[0] && rows[0].vai_tro_duyet) ? rows[0].vai_tro_duyet : null

        // allow ADMINs always
        const user = req.user || {}
        const userRoles = (user.roles || []).map(r => r.toString().toLowerCase())
        if (user.vai_tro) userRoles.push(user.vai_tro.toString().toLowerCase())
        if (user.chuc_danh) userRoles.push(user.chuc_danh.toString().toLowerCase())
        if (user.kiem_nhiem && Array.isArray(user.kiem_nhiem)) {
            user.kiem_nhiem.forEach(k => { if (k.chuc_danh) userRoles.push(k.chuc_danh.toString().toLowerCase()) })
        }

        if (userRoles.includes('admin')) return next()

        if (!expectedRole) {
            return res.status(403).json({ message: 'Không có quyền xử lý hồ sơ tại bước này' })
        }

        // Build list of approver ids for this step
        let approverIds = []

        // fetch creator's unit
        const creator = await sequelize.query(
            `SELECT id_vien_chuc, id_don_vi FROM "VIEN_CHUC" WHERE "id_vien_chuc" = :id LIMIT 1`,
            { replacements: { id: hoSo.id_vien_chuc }, type: QueryTypes.SELECT }
        )
        const donViId = (creator && creator[0]) ? creator[0].id_don_vi : null

        const roleLower = expectedRole.toString().toLowerCase()

        if (roleLower.includes('truong')) {
            const rows2 = await sequelize.query(
                `SELECT v.id_vien_chuc FROM "VIEN_CHUC" v
                 JOIN "CHUC_VU" cv ON v."id_chuc_vu" = cv."id_chuc_vu"
                 WHERE v."id_don_vi" = :donVi AND cv.ten_chuc_vu ILIKE '%Trưởng%' AND v.trang_thai_lam_viec = 'DANG_LAM_VIEC'`,
                { replacements: { donVi: donViId }, type: QueryTypes.SELECT }
            )
            approverIds = rows2.map(r => r.id_vien_chuc)
        } else if (roleLower.includes('hieu') || roleLower.includes('bgh')) {
            const rows2 = await sequelize.query(
                `SELECT v.id_vien_chuc FROM "VIEN_CHUC" v
                 JOIN "CHUC_VU" cv ON v."id_chuc_vu" = cv."id_chuc_vu"
                 WHERE (cv.ten_chuc_vu ILIKE '%Hiệu trưởng%' OR cv.ten_chuc_vu ILIKE '%Phó Hiệu trưởng%' OR cv.ten_chuc_vu ILIKE '%BGH%')
                   AND v.trang_thai_lam_viec = 'DANG_LAM_VIEC'`,
                { type: QueryTypes.SELECT }
            )
            approverIds = rows2.map(r => r.id_vien_chuc)
        } else {
            // Fallback: allow if user's role string matches expectedRole (existing behavior)
            if (userRoles.includes(expectedRole.toString().toLowerCase())) return next()
        }

        // If no approvers found, deny
        if (!approverIds || approverIds.length === 0) return res.status(403).json({ message: 'Không có quyền xử lý hồ sơ tại bước này' })

        // Check if current user is among approvers
        const currentUserId = user.id_vien_chuc
        if (currentUserId && approverIds.includes(currentUserId)) return next()

        return res.status(403).json({ message: 'Không có quyền xử lý hồ sơ tại bước này' })
    } catch (err) {
        console.error('[hoSoAuth] error', err && err.message ? err.message : err)
        return res.status(500).json({ message: 'Lỗi kiểm tra quyền' })
    }
}
