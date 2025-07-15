import express from 'express';
import {
  generateAIResponse,
  generateSessionSummary,
  getAIFeedback,
  generateInsights
} from '../controllers/aiController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// AI operations
router.post('/response', generateAIResponse);
router.get('/feedback/:sessionId', getAIFeedback);
router.post('/summary/:sessionId', generateSessionSummary);
router.post('/insights/:sessionId', generateInsights);

export default router;