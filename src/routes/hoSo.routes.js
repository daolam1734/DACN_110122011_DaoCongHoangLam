import express from 'express';
import * as HoSoController from '../controllers/hoSo.controller.js';
import requireRole from '../middlewares/rbac.middleware.js';
const hoSoRouter = express.Router();

// Create: require at least authenticated user (any role). For demonstration, require role 'USER' or higher.
hoSoRouter.post('/', requireRole('USER', 'STAFF', 'ADMIN'), HoSoController.createHoSo);
hoSoRouter.get('/:id', requireRole('USER', 'STAFF', 'ADMIN'), HoSoController.getHoSoById);
// Listing can be allowed for authenticated staff/admin; keep read-only open for now but require login
hoSoRouter.get('/', requireRole('USER', 'STAFF', 'ADMIN'), HoSoController.getHoSoList);

export default hoSoRouter;
