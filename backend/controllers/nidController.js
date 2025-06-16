const { verifyVoter } = require('../services/nidVerificationService');
const { AuditLog } = require('../models');

async function verifyBasic(req, res) {
  try {
    const partnerId = req.user.partnerId;
    const payload = req.body;
    const user = req.user;
    const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const endpoint = '/api/nid/verify-basic';

    const result = await verifyVoter(partnerId, payload);
    res.status(200).json({
      status: 'success',
      type: 'basic',
      ...result
    });

    // Audit log (non-blocking)
    AuditLog.create({
      partnerId,
      requesterId: user.userId,
      requesterEmail: user.email,
      requesterRole: user.role,
      ipAddress,
      endpoint,
      requestBody: payload,
      responseBody: result,
      statusCode: 200,
      matchedFields: result.matchedFields,
      nidFieldsUsed: Object.keys(payload),
      verified: result.verified,
      timestamp: new Date()
    }).catch(() => {});
  } catch (error) {
    // Audit log for failure (non-blocking)
    AuditLog.create({
      partnerId: req.user.partnerId,
      requesterId: req.user.userId,
      requesterEmail: req.user.email,
      requesterRole: req.user.role,
      ipAddress: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
      endpoint: '/api/nid/verify-basic',
      requestBody: req.body,
      responseBody: { error: error.message },
      statusCode: 500,
      matchedFields: [],
      nidFieldsUsed: Object.keys(req.body),
      verified: false,
      timestamp: new Date()
    }).catch(() => {});
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
}

async function verifyFull(req, res) {
  try {
    const partnerId = req.user.partnerId;
    const payload = req.body;
    const user = req.user;
    const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const endpoint = '/api/nid/verify-full';

    const result = await verifyVoter(partnerId, payload);
    res.status(200).json({
      status: 'success',
      type: 'full',
      ...result
    });

    // Audit log (non-blocking)
    AuditLog.create({
      partnerId,
      requesterId: user.userId,
      requesterEmail: user.email,
      requesterRole: user.role,
      ipAddress,
      endpoint,
      requestBody: payload,
      responseBody: result,
      statusCode: 200,
      matchedFields: result.matchedFields,
      nidFieldsUsed: Object.keys(payload),
      verified: result.verified,
      timestamp: new Date()
    }).catch(() => {});
  } catch (error) {
    // Audit log for failure (non-blocking)
    AuditLog.create({
      partnerId: req.user.partnerId,
      requesterId: req.user.userId,
      requesterEmail: req.user.email,
      requesterRole: req.user.role,
      ipAddress: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
      endpoint: '/api/nid/verify-full',
      requestBody: req.body,
      responseBody: { error: error.message },
      statusCode: 500,
      matchedFields: [],
      nidFieldsUsed: Object.keys(req.body),
      verified: false,
      timestamp: new Date()
    }).catch(() => {});
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
}

module.exports = {
  verifyBasic,
  verifyFull
}; 
