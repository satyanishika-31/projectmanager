const express = require('express');
const router = express.Router();
const {
  createSprint,
  getSprintsByProject,
  getSprintById,
  updateSprint,
  startSprint,
  completeSprint,
  deleteSprint,
} = require('../controllers/sprintController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/').post(createSprint);
router.route('/project/:projectId').get(getSprintsByProject);
router.route('/:id').get(getSprintById).put(updateSprint).delete(deleteSprint);
router.route('/:id/start').put(startSprint);
router.route('/:id/complete').put(completeSprint);

module.exports = router;
