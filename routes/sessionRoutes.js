import express from 'express';
import {
  createSession,
  getSessions,
  getSession,
  joinSession,
  leaveSession,
  endSession,
  updateVoiceStatus
} from '../controllers/sessionController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Session management
router.post('/', createSession);
router.get('/', getSessions);
router.get('/:identifier', getSession);
router.post('/:identifier/join', joinSession);
router.post('/:sessionId/leave', leaveSession);
router.post('/:sessionId/end', endSession);
router.put('/:sessionId/voice', updateVoiceStatus);

export default router;