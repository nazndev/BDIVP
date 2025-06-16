const axios = require('axios');
const logger = require('../config/logger');
const { Partner } = require('../models');
const { decryptCredentials } = require('../utils/encryption');

const NID_API_URL = process.env.NID_API_URL;
const NID_API_TIMEOUT = parseInt(process.env.NID_API_TIMEOUT || '30000');

async function verifyVoter(partnerId, nidNumber, dob, fullVerification = false) {
  try {
    // Get partner credentials
    const partner = await Partner.findByPk(partnerId);
    if (!partner) {
      throw new Error('Partner not found');
    }

    // Decrypt credentials
    const credentials = decryptCredentials(partner.encryptedCredentials);
    if (!credentials) {
      throw new Error('Failed to decrypt partner credentials');
    }

    // Prepare request payload
    const payload = {
      partnerId: credentials.partnerId,
      partnerKey: credentials.partnerKey,
      nidNumber,
      dateOfBirth: dob,
      verificationType: fullVerification ? 'FULL' : 'BASIC'
    };

    // Make API request
    const response = await axios.post(NID_API_URL, payload, {
      timeout: NID_API_TIMEOUT,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Process response
    const { status, type, verified, matchedFields, fieldVerificationResult, details } = response.data;

    return {
      status,
      type,
      verified,
      matchedFields,
      fieldVerificationResult,
      details: fullVerification ? details : undefined
    };

  } catch (error) {
    logger.error('NID verification failed:', {
      error: error.message,
      partnerId,
      nidNumber
    });
    throw error;
  }
}

module.exports = {
  verifyVoter
}; 
