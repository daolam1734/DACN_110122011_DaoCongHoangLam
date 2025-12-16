import express from 'express';
import * as AuditHeThongController from '../controllers/auditHeThong.controller.js';
const auditHeThongRouter = express.Router();

auditHeThongRouter.get('/', AuditHeThongController.getAudit);

export default auditHeThongRouter;
