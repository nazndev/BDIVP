const { verifyVoter } = require('../services/nidVerificationService');
const logger = require('../config/logger');

const verifyBasicDetails = async (req, res) => {
  try {
    const { identify, verify } = req.body;
    const { partnerId } = req.user;

    // Validate required fields
    if (!identify || !verify) {
      return res.status(400).json({
        status: 'error',
        message: 'identify and verify objects are required'
      });
    }

    if (!identify.nid10Digit && !identify.nid17Digit) {
      return res.status(400).json({
        status: 'error',
        message: 'Either nid10Digit or nid17Digit is required'
      });
    }

    if (!identify.dateOfBirth || !verify.nameEn) {
      return res.status(400).json({
        status: 'error',
        message: 'dateOfBirth and nameEn are required'
      });
    }

    // Call verification service
    const result = await verifyVoter(partnerId, {
      identify,
      verify
    });

    res.json({
      status: 'success',
      data: result
    });
  } catch (error) {
    logger.error('Basic verification request failed:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to verify voter details'
    });
  }
};

const verifyFullDetails = async (req, res) => {
  try {
    const { identify, verify } = req.body;
    const { partnerId } = req.user;

    // Validate required fields
    if (!identify || !verify) {
      return res.status(400).json({
        status: 'error',
        message: 'identify and verify objects are required'
      });
    }

    if (!identify.nid17Digit) {
      return res.status(400).json({
        status: 'error',
        message: 'nid17Digit is required for full verification'
      });
    }

    if (!identify.dateOfBirth) {
      return res.status(400).json({
        status: 'error',
        message: 'dateOfBirth is required'
      });
    }

    // Call verification service
    const result = await verifyVoter(partnerId, {
      identify,
      verify
    });

    res.json({
      status: 'success',
      data: result
    });
  } catch (error) {
    logger.error('Full verification request failed:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to verify voter details'
    });
  }
};

module.exports = {
  verifyBasicDetails,
  verifyFullDetails
}; 