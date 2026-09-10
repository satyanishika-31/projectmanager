const express = require('express');
const router = express.Router();
const {
  createLabel,
  getLabelsByProject,
  updateLabel,
  deleteLabel,
} = require('../controllers/labelController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/').post(createLabel);
router.route('/project/:projectId').get(getLabelsByProject);
router.route('/:id').put(updateLabel).delete(deleteLabel);

module.exports = router;
