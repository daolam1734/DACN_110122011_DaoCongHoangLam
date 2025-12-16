import express from 'express';
import * as TaiLieuHoSoController from '../controllers/taiLieuHoSo.controller.js';
const taiLieuHoSoRouter = express.Router({ mergeParams: true });

taiLieuHoSoRouter.post('/', TaiLieuHoSoController.uploadTaiLieu);
taiLieuHoSoRouter.get('/', TaiLieuHoSoController.getTaiLieuList);

export default taiLieuHoSoRouter;
