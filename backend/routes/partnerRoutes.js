const express = require('express');
const router = express.Router();
const { verifyToken, requireRole, requirePartnerOrAdmin } = require('../utils/authMiddleware');
const {
  listPartners,
  createPartner,
  updatePartner,
  deletePartner,
  getPartnerDetails,
  updatePartnerCredentials
} = require('../controllers/partnerController');

// All routes require authentication and admin role
router.use(verifyToken);
router.use(requireRole(['admin']));

// GET /api/partners - List all partners (admin only)
router.get('/', requireRole(['admin']), listPartners);

// GET /api/partners/:id - Get partner details (admin or owning partner)
router.get('/:id', requirePartnerOrAdmin(), getPartnerDetails);

// POST /api/partners - Create new partner (admin only)
router.post('/', requireRole(['admin']), createPartner);

// PUT /api/partners/:id - Update partner (admin only)
router.put('/:id', requireRole(['admin']), updatePartner);

// DELETE /api/partners/:id - Soft delete partner (admin only)
router.delete('/:id', requireRole(['admin']), deletePartner);

// PUT /api/partners/:id/credentials - Update NID credentials (admin only)
router.put('/:id/credentials', requireRole(['admin']), updatePartnerCredentials);

module.exports = router; 