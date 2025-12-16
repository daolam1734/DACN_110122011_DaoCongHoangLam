import express from 'express'
import * as roleController from '../controllers/role.controller.js'
const router = express.Router()

router.get('/', roleController.getRoles)
router.patch('/:id', roleController.patchRole)

export default router
