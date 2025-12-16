import TaiKhoan from '../models/TaiKhoanDangNhap.js'
import VienChuc from '../models/VienChuc.js'
import bcrypt from 'bcryptjs'
import sequelize from '../config/sequelize.js'
import { QueryTypes } from 'sequelize'

export const authenticate = async (email, password) => {
  try {
    // try to find by account table first
    let account = await TaiKhoan.findOne({ where: { email_dang_nhap: email } })
    if (account) {
      const hash = account.mat_khau_hash || ''
      if (hash) {
        const ok = await bcrypt.compare(password, hash)
        if (!ok) return null
        // find linked vien chuc
        const vc = await VienChuc.findOne({ where: { id_vien_chuc: account.id_vien_chuc } })
        let donVi = null
        let chucVu = null
        if (vc) {
          const rows = await sequelize.query(
            `SELECT dv.ten_don_vi AS don_vi, cv.ten_chuc_vu AS chuc_danh
             FROM "VIEN_CHUC" v
             LEFT JOIN "DON_VI_TO_CHUC" dv ON v."id_don_vi" = dv."id_don_vi"
             LEFT JOIN "CHUC_VU" cv ON v."id_chuc_vu" = cv."id_chuc_vu"
             WHERE v."id_vien_chuc" = :id`,
            { replacements: { id: vc.id_vien_chuc }, type: QueryTypes.SELECT }
          )
          if (rows && rows.length > 0) {
            donVi = rows[0].don_vi || null
            chucVu = rows[0].chuc_danh || null
          }
        }
        const roles = []
        if (account && account.loai_dang_nhap) roles.push(account.loai_dang_nhap)
        if (account && account.vai_tro) roles.push(account.vai_tro)
        if (chucVu) roles.push(chucVu)
        return {
          id_vien_chuc: vc?.id_vien_chuc || null,
          ho_va_ten: vc?.ho_va_ten || null,
          email: account.email_dang_nhap,
          don_vi: donVi,
          chuc_danh: chucVu,
          roles: Array.from(new Set(roles.filter(Boolean)))
        }
      }
    }

    // fallback: try to find vien chuc by email_cong_vu
    const vc = await VienChuc.findOne({ where: { email_cong_vu: email } })
    if (vc) {
      // in demo mode accept password 'demo' if no account exists
      if (password === 'demo') {
        // fetch human-friendly unit/title names
        const rows = await sequelize.query(
          `SELECT dv.ten_don_vi AS don_vi, cv.ten_chuc_vu AS chuc_danh
           FROM "VIEN_CHUC" v
           LEFT JOIN "DON_VI_TO_CHUC" dv ON v."id_don_vi" = dv."id_don_vi"
           LEFT JOIN "CHUC_VU" cv ON v."id_chuc_vu" = cv."id_chuc_vu"
           WHERE v."id_vien_chuc" = :id`,
          { replacements: { id: vc.id_vien_chuc }, type: QueryTypes.SELECT }
        )
        const donVi = (rows && rows[0]) ? rows[0].don_vi : null
        const chucVu = (rows && rows[0]) ? rows[0].chuc_danh : null
        // roles: include a demo USER role when using demo fallback
        const roles = ['USER']
        if (chucVu) roles.push(chucVu)
        return { id_vien_chuc: vc.id_vien_chuc, ho_va_ten: vc.ho_va_ten, email: vc.email_cong_vu, don_vi: donVi, chuc_danh: chucVu, roles }
      }
      // otherwise, if there is an account with this id, check its hash
      if (account) {
        const ok = await bcrypt.compare(password, account.mat_khau_hash || '')
        if (ok) {
          const rows = await sequelize.query(
            `SELECT dv.ten_don_vi AS don_vi, cv.ten_chuc_vu AS chuc_danh
             FROM "VIEN_CHUC" v
             LEFT JOIN "DON_VI_TO_CHUC" dv ON v."id_don_vi" = dv."id_don_vi"
             LEFT JOIN "CHUC_VU" cv ON v."id_chuc_vu" = cv."id_chuc_vu"
             WHERE v."id_vien_chuc" = :id`,
            { replacements: { id: vc.id_vien_chuc }, type: QueryTypes.SELECT }
          )
          const donVi = (rows && rows[0]) ? rows[0].don_vi : null
          const chucVu = (rows && rows[0]) ? rows[0].chuc_danh : null
          const roles = []
          if (account && account.loai_dang_nhap) roles.push(account.loai_dang_nhap)
          if (chucVu) roles.push(chucVu)
          return { id_vien_chuc: vc.id_vien_chuc, ho_va_ten: vc.ho_va_ten, email: vc.email_cong_vu, don_vi: donVi, chuc_danh: chucVu, roles: Array.from(new Set(roles.filter(Boolean))) }
        }
      }
    }

    return null
  } catch (err) {
    // Log richer error information from Sequelize (parent/sql)
    console.error('[auth.service] authenticate error name=', err.name, 'message=', err.message)
    if (err.parent) console.error('[auth.service] parent message=', err.parent.message)
    if (err.sql) console.error('[auth.service] sql=', err.sql)
    console.error(err)
    throw err
  }
}

