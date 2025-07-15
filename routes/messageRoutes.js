import express from 'express';
import {
  sendMessage,
  getMessages,
  editMessage,
  deleteMessage,
  addReaction
} from '../controllers/messageController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Message operations
router.post('/', sendMessage);
router.get('/:sessionId', getMessages);
router.put('/:messageId', editMessage);
router.delete('/:messageId', deleteMessage);
router.post('/:messageId/reaction', addReaction);

export default router;