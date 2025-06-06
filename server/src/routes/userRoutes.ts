import express from 'express';
import { registerUser, loginUser, getUserProfile, updateUserProfile } from '../controllers/userController';
import { protect } from '../middleware/auth';

const router = express.Router();

// Public routes
router.post('/', registerUser as express.RequestHandler);
router.post('/login', loginUser as express.RequestHandler);

// Protected routes
router.get('/profile', protect as express.RequestHandler, getUserProfile as express.RequestHandler);
router.put('/profile', protect as express.RequestHandler, updateUserProfile as express.RequestHandler);

export default router; 