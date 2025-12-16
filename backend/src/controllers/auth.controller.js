import * as authService from '../services/auth.service.js'

export const login = async (req, res) => {
  const { email, password } = req.body || {}
  console.log('[auth] login attempt', { email })
  if (!email || !password) return res.status(400).json({ message: 'Email và mật khẩu là bắt buộc' })
  try {
    const user = await authService.authenticate(email, password)
    if (!user) return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' })
    // Set a simple cookie to identify the user for demo/dev flows so protected endpoints
    // that rely on the simulated SSO middleware can read the email from cookie.
    // This is NOT a secure auth mechanism and only intended for local development.
    try {
      res.cookie('user_email', email, { httpOnly: false, sameSite: 'lax', path: '/' })
    } catch (e) {
      // ignore
    }
    // For now return basic user info (no JWT). Frontend uses this to show UI in demo.
    return res.json({ user })
  } catch (err) {
    console.error('[auth] login error', err.stack || err.message || err)
    return res.status(500).json({ message: 'Lỗi server khi đăng nhập', detail: err.message })
  }
}

export const demoInfo = async (req, res) => {
  try {
    const info = await authService.checkDemo()
    return res.json(info)
  } catch (err) {
    console.error('[auth] demoInfo error', err.stack || err.message || err)
    return res.status(500).json({ message: 'Lỗi server' })
  }
}

export const createAdmin = async (req, res) => {
  if (process.env.NODE_ENV === 'production') return res.status(403).json({ message: 'Not allowed in production' })
  const { email, name, password } = req.body || {}
  try {
    const info = await authService.createAdmin({ email, name, password })
    try { const { logAudit } = await import('../services/auditHeThong.service.js'); await logAudit('TAI_KHOAN_DANG_NHAP', info.id_tai_khoan || info.email || email, 'CREATE', null, info, req.user && req.user.email) } catch (e) { console.warn('audit failed', e.message || e) }
    return res.json(info)
  } catch (err) {
    console.error('[auth] createAdmin error', err.stack || err.message || err)
    return res.status(500).json({ message: 'Lỗi khi tạo admin', detail: err.message })
  }
}
