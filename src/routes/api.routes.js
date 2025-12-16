import express from 'express'
import sequelize from '../config/sequelize.js'
import * as auditService from '../services/auditHeThong.service.js'

const router = express.Router()

// In-memory fallback stores (for scaffolding). Replace with DB persistence later.
let documentsStore = []
let rolesStore = []

// Documents: /api/documents
router.get('/documents', async (req, res) => {
    try {
        // Try to read from a presumed table "CAU_HINH_GIAY_TO" first
        try {
            const rows = await sequelize.query('SELECT * FROM "CAU_HINH_GIAY_TO" ORDER BY id_cau_hinh', { type: sequelize.QueryTypes.SELECT })
            return res.json(rows)
        } catch (e) {
            // fallback to in-memory
        }
        return res.json(documentsStore)
    } catch (err) {
        console.error('[api/documents] GET error', err.message || err)
        res.status(500).json({ message: 'Lỗi khi lấy danh sách giấy tờ' })
    }
})

router.post('/documents', async (req, res) => {
    try {
        const payload = req.body
        // Try to insert into DB table if exists
        try {
            const cols = Object.keys(payload).map(k => '"' + k + '"').join(',')
            const vals = Object.values(payload).map(v => typeof v === 'string' ? sequelize.escape(v) : (v === null ? 'NULL' : JSON.stringify(v))).join(',')
            await sequelize.query(`INSERT INTO "CAU_HINH_GIAY_TO" (${cols}) VALUES (${vals})`)
            await auditService.logAudit('CAU_HINH_GIAY_TO', payload.ma_loai || '', 'CREATE', null, payload, req.user && req.user.email)
            return res.status(201).json({ success: true })
        } catch (e) {
            // fallback to in-memory
        }
        const id = documentsStore.length ? (documentsStore[documentsStore.length - 1].id + 1) : 1
        const rec = { id, ...payload }
        documentsStore.push(rec)
        await auditService.logAudit('DOCUMENTS', id, 'CREATE', null, rec, req.user && req.user.email)
        return res.status(201).json(rec)
    } catch (err) {
        console.error('[api/documents] POST error', err.message || err)
        res.status(500).json({ message: 'Lỗi khi tạo loại giấy tờ' })
    }
})

router.patch('/documents/:id', async (req, res) => {
    try {
        const id = req.params.id
        const payload = req.body
        try {
            // naive update using JSONB or columns; best-effort
            const sets = Object.entries(payload).map(([k, v]) => `"${k}" = ${typeof v === 'string' ? sequelize.escape(v) : JSON.stringify(v)}`).join(',')
            await sequelize.query(`UPDATE "CAU_HINH_GIAY_TO" SET ${sets} WHERE id_cau_hinh = ${sequelize.escape(id)}`)
            await auditService.logAudit('CAU_HINH_GIAY_TO', id, 'UPDATE', null, payload, req.user && req.user.email)
            return res.json({ success: true })
        } catch (e) {
            // fallback
        }
        const idx = documentsStore.findIndex(d => String(d.id) === String(id))
        if (idx === -1) return res.status(404).json({ message: 'Not found' })
        const before = { ...documentsStore[idx] }
        documentsStore[idx] = { ...documentsStore[idx], ...payload }
        await auditService.logAudit('DOCUMENTS', id, 'UPDATE', before, documentsStore[idx], req.user && req.user.email)
        return res.json(documentsStore[idx])
    } catch (err) {
        console.error('[api/documents] PATCH error', err.message || err)
        res.status(500).json({ message: 'Lỗi khi cập nhật loại giấy tờ' })
    }
})

router.delete('/documents/:id', async (req, res) => {
    try {
        const id = req.params.id
        try {
            await sequelize.query(`DELETE FROM "CAU_HINH_GIAY_TO" WHERE id_cau_hinh = ${sequelize.escape(id)}`)
            await auditService.logAudit('CAU_HINH_GIAY_TO', id, 'DELETE', null, null, req.user && req.user.email)
            return res.json({ success: true })
        } catch (e) {
            // fallback
        }
        const idx = documentsStore.findIndex(d => String(d.id) === String(id))
        if (idx === -1) return res.status(404).json({ message: 'Not found' })
        const before = documentsStore[idx]
        documentsStore.splice(idx, 1)
        await auditService.logAudit('DOCUMENTS', id, 'DELETE', before, null, req.user && req.user.email)
        return res.json({ success: true })
    } catch (err) {
        console.error('[api/documents] DELETE error', err.message || err)
        res.status(500).json({ message: 'Lỗi khi xóa loại giấy tờ' })
    }
})

// Units: /api/units (read-only list, and PATCH to set active)
router.get('/units', async (req, res) => {
    try {
        const rows = await sequelize.query('SELECT * FROM "DON_VI_TO_CHUC" ORDER BY "ten_don_vi"', { type: sequelize.QueryTypes.SELECT })
        return res.json(rows)
    } catch (err) {
        console.error('[api/units] GET error', err.message || err)
        return res.status(500).json({ message: 'Lỗi khi lấy danh sách đơn vị' })
    }
})

router.patch('/units/:id', async (req, res) => {
    try {
        const id = req.params.id
        const { active } = req.body
        await sequelize.query(`UPDATE "DON_VI_TO_CHUC" SET active = ${active ? 'true' : 'false'} WHERE "id_don_vi" = ${sequelize.escape(id)}`)
        await auditService.logAudit('DON_VI_TO_CHUC', id, 'UPDATE', null, { active }, req.user && req.user.email)
        return res.json({ success: true })
    } catch (err) {
        console.error('[api/units] PATCH error', err.message || err)
        return res.status(500).json({ message: 'Lỗi khi cập nhật đơn vị' })
    }
})

// Positions: /api/positions
router.get('/positions', async (req, res) => {
    try {
        const rows = await sequelize.query('SELECT * FROM "CHUC_VU" ORDER BY "ten_chuc_vu"', { type: sequelize.QueryTypes.SELECT })
        return res.json(rows)
    } catch (err) {
        console.error('[api/positions] GET error', err.message || err)
        return res.status(500).json({ message: 'Lỗi khi lấy danh sách chức vụ' })
    }
})

router.patch('/positions/:id', async (req, res) => {
    try {
        const id = req.params.id
        const { active } = req.body
        await sequelize.query(`UPDATE "CHUC_VU" SET active = ${active ? 'true' : 'false'} WHERE "id_chuc_vu" = ${sequelize.escape(id)}`)
        await auditService.logAudit('CHUC_VU', id, 'UPDATE', null, { active }, req.user && req.user.email)
        return res.json({ success: true })
    } catch (err) {
        console.error('[api/positions] PATCH error', err.message || err)
        return res.status(500).json({ message: 'Lỗi khi cập nhật chức vụ' })
    }
})

// Roles are handled by dedicated routes (roles.routes.js)

export default router
