const jwt = require('jsonwebtoken');
const { TokenCache, Partner } = require('../models');
const { Op } = require('sequelize');
const logger = require('../config/logger');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '12h';

async function generateToken(user) {
  try {
    const token = jwt.sign(
      { 
        id: user.id,
        partnerId: user.partnerId,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Cache the token
    await TokenCache.create({
      userId: user.id,
      token,
      expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000) // 12 hours
    });

    return token;
  } catch (error) {
    logger.error('Token generation failed:', error);
    throw new Error('Failed to generate authentication token');
  }
}

async function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Check if token is in cache and not expired
    const cachedToken = await TokenCache.findOne({
      where: {
        token,
        expiresAt: {
          [Op.gt]: new Date()
        }
      }
    });

    if (!cachedToken) {
      throw new Error('Token not found or expired');
    }

    return decoded;
  } catch (error) {
    logger.error('Token verification failed:', error);
    throw new Error('Invalid or expired token');
  }
}

async function revokeToken(token) {
  try {
    await TokenCache.destroy({
      where: { token }
    });
  } catch (error) {
    logger.error('Token revocation failed:', error);
    throw new Error('Failed to revoke token');
  }
}

module.exports = {
  generateToken,
  verifyToken,
  revokeToken
}; 
