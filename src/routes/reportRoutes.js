import express from 'express';
import { reportController, authMiddleware } from '../container.js';

const router = express.Router();

router.use(authMiddleware.authenticate);
router.use(authMiddleware.isGuru);

// Guru/Admin can view classroom-wide report in JSON
router.get('/exams/:scheduleId', reportController.getClassroomReport);

export default router;
