const { Partner } = require('../models');
const { encrypt, decrypt, maskSensitiveData } = require('../utils/encryption');
const logger = require('../config/logger');

// List all partners
const listPartners = async (req, res) => {
  try {
    const partners = await Partner.findAll({
      where: { isActive: true },
      attributes: ['id', 'orgName', 'systemName', 'isActive', 'createdAt', 'updatedAt']
    });

    res.json({
      status: 'success',
      data: partners
    });
  } catch (error) {
    logger.error('Error listing partners:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to list partners'
    });
  }
};

// Create new partner
const createPartner = async (req, res) => {
  try {
    const { orgName, systemName, nidUsername, nidPassword, isActive = true } = req.body;

    // Validate required fields
    if (!orgName || !systemName || !nidUsername || !nidPassword) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required fields'
      });
    }

    // Encrypt sensitive data
    const encryptedUsername = encrypt(nidUsername);
    const encryptedPassword = encrypt(nidPassword);

    const partner = await Partner.create({
      orgName,
      systemName,
      nidUsername: encryptedUsername,
      nidPassword: encryptedPassword,
      isActive
    });

    logger.info(`New partner created: ${orgName} (${systemName})`);

    res.status(201).json({
      status: 'success',
      data: {
        id: partner.id,
        orgName: partner.orgName,
        systemName: partner.systemName,
        isActive: partner.isActive,
        createdAt: partner.createdAt
      }
    });
  } catch (error) {
    logger.error('Error creating partner:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create partner'
    });
  }
};

// Update partner
const updatePartner = async (req, res) => {
  try {
    const { id } = req.params;
    const { orgName, systemName, nidUsername, nidPassword, isActive } = req.body;

    const partner = await Partner.findByPk(id);
    if (!partner) {
      return res.status(404).json({
        status: 'error',
        message: 'Partner not found'
      });
    }

    // Prepare update data
    const updateData = {};
    if (orgName) updateData.orgName = orgName;
    if (systemName) updateData.systemName = systemName;
    if (nidUsername) updateData.nidUsername = encrypt(nidUsername);
    if (nidPassword) updateData.nidPassword = encrypt(nidPassword);
    if (typeof isActive === 'boolean') updateData.isActive = isActive;

    await partner.update(updateData);

    logger.info(`Partner updated: ${partner.orgName} (${partner.systemName})`);

    res.json({
      status: 'success',
      data: {
        id: partner.id,
        orgName: partner.orgName,
        systemName: partner.systemName,
        isActive: partner.isActive,
        updatedAt: partner.updatedAt
      }
    });
  } catch (error) {
    logger.error('Error updating partner:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update partner'
    });
  }
};

// Delete partner (soft delete)
const deletePartner = async (req, res) => {
  try {
    const { id } = req.params;

    const partner = await Partner.findByPk(id);
    if (!partner) {
      return res.status(404).json({
        status: 'error',
        message: 'Partner not found'
      });
    }

    await partner.update({ isActive: false });

    logger.info(`Partner deactivated: ${partner.orgName} (${partner.systemName})`);

    res.json({
      status: 'success',
      message: 'Partner deactivated successfully'
    });
  } catch (error) {
    logger.error('Error deleting partner:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete partner'
    });
  }
};

// Get partner details (with masked credentials)
const getPartnerDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const partner = await Partner.findByPk(id);
    if (!partner) {
      return res.status(404).json({
        status: 'error',
        message: 'Partner not found'
      });
    }

    // Decrypt and mask credentials
    const decryptedUsername = decrypt(partner.nidUsername);
    const decryptedPassword = decrypt(partner.nidPassword);

    res.json({
      status: 'success',
      data: {
        id: partner.id,
        orgName: partner.orgName,
        systemName: partner.systemName,
        nidUsername: maskSensitiveData(decryptedUsername),
        nidPassword: maskSensitiveData(decryptedPassword),
        isActive: partner.isActive,
        createdAt: partner.createdAt,
        updatedAt: partner.updatedAt
      }
    });
  } catch (error) {
    logger.error('Error getting partner details:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get partner details'
    });
  }
};

// Update NID credentials (admin only)
const updatePartnerCredentials = async (req, res) => {
  try {
    const { id } = req.params;
    const { nidUsername, nidPassword } = req.body;
    if (!nidUsername && !nidPassword) {
      return res.status(400).json({
        status: 'error',
        message: 'At least one of nidUsername or nidPassword is required'
      });
    }
    const partner = await Partner.findByPk(id);
    if (!partner) {
      return res.status(404).json({
        status: 'error',
        message: 'Partner not found'
      });
    }
    const updateData = {};
    if (nidUsername) updateData.nidUsername = encrypt(nidUsername);
    if (nidPassword) updateData.nidPassword = encrypt(nidPassword);
    await partner.update(updateData);
    logger.info(`NID credentials updated for partner ${partner.orgName} (${partner.systemName})`);
    // Audit log
    const { userId, email, role } = req.user;
    const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const AuditLog = require('../models').AuditLog;
    AuditLog.create({
      partnerId: partner.id,
      requesterId: userId,
      requesterEmail: email,
      requesterRole: role,
      ipAddress,
      endpoint: `/api/partners/${id}/credentials`,
      requestBody: { nidUsername: !!nidUsername, nidPassword: !!nidPassword },
      responseBody: { status: 'success' },
      statusCode: 200,
      matchedFields: [],
      nidFieldsUsed: ['nidUsername', 'nidPassword'],
      verified: true,
      timestamp: new Date()
    }).catch(() => {});
    // Return masked credentials
    res.json({
      status: 'success',
      data: {
        id: partner.id,
        orgName: partner.orgName,
        systemName: partner.systemName,
        nidUsername: maskSensitiveData(nidUsername || decrypt(partner.nidUsername)),
        nidPassword: maskSensitiveData(nidPassword || decrypt(partner.nidPassword)),
        isActive: partner.isActive,
        updatedAt: partner.updatedAt
      }
    });
  } catch (error) {
    logger.error('Error updating partner credentials:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update partner credentials'
    });
  }
};

module.exports = {
  listPartners,
  createPartner,
  updatePartner,
  deletePartner,
  getPartnerDetails,
  updatePartnerCredentials
}; 