export const login = async (email, password) => {
  const user = await authenticate(email, password)
  if (!user) throw new Error('Invalid credentials')
  // return user object (frontend expects { user })
  return { user }
}

export const logout = async () => {
  return { message: 'Đã đăng xuất (mock)' }
}

export const getMe = async (user) => {
  return user
}

export const checkDemo = async () => {
  // Check if a known demo account exists in either accounts or vien_chuc
  try {
    const demoEmail = 'a@tvu.edu.vn'
    const acc = await TaiKhoan.findOne({ where: { email_dang_nhap: demoEmail } })
    if (acc) return { demoAvailable: true, demoEmail }
    const vc = await VienChuc.findOne({ where: { email_cong_vu: demoEmail } })
    if (vc) return { demoAvailable: true, demoEmail }
    return { demoAvailable: false }
  } catch (err) {
    console.error('[auth.service] checkDemo error', err.stack || err.message || err)
    return { demoAvailable: false }
  }
}

export const createAdmin = async ({ email, name, password } = {}) => {
  // only allow in development or when explicitly allowed
  if (process.env.NODE_ENV === 'production') throw new Error('Not allowed in production')
  const adminEmail = (email || 'admin@tvu.edu.vn').toLowerCase()
  const adminName = name || 'Administrator'
  const adminPassword = password || 'admin123'

  // check existing account
  let acc = await TaiKhoan.findOne({ where: { email_dang_nhap: adminEmail } })
  if (acc) {
    // try to fetch linked VienChuc for returning info
    const vc = await VienChuc.findOne({ where: { id_vien_chuc: acc.id_vien_chuc } })
    return { created: false, email: adminEmail, user: { email: adminEmail, name: vc?.ho_va_ten || adminName } }
  }

  // create VienChuc (link to don_vi 1 and chuc_vu 2 if available)
  const newVc = await VienChuc.create({
    ma_so_vien_chuc: `ADM-${Date.now() % 100000}`,
    ho_va_ten: adminName,
    email_cong_vu: adminEmail,
    ngay_sinh: '1980-01-01',
    id_don_vi: 1,
    id_chuc_vu: 2,
    la_dang_vien: false,
    trang_thai_lam_viec: 'DANG_LAM_VIEC'
  })

  const hash = await bcrypt.hash(adminPassword, 10)
  const createdAcc = await TaiKhoan.create({ id_vien_chuc: newVc.id_vien_chuc, email_dang_nhap: adminEmail, mat_khau_hash: hash, loai_dang_nhap: 'LOCAL', trang_thai: 'ACTIVE' })

  return { created: true, email: adminEmail, password: adminPassword, user: { id_vien_chuc: newVc.id_vien_chuc, ho_va_ten: newVc.ho_va_ten, email: adminEmail } }
}
