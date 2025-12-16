// Centralized permission utility
export const ROLE_TO_PERMS = {
    ADMIN: ['DUYET_HO_SO', 'CAU_HINH_LUONG', 'XEM_BAO_CAO', 'QUAN_LY_GIAY_TO', 'QUAN_LY_DON_VI'],
    TRUONG_PHONG: ['DUYET_HO_SO', 'XEM_BAO_CAO'],
}

export function hasPermission(user, perm) {
    if (!user) return false
    if (user.isAdmin || user.is_admin) return true
    if (Array.isArray(user.permissions) && user.permissions.includes(perm)) return true
    if (Array.isArray(user.roles)) {
        for (const r of user.roles) {
            if (!r) continue
            const key = typeof r === 'string' ? r.toUpperCase() : (r.name && r.name.toUpperCase())
            if (ROLE_TO_PERMS[key] && ROLE_TO_PERMS[key].includes(perm)) return true
        }
    }
    return false
}

export default { hasPermission, ROLE_TO_PERMS }
