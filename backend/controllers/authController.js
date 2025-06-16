const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PartnerUser, Partner, AuditLog, PasswordResetToken } = require('../models');
const logger = require('../config/logger');
const crypto = require('crypto');
const { sendMail } = require('../utils/mailer');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '12h';

const login = async (req, res) => {
  const { email, password } = req.body;
  let auditStatus = false;
  let auditMessage = '';
  let user = null;
  try {
    if (!email || !password) {
      auditMessage = 'Missing email or password';
      return res.status(400).json({ status: 'error', message: auditMessage });
    }

    user = await PartnerUser.findOne({
      where: { email },
      include: [{ model: Partner, as: 'partner' }]
    });
    if (!user) {
      auditMessage = 'User not found';
      return res.status(401).json({ status: 'error', message: 'Invalid credentials' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      auditMessage = 'Invalid password';
      return res.status(401).json({ status: 'error', message: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign(
      {
        id: user.id,
        partnerId: user.partnerId,
        role: user.role,
        scopes: user.scopes
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    auditStatus = true;
    auditMessage = 'Login successful';

    // Return user info and token
    res.json({
      status: 'success',
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          scopes: user.scopes,
          partner: user.partner ? {
            id: user.partner.id,
            orgName: user.partner.orgName,
            systemName: user.partner.systemName,
            isActive: user.partner.isActive
          } : null
        }
      }
    });
  } catch (error) {
    auditMessage = error.message;
    logger.error('Login error:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  } finally {
    // Audit log for login attempt
    await AuditLog.create({
      partnerId: user && user.partnerId ? user.partnerId : null,
      endpoint: '/api/auth/login',
      requestBody: { email },
      responseBody: { message: auditMessage },
      statusCode: auditStatus ? 200 : 401,
      matchedFields: ['email'],
      verified: auditStatus,
      timestamp: new Date()
    });
  }
};

const me = async (req, res) => {
  try {
    const user = await PartnerUser.findByPk(req.user.id, {
      include: [{ model: Partner, as: 'partner' }]
    });
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }
    res.json({
      status: 'success',
      data: {
        id: user.id,
        email: user.email,
        role: user.role,
        scopes: user.scopes,
        permissions: user.permissions,
        partner: user.partner ? {
          id: user.partner.id,
          orgName: user.partner.orgName,
          systemName: user.partner.systemName,
          isActive: user.partner.isActive
        } : null
      }
    });
  } catch (error) {
    logger.error('Get me error:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

const logout = async (req, res) => {
  try {
    await AuditLog.create({
      partnerId: req.user.partnerId,
      endpoint: '/api/auth/logout',
      requestBody: {},
      responseBody: { message: 'Logout successful' },
      statusCode: 200,
      matchedFields: [],
      verified: true,
      timestamp: new Date()
    });
    res.json({ status: 'success', message: 'Logout successful' });
  } catch (error) {
    logger.error('Logout error:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  let auditStatus = false;
  let auditMessage = '';
  let user = null;
  try {
    if (!email) {
      auditMessage = 'Missing email';
      return res.status(400).json({ status: 'error', message: auditMessage });
    }
    user = await PartnerUser.findOne({ where: { email } });
    if (!user) {
      auditMessage = 'User not found';
      return res.status(200).json({ status: 'success', message: 'If that email exists, a reset link has been sent.' });
    }
    // Generate a reset token and store in DB
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour expiry
    await PasswordResetToken.create({
      userId: user.id,
      token: resetToken,
      expiresAt,
      used: false
    });
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;
    try {
      await sendMail({
        to: email,
        subject: 'BDIVP Password Reset',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; border-radius: 12px; background: #f8fafc;">
            <h2 style="color: #2563eb; margin-bottom: 8px;">BDIVP Password Reset</h2>
            <p>Hello,</p>
            <p>We received a request to reset your password for your BDIVP account.</p>
            <p>
              <a href="${resetLink}" style="display: inline-block; padding: 12px 24px; background: #2563eb; color: #fff; border-radius: 6px; text-decoration: none; font-weight: bold;">
                Reset Password
              </a>
            </p>
            <p>If you did not request this, you can safely ignore this email.</p>
            <p style="font-size: 12px; color: #64748b;">This link will expire in 1 hour.</p>
            <hr style="margin: 24px 0;">
            <p style="font-size: 12px; color: #64748b;">&copy; ${new Date().getFullYear()} BDIVP</p>
          </div>
        `
      });
    } catch (mailErr) {
      logger.error(`Failed to send reset email to ${email}:`, mailErr);
      logger.info(`Password reset link for ${email}: ${resetLink}`);
    }
    auditStatus = true;
    auditMessage = 'Password reset link sent';
    return res.json({ status: 'success', message: 'If that email exists, a reset link has been sent.' });
  } catch (error) {
    auditMessage = error.message;
    logger.error('Forgot password error:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  } finally {
    await AuditLog.create({
      partnerId: user && user.partnerId ? user.partnerId : null,
      endpoint: '/api/auth/forgot-password',
      requestBody: { email },
      responseBody: { message: auditMessage },
      statusCode: auditStatus ? 200 : 400,
      matchedFields: ['email'],
      verified: auditStatus,
      timestamp: new Date()
    });
  }
};

const resetPassword = async (req, res) => {
  const { email, token, newPassword } = req.body;
  let auditStatus = false;
  let auditMessage = '';
  let user = null;
  try {
    if (!email || !token || !newPassword) {
      auditMessage = 'Missing required fields';
      return res.status(400).json({ status: 'error', message: auditMessage });
    }
    user = await PartnerUser.findOne({ where: { email } });
    if (!user) {
      auditMessage = 'User not found';
      return res.status(400).json({ status: 'error', message: 'Invalid or expired token' });
    }
    const resetRecord = await PasswordResetToken.findOne({
      where: {
        userId: user.id,
        token,
        used: false,
        expiresAt: { $gt: new Date() }
      }
    });
    if (!resetRecord) {
      auditMessage = 'Invalid or expired token';
      return res.status(400).json({ status: 'error', message: auditMessage });
    }
    // Update password
    user.password = newPassword;
    await user.save();
    // Invalidate token
    resetRecord.used = true;
    await resetRecord.save();
    auditStatus = true;
    auditMessage = 'Password reset successful';
    return res.json({ status: 'success', message: auditMessage });
  } catch (error) {
    auditMessage = error.message;
    logger.error('Reset password error:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  } finally {
    await AuditLog.create({
      partnerId: user && user.partnerId ? user.partnerId : null,
      endpoint: '/api/auth/reset-password',
      requestBody: { email },
      responseBody: { message: auditMessage },
      statusCode: auditStatus ? 200 : 400,
      matchedFields: ['email'],
      verified: auditStatus,
      timestamp: new Date()
    });
  }
};

module.exports = {
  login,
  me,
  logout,
  forgotPassword,
  resetPassword,
}; 
