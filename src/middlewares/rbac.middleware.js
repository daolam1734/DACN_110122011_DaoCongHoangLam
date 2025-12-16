/**
 * RBAC middleware factory
 * Usage: app.use('/admin', requireRole('ADMIN'), adminRouter)
 * or router.post('/x', requireRole('ADMIN','MANAGER'), handler)
 */
export default function requireRole(...allowedRoles) {
    const norm = allowedRoles.map(r => (r || '').toString().toLowerCase())
    return (req, res, next) => {
        try {
            const user = req.user || null
            if (!user) return res.status(401).json({ message: 'Yêu cầu đăng nhập' })
            const roles = (user.roles || []).map(r => r.toString().toLowerCase())
            // also allow checking user's role property fields
            if (user.vai_tro) roles.push(user.vai_tro.toString().toLowerCase())
            if (user.chuc_danh) roles.push(user.chuc_danh.toString().toLowerCase())

            const ok = norm.some(r => roles.includes(r))
            if (!ok) return res.status(403).json({ message: 'Không có quyền truy cập' })
            return next()
        } catch (err) {
            console.error('[rbac] error', err && err.message ? err.message : err)
            return res.status(500).json({ message: 'Lỗi xác thực quyền' })
        }
    }
}
