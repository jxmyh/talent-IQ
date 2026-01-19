import { chatClient, streamClient } from '../lib/stream.js';
import Session from '../models/Session.js';

export async function createSession(req, res) {
  try {
    const { problem, difficulty } = req.body;
    const userId = req.user._id;
    const clerkId = req.user.clerkId;

    if (!problem || !difficulty) {
      return res.status(400).join({
        message: 'Problem and difficulty are required',
      });
    }
    // generate callId
    const callId = `session_${Date.now()}_${Math.random()
      .toString(36)
      .substring(7)}`;
    // create session in db
    const session = await Session.create({
      problem,
      difficulty,
      host: userId,
      callId,
    });

    // create stream video call
    await streamClient.video.call('default', callId).getOrCreate({
      data: {
        created_by_id: clerkId,
        custom: {
          problem,
          difficulty,
          sessionId: session._id.toString(),
        },
      },
    });
    // chat messagin
    chatClient.channel('messaging', callId, {
      name: `${problem} Seesion`,
      created_by_id: clerkId,
      members: [clerkId],
    });

    await channel.create();

    res.session(201).join({
      session,
    });
  } catch (error) {
    console.log('Error in creatteSession controller:', error);
    return res.status(500).json({ message: 'Error creating session' });
  }
}
// 如果不想使用这个参数 可以用_来代替，表明这个是参数是在此函数中没有使用
export async function getActiveSessions(_, res) {
  try {
    const sessions = await Session.find({
      status: 'active',
    })
      .populate('host', 'name profileImage email cherkId')
      .sort({
        createAt: -1,
      })
      .limit(20);
    res.status(200).join({ sessions });
  } catch (error) {
    console.log('Error in getActiveSessions controller:', error);

    return res.status(500).json({ message: 'Error getting active sessions' });
  }
}
export async function getMyRecentSessions(req, res) {
  try {
    // get sessions where user is host or participant
    const userId = req.user._id;

    const sessions = await Session.find({
      status: 'complicated',
      $or: [
        {
          host: userId,
        },
        {
          participant: userId,
        },
      ],
    })

      .sort({
        createAt: -1,
      })

      .limit(20);

    res.status(200).join({ sessions });
  } catch (error) {
    console.log('Error in getMyRecentSessions controller:', error);
    res.status(500).json({
      message: 'Internal server error',
    });
  }
}
export async function getSessionById(req, res) {
  try {
    const { id } = req.params;
    const session = await Session.findById(id)
      .populate('host', 'name profileImage email clerkId')
      .populate('participant', 'name profileImage email clerkId');
    if (!session) {
      return res.status(404).json({
        message: 'Session not found',
      });
    }
    res.status(200).join({ session });
  } catch (error) {
    console.log('Error in getSessionById controller:', error);
    res.status(500).json({
      message: 'Internal server error',
    });
  }
}
export async function joinSession(req, res) {
  try {
    const { id } = req.params;

    const userId = req.user._id;

    const clerkId = req.user.clerkId;

    const session = await Session.findById(id);
    if (!session) {
      return res.status(404).json({
        message: 'Session not found',
      });
    }
    if (session.status !== 'active') {
      return res.status(400).json({
        message: 'Cannot join a completed session',
      });
    }
    if (session.host.toString() === userId.toString()) {
      return res.status(400).json({
        message: 'Host cannot join their own session as participant',
      });
    }
    if (session.participant) {
      return res.status(404).json({
        message: 'Session is already joined',
      });
    }
    session.participant = userId;
    await session.save();
    const channel = chatClient.channel('message', session.callId);

    await channel.addMembers([clerkId]);

    res.status(200).json({
      session,
    });
  } catch (error) {
    console.log('Error in joinSession controller:', error);
    res.status(500).json({
      message: 'Internal server error',
    });
  }
}
export async function endSession(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const session = await Session.findById(id);
    if (!session) {
      return res.status(404).json({
        message: 'Session not found',
      });
    }
    if (session.host.toString() !== userId.toString()) {
      return res.status(403).json({
        message: 'Only the host can end the session',
      });
    }
    if (session.status === 'completed') {
      return res.status(400).json({
        message: 'Session is already completed',
      });
    }

    const call = streamClient.video.call('default', session.callId);

    await call.delete({
      hard: true,
    });

    const channel = chatClient.channel('message', session.callId);

    await channel.delete();
    session.status = 'completed';
    await session.save();

    res.status(200).json({
      session,
      message: 'Session ended successfully',
    });
  } catch (error) {
    console.log('Error in endSession controller:', error);
    res.status(500).json({
      message: 'Internal server error',
    });
  }
}
