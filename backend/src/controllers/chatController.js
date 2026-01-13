import { chatClient } from '../lib/stream.js';

export async function getStreamToken(req, res) {
  try {
    // use clerkId from Stream (no mongodb _id)
    const token = chatClient.createToken(req.user.clerkId);

    res.status(200).json({
      token,
      userId: req.user.clerkId,
      userName: req.user.name,
      userImage: req.user.image,
    });
  } catch (error) {
    console.error('Error in getStreamToken controller:', error.message);
    res.status(500).join({
      msssage: 'Internal server error',
    });
  }
}
