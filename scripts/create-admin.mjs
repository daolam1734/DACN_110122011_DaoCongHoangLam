#!/usr/bin/env node
import dotenv from 'dotenv'
dotenv.config()

import sequelize from '../src/config/sequelize.js'
import VienChuc from '../src/models/VienChuc.js'
import TaiKhoan from '../src/models/TaiKhoanDangNhap.js'
import bcrypt from 'bcryptjs'

function parseArgs() {
    const out = {}
    for (let i = 2; i < process.argv.length; i++) {
        const a = process.argv[i]
        if (!a) continue
        if (a.startsWith('--')) {
            const [k, v] = a.slice(2).split('=')
            out[k] = v === undefined ? true : v
        }
    }
    return out
}

const argv = parseArgs()
const email = (argv.email || 'admin@tvu.edu.vn').toLowerCase()
const name = argv.name || 'Administrator'
const password = argv.password || 'admin123'
const promote = !!argv.promote

async function run() {
    try {
        console.log('Connecting to DB...')
        await sequelize.authenticate()
        console.log('Connected.')

        // if an account already exists, optionally promote it to ADMIN or bail out
        const existing = await TaiKhoan.findOne({ where: { email_dang_nhap: email } })
        if (existing) {
            if (promote) {
                await existing.update({ loai_dang_nhap: 'ADMIN' })
                console.log(`Account promoted to ADMIN for ${email}. id=${existing.id_tai_khoan}`)
                process.exit(0)
            }
            console.log(`Account already exists for ${email}. id=${existing.id_tai_khoan}`)
            process.exit(0)
        }

        // ensure sequences are advanced to avoid duplicate PKs when DB was populated by raw seed inserts
        try {
            await sequelize.query(`SELECT setval(pg_get_serial_sequence('"TAI_KHOAN_DANG_NHAP"','id_tai_khoan'), (SELECT COALESCE(MAX(id_tai_khoan),0) + 1 FROM "TAI_KHOAN_DANG_NHAP"), false);`)
        } catch (e) {
            // ignore if sequence not present or DB is not Postgres
        }
        try {
            await sequelize.query(`SELECT setval(pg_get_serial_sequence('"VIEN_CHUC"','id_vien_chuc'), (SELECT COALESCE(MAX(id_vien_chuc),0) + 1 FROM "VIEN_CHUC"), false);`)
        } catch (e) {
            // ignore
        }

        const t = await sequelize.transaction()
        try {
            // if a VienChuc with same email exists, reuse it; otherwise create one
            let newVc = await VienChuc.findOne({ where: { email_cong_vu: email } })
            if (!newVc) {
                // generate a safe unique ma_so_vien_chuc
                let candidate
                let attempts = 0
                do {
                    candidate = `ADM-${Math.floor(Math.random() * 90000) + 10000}`
                    const exists = await VienChuc.findOne({ where: { ma_so_vien_chuc: candidate } })
                    if (!exists) break
                    attempts++
                } while (attempts < 5)

                newVc = await VienChuc.create({
                    ma_so_vien_chuc: candidate,
                    ho_va_ten: name,
                    email_cong_vu: email,
                    ngay_sinh: '1980-01-01',
                    id_don_vi: 1,
                    id_chuc_vu: 2,
                    la_dang_vien: false,
                    trang_thai_lam_viec: 'DANG_LAM_VIEC'
                }, { transaction: t })
            }

            const hash = await bcrypt.hash(password, 10)
            const acc = await TaiKhoan.create({ id_vien_chuc: newVc.id_vien_chuc, email_dang_nhap: email, mat_khau_hash: hash, loai_dang_nhap: 'LOCAL', trang_thai: 'ACTIVE' }, { transaction: t })

            await t.commit()
            console.log('Admin created:', { email, password, id_vien_chuc: newVc.id_vien_chuc, id_tai_khoan: acc.id_tai_khoan })
            process.exit(0)
        } catch (err) {
            await t.rollback()
            // provide better diagnostics for validation errors
            if (err && err.name === 'SequelizeValidationError' && Array.isArray(err.errors)) {
                console.error('Validation errors:')
                err.errors.forEach(e => console.error('-', e.message, 'field=', e.path))
            }
            throw err
        }
    } catch (err) {
        console.error('Failed to create admin:', err && err.message ? err.message : err)
        if (err && err.errors && Array.isArray(err.errors)) {
            console.error('Detailed errors:')
            err.errors.forEach(e => console.error('-', e.message, 'path=', e.path, 'value=', e.value))
        }
        if (err && err.stack) console.error(err.stack)
        process.exit(2)
    }
}

run()
