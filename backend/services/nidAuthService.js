const axios = require('axios');
const { Partner, TokenCache } = require('../models');
const { decrypt } = require('../utils/encryption');
const logger = require('../config/logger');

const NID_API_BASE_URL = 'https://prportal.nidw.gov.bd/partner-service';

async function loginToNID(partnerId) {
  try {
    // Get partner credentials
    const partner = await Partner.findByPk(partnerId);
    if (!partner) {
      throw new Error('Partner not found');
    }

    if (!partner.isActive) {
      throw new Error('Partner account is inactive');
    }

    // Decrypt credentials
    const username = decrypt(partner.nidUsername);
    const password = decrypt(partner.nidPassword);

    // Call NID login API
    const response = await axios.post(`${NID_API_BASE_URL}/rest/auth/login`, {
      username,
      password
    });

    const { accessToken, refreshToken, expiresIn } = response.data;

    // Calculate expiration time (UTC)
    const expiresAt = new Date(Date.now() + (expiresIn * 1000));

    // Update or create token cache
    await TokenCache.upsert({
      partnerId,
      accessToken,
      refreshToken,
      expiresAt
    });

    logger.info(`NID login successful for partner ${partnerId}`);

    return {
      accessToken,
      refreshToken,
      expiresAt
    };
  } catch (error) {
    logger.error(`NID login failed for partner ${partnerId}:`, error);
    throw new Error('Failed to authenticate with NID service');
  }
}

module.exports = {
  loginToNID
}; 
