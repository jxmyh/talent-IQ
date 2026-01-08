import express from 'express';
import { getStreamToken } from '../controllers/chatController.js';
import { protecRoute } from '../middleware/protectRouter.js';

const router = express.Router();
// api/chart/token
router.get('/token', protecRoute, getStreamToken);

export default router;
