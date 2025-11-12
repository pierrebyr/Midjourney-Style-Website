import { Router } from 'express';
import {
  getUserById,
  updateProfile,
  getUserStyles,
  toggleFollow,
  getLeaderboard,
} from '../controllers/users.controller';
import { authenticate, optionalAuthenticate } from '../middleware/auth';

const router = Router();

// Leaderboard (public)
router.get('/leaderboard', getLeaderboard);

// Profile management
router.put('/me', authenticate, updateProfile);

// User routes
router.get('/:userId', optionalAuthenticate, getUserById);
router.get('/:userId/styles', getUserStyles);
router.post('/:userId/follow', authenticate, toggleFollow);

export default router;
