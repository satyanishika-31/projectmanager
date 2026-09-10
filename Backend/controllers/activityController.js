const Activity = require('../models/Activity');
const ProjectMember = require('../models/ProjectMember');

// @desc    Get activities for a project
// @route   GET /api/activity/project/:projectId
// @access  Private
const getActivitiesByProject = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { limit = 50 } = req.query;

    const activities = await Activity.find({ project: projectId })
      .populate('user', 'name email avatar')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit, 10) || 50);

    res.status(200).json({
      success: true,
      message: 'Project activities retrieved successfully',
      data: activities,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get recent activities across user projects
// @route   GET /api/activity
// @access  Private
const getUserActivities = async (req, res, next) => {
  try {
    const { limit = 50 } = req.query;

    // Find all projects user belongs to
    const memberships = await ProjectMember.find({ user: req.user._id }).select('project');
    const projectIds = memberships.map((m) => m.project);

    const activities = await Activity.find({ project: { $in: projectIds } })
      .populate('user', 'name email avatar')
      .populate('project', 'name')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit, 10) || 50);

    res.status(200).json({
      success: true,
      message: 'Recent user activities retrieved successfully',
      data: activities,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getActivitiesByProject,
  getUserActivities,
};
