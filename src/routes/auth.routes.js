import express from 'express'
import * as controller from '../controllers/auth.controller.js'
import requireRole from '../middlewares/rbac.middleware.js'

const router = express.Router()

router.post('/login', controller.login)
router.get('/demo', controller.demoInfo)

// development helper: create a demo admin account (only allowed in non-production)
// register create-admin route only if controller provides it (defensive to avoid startup crash)
if (controller && typeof controller.createAdmin === 'function') {
    router.post('/create-admin', controller.createAdmin)
}

// optional: protected test endpoint
router.get('/me', requireRole('USER', 'STAFF', 'ADMIN'), async (req, res) => {
    return res.json({ user: req.user || null })
})

export default router
