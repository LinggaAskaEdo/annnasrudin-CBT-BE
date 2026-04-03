import express from 'express';
import { createUser, getAllUsers, updateAdminProfile } from '../controllers/adminController.js';
import { authenticate, isAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

// All routes here are protected by JWT and Admin check
router.use(authenticate);
router.use(isAdmin);

// Admin profile management
router.patch('/profile', updateAdminProfile);

// Admin-only: Create user (Admin/Guru/Siswa)
router.post('/users', createUser);

// Admin-only: List all users
router.get('/users', getAllUsers);

export default router;
