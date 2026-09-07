import { Router } from 'express';
import * as platformController from '../controllers/platformComplaint.controller.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/authorize.js';
import { ROLES } from '../constants/roles.js';
import { publicIntakeRateLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// Public intake
router.post('/', publicIntakeRateLimiter, platformController.submitPlatformComplaint);

// Super Admin management
router.get('/', authenticate, authorize(ROLES.PLATFORM_ADMIN), platformController.getPlatformComplaints);
router.patch('/:id/status', authenticate, authorize(ROLES.PLATFORM_ADMIN), platformController.updatePlatformComplaintStatus);

export default router;
