const { Partner, PartnerUser, TokenCache, AuditLog } = require('../models');
const { Op } = require('sequelize');
const logger = require('../config/logger');

// Get dashboard overview
exports.getOverview = async (req, res) => {
  try {
    const [
      partnerCount,
      userCount,
      tokenCount,
      totalVerifications,
      successVerifications,
      failedVerifications
    ] = await Promise.all([
      Partner.count(),
      PartnerUser.count(),
      TokenCache.count(),
      AuditLog.count({
        where: {
          endpoint: { [Op.in]: ['/api/nid/verify-basic', '/api/nid/verify-full'] }
        }
      }),
      AuditLog.count({
        where: {
          endpoint: { [Op.in]: ['/api/nid/verify-basic', '/api/nid/verify-full'] },
          verified: true
        }
      }),
      AuditLog.count({
        where: {
          endpoint: { [Op.in]: ['/api/nid/verify-basic', '/api/nid/verify-full'] },
          verified: false
        }
      })
    ]);

    res.json({
      partners: partnerCount,
      users: userCount,
      activeTokens: tokenCount,
      verifications: {
        total: totalVerifications,
        success: successVerifications,
        failed: failedVerifications
      }
    });
  } catch (error) {
    logger.error('Failed to get admin overview:', error);
    res.status(500).json({ error: 'Failed to get overview data' });
  }
};

// Get audit logs with filtering
exports.getAuditLogs = async (req, res) => {
  try {
    const {
      partnerId,
      verified,
      startDate,
      endDate,
      page = 1,
      limit = 50
    } = req.query;

    // Build filter conditions
    const where = {};
    if (partnerId) where.partnerId = partnerId;
    if (verified !== undefined) where.verified = verified === 'true';
    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp[Op.gte] = new Date(startDate);
      if (endDate) where.timestamp[Op.lte] = new Date(endDate);
    }

    // Get paginated results
    const offset = (page - 1) * limit;
    const { count, rows: logs } = await AuditLog.findAndCountAll({
      where,
      order: [['timestamp', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [{
        model: Partner,
        attributes: ['name', 'apiKey']
      }]
    });

    res.json({
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      logs
    });
  } catch (error) {
    logger.error('Failed to get audit logs:', error);
    res.status(500).json({ error: 'Failed to get audit logs' });
  }
}; 