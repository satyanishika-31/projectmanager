const express = require('express');
const router = express.Router();
const {
  createOrganization,
  getOrganizations,
  getOrganizationById,
  updateOrganization,
  deleteOrganization,
  getOrganizationMembers,
  addOrganizationMember,
  updateOrganizationMemberRole,
  removeOrganizationMember,
} = require('../controllers/organizationController');
const { protect } = require('../middleware/authMiddleware');
const { requireOrgRole } = require('../middleware/roleMiddleware');

router.use(protect);

router.route('/').post(createOrganization).get(getOrganizations);

router
  .route('/:id')
  .get(getOrganizationById)
  .put(requireOrgRole('admin'), updateOrganization)
  .delete(deleteOrganization);

router
  .route('/:id/members')
  .get(requireOrgRole('admin', 'member'), getOrganizationMembers)
  .post(requireOrgRole('admin'), addOrganizationMember);

router
  .route('/:id/members/:userId')
  .put(requireOrgRole('admin'), updateOrganizationMemberRole)
  .delete(requireOrgRole('admin'), removeOrganizationMember);

module.exports = router;
