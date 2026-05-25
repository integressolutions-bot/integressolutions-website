import { Router } from 'express';
import * as controller from '../controllers/psid.controller.js';
import { authenticate, authorize } from '../auth/auth.middleware.js';
import { asyncHandler } from '../core/utils/asyncHandler.js';

const router = Router();

router.post('/:serial/transfer', authenticate, asyncHandler(controller.transferOwnership));
router.post('/:serial/request-reversal', authenticate, asyncHandler(controller.requestReversal));
router.post('/admin/:serial/reverse', authenticate, authorize('ADMIN'), asyncHandler(controller.approveReversal));

export default router;
