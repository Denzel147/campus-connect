const jwt = require('jsonwebtoken');
const db = require('../config/database');
const logger = require('../config/logger');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    if (!process.env.JWT_SECRET) {
      logger.error('JWT_SECRET is not set in environment variables');
      return res.status(500).json({
        success: false,
        message: 'Server configuration error'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verify user still exists and is active
    const { rows } = await db.query(
      'SELECT user_id, email, account_status FROM users WHERE user_id = $1',
      [decoded.userId]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    if (rows[0].account_status !== 'active') {
      return res.status(401).json({
        success: false,
        message: 'Account is not active'
      });
    }

    req.user = {
      userId: rows[0].user_id,
      email: rows[0].email
    };

    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    if (!process.env.JWT_SECRET) {
      req.user = null;
      return next();
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { rows } = await db.query(
      'SELECT user_id, email FROM users WHERE user_id = $1 AND account_status = $2',
      [decoded.userId, 'active']
    );

    req.user = rows.length > 0 ? {
      userId: rows[0].user_id,
      email: rows[0].email
    } : null;
  } catch (error) {
    req.user = null;
  }

  next();
};

module.exports = {
  authenticateToken,
  optionalAuth
};
