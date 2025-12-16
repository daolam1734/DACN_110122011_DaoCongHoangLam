import * as roleService from '../services/role.service.js'
import * as auditService from '../services/auditHeThong.service.js'

export const getRoles = async (req, res) => {
    try {
        const rows = await roleService.getAllRoles()
        return res.json(rows)
    } catch (err) {
        console.error('[role] getRoles error', err.message || err)
        return res.status(500).json({ message: 'Lỗi khi lấy vai trò' })
    }
}

export const patchRole = async (req, res) => {
    try {
        const id = req.params.id
        const { permissions, active, description } = req.body
        const before = await roleService.getRoleById(id)
        const updated = await roleService.updateRole(id, { permissions, active, description })
        await auditService.logAudit('ROLES', id, 'UPDATE', before, updated, req.user && req.user.email)
        return res.json(updated)
    } catch (err) {
        console.error('[role] patchRole error', err.message || err)
        return res.status(500).json({ message: 'Lỗi khi cập nhật vai trò' })
    }
}

export default { getRoles, patchRole }
