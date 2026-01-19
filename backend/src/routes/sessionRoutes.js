import express from 'express';
import { protecRoute } from '../middleware/protectRouter';
import {
  createSession,
  endSession,
  getActiveSessions,
  getMyRecentSessions,
  getSessionById,
  joinSession,
} from '../controllers/sessionController';

const router = express.Router();

router.post('/', protecRoute, createSession);
router.get('/active', protecRoute, getActiveSessions);
router.get('/my-recent', protecRoute, getMyRecentSessions);

router.get('/:id', protecRoute, getSessionById);
router.post('/:id/join', protecRoute, joinSession);
router.post('/:id/end', protecRoute, endSession);

export default router;
