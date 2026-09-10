const express = require('express');
const router = express.Router();
const {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  getProjectMembers,
  addProjectMember,
  updateProjectMemberRole,
  removeProjectMember,
  getProjectDashboard,
} = require('../controllers/projectController');
const { protect } = require('../middleware/authMiddleware');
const { requireProjectRole } = require('../middleware/roleMiddleware');

router.use(protect);

router.route('/').post(createProject).get(getProjects);

router
  .route('/:id')
  .get(getProjectById)
  .put(requireProjectRole('manager'), updateProject)
  .delete(requireProjectRole('manager'), deleteProject);

router
  .route('/:id/members')
  .get(getProjectMembers)
  .post(requireProjectRole('manager'), addProjectMember);

router
  .route('/:id/members/:userId')
  .put(requireProjectRole('manager'), updateProjectMemberRole)
  .delete(requireProjectRole('manager'), removeProjectMember);

router.route('/:id/dashboard').get(getProjectDashboard);

module.exports = router;
