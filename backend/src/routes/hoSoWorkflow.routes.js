import express from 'express';
import * as HoSoWorkflowController from '../controllers/hoSoWorkflow.controller.js';
import requireHoSoStepAuthority from '../middlewares/hoSoAuth.middleware.js';
const hoSoWorkflowRouter = express.Router();

// Only users with authority for the current step can process the hồ sơ
hoSoWorkflowRouter.post('/:id/duyet', requireHoSoStepAuthority, HoSoWorkflowController.duyetHoSo);
hoSoWorkflowRouter.post('/:id/tu-choi', requireHoSoStepAuthority, HoSoWorkflowController.tuChoiHoSo);
hoSoWorkflowRouter.post('/:id/tra-lai', requireHoSoStepAuthority, HoSoWorkflowController.traLaiHoSo);

export default hoSoWorkflowRouter;
