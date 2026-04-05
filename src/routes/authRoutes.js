import express from 'express';
import { authController, authMiddleware } from '../container.js';

const router = express.Router();

// POST /api/auth/login
router.post('/login', authController.login);

// POST /api/auth/logout
router.post('/logout', authMiddleware.authenticate, authController.logout);

export default router;
