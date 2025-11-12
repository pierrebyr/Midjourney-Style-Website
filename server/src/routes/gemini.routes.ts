import { Router } from 'express';
import { parsePrompt } from '../controllers/gemini.controller';
import { geminiLimiter } from '../middleware/rateLimiter';
import { authenticate } from '../middleware/auth';

const router = Router();

// Require authentication and apply rate limiting
router.post('/parse-prompt', authenticate, geminiLimiter, parsePrompt);

export default router;
