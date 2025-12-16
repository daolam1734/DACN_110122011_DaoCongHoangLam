import AuditHeThong from '../models/AuditHeThong.js'
import VienChuc from '../models/VienChuc.js'
import HoSoDiNuocNgoai from '../models/HoSoDiNuocNgoai.js'
import TaiKhoan from '../models/TaiKhoanDangNhap.js'

// Simple mapping from route base to model/table info
const ROUTE_MAP = {
    'vien-chuc': { table: 'VIEN_CHUC', model: VienChuc, pk: 'id_vien_chuc' },
    'ho-so': { table: 'HO_SO_DI_NUOC_NGOAI', model: HoSoDiNuocNgoai, pk: 'id_ho_so' },
    'tai-khoan': { table: 'TAI_KHOAN_DANG_NHAP', model: TaiKhoan, pk: 'id_tai_khoan' }
}

const getActionFromMethod = (method) => {
    if (method === 'POST') return 'CREATE'
    if (method === 'PUT' || method === 'PATCH') return 'UPDATE'
    if (method === 'DELETE') return 'DELETE'
    return 'READ'
}

export default function auditMiddleware(req, res, next) {
    const pathParts = (req.path || '').split('/').filter(Boolean)
    const base = pathParts[0] || null
    const map = base ? ROUTE_MAP[base] : null
    const action = getActionFromMethod(req.method)

    // attempt to extract user id from req.user (if auth middleware sets it) or header for dev
    const userId = (req.user && (req.user.id_vien_chuc || req.user.id_tai_khoan)) ||
        (req.headers['x-user-id'] ? Number(req.headers['x-user-id']) : null)

    // preload old data for update/delete where possible (non-blocking)
    const preloadOld = async () => {
        try {
            if (map && (action === 'UPDATE' || action === 'DELETE')) {
                const idParam = req.params.id || pathParts[1] || (req.body && (req.body.id || req.body.id_ho_so || req.body.id_vien_chuc))
                if (idParam && map.model && typeof map.model.findByPk === 'function') {
                    try {
                        const old = await map.model.findByPk(idParam)
                        req.auditOld = old ? (old.toJSON ? old.toJSON() : old) : null
                    } catch (e) {
                        req.auditOld = null
                    }
                }
            }
        } catch (err) {
            // don't block request on audit errors
            console.error('[audit.middleware] preload error', err && err.message ? err.message : err)
        }
    }
    // fire-and-forget
    preloadOld()

    // after response finished, write audit record (best-effort)
    res.on('finish', async () => {
        try {
            // only record successful mutating operations or reads if desired
            const status = res.statusCode || 0
            // record on any status < 500 to avoid logging server error noise
            if (status >= 500) return

            const khoa_chinh = req.params.id || (req.body && (req.body.id || req.body.id_ho_so || req.body.id_vien_chuc)) || null
            const du_lieu_cu = req.auditOld || null
            let du_lieu_moi = null
            if (action === 'CREATE') du_lieu_moi = req.body || null
            if (action === 'UPDATE') du_lieu_moi = req.body || null
            if (action === 'DELETE') du_lieu_moi = null

            const ten_bang = map ? map.table : null

            await AuditHeThong.create({
                ten_bang,
                khoa_chinh: khoa_chinh ? String(khoa_chinh) : null,
                hanh_dong: action,
                du_lieu_cu,
                du_lieu_moi,
                nguoi_thuc_hien: userId || null
            })
        } catch (err) {
            console.error('[audit.middleware] write error', err && err.message ? err.message : err)
        }
    })

    next()
}
