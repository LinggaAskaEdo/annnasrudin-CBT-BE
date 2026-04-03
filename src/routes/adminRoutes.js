import express from 'express';
import { createUser, getAllUsers } from '../controllers/adminController.js';
import { authenticate, isAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

// All routes here are protected by JWT and Admin check
router.use(authenticate);
router.use(isAdmin);

// Admin-only: Create user (Guru/Siswa)
router.post('/users', createUser);

// Admin-only: List all users
router.get('/users', getAllUsers);

export default router;
