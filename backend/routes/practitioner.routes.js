import { Router } from 'express';
import * as controller from '../controllers/practitioner.controller.js';
import { asyncHandler } from '../core/utils/asyncHandler.js';

const router = Router();

router.post('/register', asyncHandler(controller.registerPractitioner));

export default router;
