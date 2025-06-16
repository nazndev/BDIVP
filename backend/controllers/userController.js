const { PartnerUser, Partner, AuditLog } = require('../models');
const logger = require('../config/logger');

// GET /api/users - List all users (admin only)
async function getAllUsers(req, res) {
  try {
    const users = await PartnerUser.findAll({
      include: [{ model: Partner, as: 'partner', attributes: ['id', 'orgName', 'systemName'] }],
      attributes: ['id', 'email', 'role', 'permissions', 'scopes', 'isActive']
    });
    res.json({ status: 'success', data: users });
  } catch (error) {
    logger.error('Error listing users:', error);
    res.status(500).json({ status: 'error', message: 'Failed to list users' });
  }
}

// PUT /api/users/:id/permissions - Update permissions/scopes (admin only)
async function updateUserPermissions(req, res) {
  try {
    const { id } = req.params;
    const { permissions, scopes } = req.body;
    const user = await PartnerUser.findByPk(id);
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }
    // Validate permissions
    if (permissions !== undefined) {
      if (!Array.isArray(permissions) || permissions.some(p => typeof p !== 'string' || !p.trim())) {
        return res.status(400).json({ status: 'error', message: 'Permissions must be a non-empty array of strings' });
      }
      user.permissions = [...new Set(permissions.map(p => p.trim()))];
    }
    // Validate scopes
    if (scopes !== undefined) {
      if (!Array.isArray(scopes) || scopes.some(s => typeof s !== 'string' || !s.trim())) {
        return res.status(400).json({ status: 'error', message: 'Scopes must be a non-empty array of strings' });
      }
      user.scopes = [...new Set(scopes.map(s => s.trim()))];
    }
    await user.save();
    logger.info(`User permissions/scopes updated for ${user.email}`);
    // Audit log
    AuditLog.create({
      partnerId: user.partnerId,
      requesterId: req.user.userId,
      requesterEmail: req.user.email,
      requesterRole: req.user.role,
      ipAddress: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
      endpoint: `/api/users/${id}/permissions`,
      requestBody: req.body,
      responseBody: { permissions: user.permissions, scopes: user.scopes },
      statusCode: 200,
      matchedFields: [],
      nidFieldsUsed: [],
      verified: true,
      timestamp: new Date()
    }).catch(() => {});
    res.json({ status: 'success', data: { id: user.id, email: user.email, permissions: user.permissions, scopes: user.scopes } });
  } catch (error) {
    logger.error('Error updating user permissions:', error);
    res.status(500).json({ status: 'error', message: 'Failed to update user permissions' });
  }
}

module.exports = { getAllUsers, updateUserPermissions }; 