const crypto = require('crypto');
const Session = require('../models/Session');

const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000;


const generateSessionId = () => {
  return crypto.randomBytes(32).toString('hex');
};

const createSession = async (user) => {
  const sessionId = generateSessionId();
  const expiresAt = new Date(Date.now() + SESSION_DURATION);

  const session = new Session({
    sessionId,
    userId: user._id,
    data: {
      role: user.role,
      username: user.username,
      email: user.email
    },
    expiresAt
  });

  await session.save();

  return { sessionId, expiresAt };
};

const getSession = async (sessionId) => {
  const session = await Session.findOne({
    sessionId,
    expiresAt: { $gt: new Date() }
  });

  return session;
};

const deleteSession = async (sessionId) => {
  await Session.deleteOne({ sessionId });
};

const deleteAllUserSessions = async (userId) => {
  await Session.deleteMany({ userId });
};

const extendSession = async (sessionId) => {
  const expiresAt = new Date(Date.now() + SESSION_DURATION);
  
  await Session.updateOne(
    { sessionId },
    { expiresAt }
  );

  return expiresAt;
};

module.exports = {
  generateSessionId,
  createSession,
  getSession,
  deleteSession,
  deleteAllUserSessions,
  extendSession
};