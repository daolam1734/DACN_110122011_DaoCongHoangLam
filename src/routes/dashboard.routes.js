import express from 'express'
import * as DashboardController from '../controllers/dashboard.controller.js'
import requireRole from '../middlewares/rbac.middleware.js'

const router = express.Router()

// Dashboard for logged-in staff
router.get('/', requireRole('USER', 'STAFF', 'ADMIN'), DashboardController.getDashboard)

export default router
