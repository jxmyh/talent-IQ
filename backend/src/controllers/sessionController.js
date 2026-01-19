import { chatClient, streamClient } from '../lib/stream.js';
import Session from '../models/Session.js';

/**
 * Create a new session, provision an associated video call and chat channel, and respond with the created session.
 *
 * Validates that `problem` and `difficulty` are provided in the request body and responds with 400 if missing.
 * On success, creates a Session record, provisions a video call and a chat channel tied to the session, and responds with 201 and the created session.
 * If an unexpected error occurs, responds with 500 and an error message.
 */
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
/**
 * Retrieve up to 20 active sessions, sorted by creation time (newest first), and send them in the response.
 *
 * Each session's `host` relation is populated with `name`, `profileImage`, `email`, and `clerkId`.
 *
 * Sends a 200 response containing `{ sessions }` on success, or a 500 response with an error message on failure.
 */
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
/**
 * Retrieve the requesting user's recent completed sessions and send them in the response.
 *
 * Queries sessions where the requester is either the host or a participant, sorts by creation time descending,
 * limits the result to 20, and responds with status 200 and an object containing `sessions`.
 * On error, responds with status 500 and an error message.
 */
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
/**
 * Retrieve a session by its ID and return it with populated host and participant fields.
 *
 * Looks up the Session using req.params.id, populates host and participant with
 * `name`, `profileImage`, `email`, and `clerkId`, sends the session with HTTP 200 on success,
 * responds with HTTP 404 if no session is found, and responds with HTTP 500 on internal errors.
 */
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
/**
 * Add the requesting user as the participant of a session and add the session's clerk to its chat channel.
 *
 * If the session ID in req.params does not exist, responds with 404. If the session already has a participant,
 * responds with 400. On success, saves the updated session and responds with the session object.
 *
 * @param {object} req - Express request object. Expects `req.params.id` (session id), `req.user._id` (user id to join),
 *                        and `req.user.clerkId` (clerk id to add to the chat channel).
 * @param {object} res - Express response object used to send JSON responses with appropriate HTTP status codes.
 */
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
/**
 * End a session owned by the requesting host, mark it completed, and delete associated video and chat resources.
 *
 * If the session does not exist, responds with 404. If the requester is not the host, responds with 403.
 * If the session is already completed, responds with 400. On success responds with 200 and the updated session.
 *
 * @param {import('express').Request} req - Express request; expects req.params.id (session ID) and req.user._id (requesting user ID).
 * @param {import('express').Response} res - Express response used to send HTTP status and JSON payloads.
 */
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