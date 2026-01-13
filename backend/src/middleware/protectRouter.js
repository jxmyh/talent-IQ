import { requireAuth } from '@clerk/express';

import User from '../models/User.js';

export const protecRoute = [
  requireAuth(),
  async (req, res, next) => {
    try {
      const clerkId = req.auth().userId;

      if (!clerkId)
        return res
          .status(401)
          .json({ message: 'Unauthorized - invalidate token' });
      // find user in db by clearkId测试

      const user = await User.findOne({ clerkId });

      if (!user) return res.status(404).json({ message: 'User not found' });

      req.user = user;

      next();
    } catch (error) {
      console.error('Error in protecRoute middleware', error);
      res.status(500).json({
        message: 'Internal server error',
      });
    }
  },
];
