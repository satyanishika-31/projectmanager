const express = require('express');
const router = express.Router();
const {
  createTeam,
  getTeams,
  getTeamById,
  updateTeam,
  deleteTeam,
  addTeamMember,
  removeTeamMember,
} = require('../controllers/teamController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/').post(createTeam).get(getTeams);
router.route('/:id').get(getTeamById).put(updateTeam).delete(deleteTeam);
router.route('/:id/members').post(addTeamMember);
router.route('/:id/members/:userId').delete(removeTeamMember);

module.exports = router;
