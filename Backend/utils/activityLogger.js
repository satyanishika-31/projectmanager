const Activity = require('../models/Activity');

/**
 * Log project activity automatically
 * @param {Object} params
 * @param {string|ObjectId} params.project
 * @param {string|ObjectId} params.user
 * @param {string} params.action - e.g. "John created Task: Login Page"
 * @param {string} params.entityType - 'Task', 'Issue', 'Milestone', 'Sprint', 'Project', 'Comment'
 * @param {string|ObjectId} params.entityId
 */
const logActivity = async ({ project, user, action, entityType, entityId }) => {
  try {
    if (!project || !user || !action || !entityType) return;
    await Activity.create({
      project,
      user,
      action,
      entityType,
      entityId,
    });
  } catch (error) {
    console.error('Failed to log activity:', error.message);
  }
};

module.exports = logActivity;
