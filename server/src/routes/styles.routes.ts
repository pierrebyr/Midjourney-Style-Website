import { Router } from 'express';
import {
  getStyles,
  getStyleBySlug,
  createStyle,
  toggleLike,
  getComments,
  addComment,
} from '../controllers/styles.controller';
import { authenticate, optionalAuthenticate } from '../middleware/auth';

const router = Router();

// Public routes (with optional auth for personalized data)
router.get('/', optionalAuthenticate, getStyles);
router.get('/:slug', optionalAuthenticate, getStyleBySlug);

// Protected routes (require authentication)
router.post('/', authenticate, createStyle);
router.post('/:styleId/like', authenticate, toggleLike);

// Comments
router.get('/:styleId/comments', getComments);
router.post('/:styleId/comments', authenticate, addComment);

export default router;
