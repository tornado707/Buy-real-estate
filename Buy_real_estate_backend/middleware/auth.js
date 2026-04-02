const { getSession, extendSession } = require('../utils/session');

const isAuthenticated = async (req, res, next) => {
  try {
    const sessionId = req.cookies.sessionId;

    if (!sessionId) {
      return res.status(401).json({
        success: false,
        message: 'No session found. Please sign in.'
      });
    }

    const session = await getSession(sessionId);

    if (!session) {
      res.clearCookie('sessionId');
      return res.status(401).json({
        success: false,
        message: 'Session expired. Please sign in again.'
      });
    }

    req.session = session;
    req.userId = session.userId;

    await extendSession(sessionId);

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication error'
    });
  }
};


const isSuAdmin = (req, res, next) => {
  if (req.session.data.role !== 'su-admin') {
    return res.status(403).json({
      success: false,
      message: 'Super admin access required'
    });
  }
  next();
};

module.exports = { isAuthenticated, isSuAdmin };