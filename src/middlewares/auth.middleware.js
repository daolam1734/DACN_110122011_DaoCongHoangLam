import TaiKhoan from '../models/TaiKhoanDangNhap.js'
import VienChuc from '../models/VienChuc.js'
import sequelize from '../config/sequelize.js'
import { QueryTypes } from 'sequelize'

/**
 * Simulated SSO middleware.
 * - Accepts header `x-user-email` (or Authorization: Bearer <email>) in dev.
 * - Resolves account -> vien chuc -> primary chức vụ, đơn vị and any kiêm nhiệm chức vụ.
 * - Attaches `req.user` with shape: { id_vien_chuc, ho_va_ten, email, don_vi, chuc_danh, roles, kiem_nhiem }
 */
export default async function ssoMiddleware(req, res, next) {
    try {
        const header = req.headers['x-user-email'] || req.headers['authorization'] || ''
        let email = ''
        if (header && header.toLowerCase().startsWith('bearer ')) {
            email = header.slice(7).trim()
        } else if (header) {
            email = header.trim()
        }

        // If no header provided, try cookies (login sets a demo cookie 'user_email')
        if (!email && req.headers && req.headers.cookie) {
            const cookie = req.headers.cookie.split(';').map(s => s.trim()).find(s => s.startsWith('user_email='))
            if (cookie) {
                email = decodeURIComponent(cookie.split('=')[1] || '')
            }
        }

        if (!email) {
            req.user = null
            return next()
        }

        // find account by email or vien chuc by email_cong_vu
        let account = null
        try { account = await TaiKhoan.findOne({ where: { email_dang_nhap: email } }) } catch (e) { account = null }
        let vc = null
        if (account && account.id_vien_chuc) {
            try { vc = await VienChuc.findOne({ where: { id_vien_chuc: account.id_vien_chuc } }) } catch (e) { vc = null }
        }
        if (!vc) {
            try { vc = await VienChuc.findOne({ where: { email_cong_vu: email } }) } catch (e) { vc = null }
        }

        let donVi = null
        let chucVuPrimary = null
        let kiemNhiem = []
        // fetch human-friendly names and kiem nhiem
        if (vc) {
            const rows = await sequelize.query(
                `SELECT dv.ten_don_vi AS don_vi, cv.ten_chuc_vu AS chuc_danh
         FROM "VIEN_CHUC" v
         LEFT JOIN "DON_VI_TO_CHUC" dv ON v."id_don_vi" = dv."id_don_vi"
         LEFT JOIN "CHUC_VU" cv ON v."id_chuc_vu" = cv."id_chuc_vu"
         WHERE v."id_vien_chuc" = :id`,
                { replacements: { id: vc.id_vien_chuc }, type: QueryTypes.SELECT }
            )
            if (rows && rows[0]) {
                donVi = rows[0].don_vi || null
                chucVuPrimary = rows[0].chuc_danh || null
            }

            // kiem nhiem: fetch assigned chuc_vu + don_vi from VIEN_CHUC_KIEM_NHIEM
            const kn = await sequelize.query(
                `SELECT dv.ten_don_vi AS don_vi, cv.ten_chuc_vu AS chuc_danh
         FROM "VIEN_CHUC_KIEM_NHIEM" k
         LEFT JOIN "DON_VI_TO_CHUC" dv ON k."id_don_vi" = dv."id_don_vi"
         LEFT JOIN "CHUC_VU" cv ON k."id_chuc_vu" = cv."id_chuc_vu"
         WHERE k."id_vien_chuc" = :id AND k."trang_thai" = true`,
                { replacements: { id: vc.id_vien_chuc }, type: QueryTypes.SELECT }
            )
            if (kn && kn.length) kiemNhiem = kn.map(r => ({ don_vi: r.don_vi || null, chuc_danh: r.chuc_danh || null }))
        }

        const roles = []
        if (account && account.loai_dang_nhap) roles.push(account.loai_dang_nhap)
        if (account && account.loai_dang_nhap === undefined && account.vai_tro) roles.push(account.vai_tro)
        if (chucVuPrimary) roles.push(chucVuPrimary)
        if (kiemNhiem && kiemNhiem.length) kiemNhiem.forEach(k => { if (k.chuc_danh) roles.push(k.chuc_danh) })

        req.user = {
            id_vien_chuc: vc?.id_vien_chuc || null,
            ho_va_ten: vc?.ho_va_ten || (account ? null : null),
            email: email,
            don_vi: donVi,
            chuc_danh: chucVuPrimary,
            kiem_nhiem: kiemNhiem,
            roles: Array.from(new Set(roles.filter(Boolean)))
        }

        // dev-only logging to help debug auth/roles
        if (process.env.NODE_ENV !== 'production') {
            try { console.log('[sso.middleware] resolved user', { email: req.user.email, id_vien_chuc: req.user.id_vien_chuc, roles: req.user.roles, chuc_danh: req.user.chuc_danh }) } catch (e) { }
        }

        return next()
    } catch (err) {
        console.error('[sso.middleware] error', err && err.message ? err.message : err)
        req.user = null
        return next()
    }
}
