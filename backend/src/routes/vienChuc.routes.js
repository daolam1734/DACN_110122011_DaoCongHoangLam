import express from 'express';
import * as controller from '../controllers/vienChuc.controller.js';
const router = express.Router();

router.get('/', controller.getVienChucList);
router.get('/:id', controller.getVienChucById);
router.get('/:id/chuc-vu', controller.getChucVuByVienChuc);

export default router;
