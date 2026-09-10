const express = require('express');
const router = express.Router();
const {
  getActivitiesByProject,
  getUserActivities,
} = require('../controllers/activityController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/').get(getUserActivities);
router.route('/project/:projectId').get(getActivitiesByProject);

module.exports = router;
