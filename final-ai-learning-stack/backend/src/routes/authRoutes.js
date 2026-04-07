import express from 'express';
import { login, register, createAdmin, updatePassword } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();
router.post('/register', register);
router.post('/login', login);
router.post('/admin/create', protect, authorizeRoles('admin'), createAdmin);
router.post('/update-password', protect, updatePassword);
export default router;
