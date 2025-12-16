import express from 'express';
import * as BaoCaoKetQuaController from '../controllers/baoCaoKetQua.controller.js';
const baoCaoKetQuaRouter = express.Router({ mergeParams: true });

baoCaoKetQuaRouter.post('/', BaoCaoKetQuaController.nopBaoCao);
baoCaoKetQuaRouter.get('/', BaoCaoKetQuaController.getBaoCao);

export default baoCaoKetQuaRouter;
