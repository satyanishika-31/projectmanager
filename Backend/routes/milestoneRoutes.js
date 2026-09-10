const express = require('express');
const router = express.Router();
const {
  createMilestone,
  getMilestonesByProject,
  getMilestoneById,
  updateMilestone,
  deleteMilestone,
} = require('../controllers/milestoneController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/').post(createMilestone);
router.route('/project/:projectId').get(getMilestonesByProject);
router.route('/:id').get(getMilestoneById).put(updateMilestone).delete(deleteMilestone);

module.exports = router;
