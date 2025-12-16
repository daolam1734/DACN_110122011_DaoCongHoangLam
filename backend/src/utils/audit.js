import AuditHeThong from '../models/AuditHeThong.js'

/**
 * Log an audit entry. Options may include a Sequelize transaction.
 * @param {string} ten_bang
 * @param {string|number|null} khoa_chinh
 * @param {string} hanh_dong
 * @param {object|null} du_lieu_cu
 * @param {object|null} du_lieu_moi
 * @param {number|null} nguoi_thuc_hien
 * @param {object} options - optional, may contain { transaction }
 */
export const logAudit = async (ten_bang, khoa_chinh, hanh_dong, du_lieu_cu, du_lieu_moi, nguoi_thuc_hien, options = {}) => {
    try {
        const payload = {
            ten_bang,
            khoa_chinh: khoa_chinh ? String(khoa_chinh) : null,
            hanh_dong,
            du_lieu_cu: du_lieu_cu || null,
            du_lieu_moi: du_lieu_moi || null,
            nguoi_thuc_hien: nguoi_thuc_hien || null
        }
        if (options.transaction) {
            return AuditHeThong.create(payload, { transaction: options.transaction })
        }
        return AuditHeThong.create(payload)
    } catch (err) {
        console.error('[utils.audit] logAudit error', err && err.message ? err.message : err)
        // Do not throw; audit must be best-effort
        return null
    }
}
