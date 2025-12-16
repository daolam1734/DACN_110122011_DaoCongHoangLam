import express from 'express';
import * as AdminTaiKhoanController from '../controllers/adminTaiKhoan.controller.js';
import requireRole from '../middlewares/rbac.middleware.js';
const adminTaiKhoanRouter = express.Router();

// Only users with ADMIN role can create or lock accounts
adminTaiKhoanRouter.post('/tai-khoan', requireRole('ADMIN'), AdminTaiKhoanController.createTaiKhoan);
adminTaiKhoanRouter.patch('/tai-khoan/:id/khoa', requireRole('ADMIN'), AdminTaiKhoanController.khoaTaiKhoan);

export default adminTaiKhoanRouter;
