const Notification = require('../models/Notification');

/**
 * Generate in-app notifications
 * @param {Object} params
 * @param {string|ObjectId} params.user - recipient user id
 * @param {string} params.message
 * @param {'assignment'|'mention'|'comment'|'invitation'|'deadline'|'issue'} params.type
 */
const createNotification = async ({ user, message, type }) => {
  try {
    if (!user || !message || !type) return;
    await Notification.create({
      user,
      message,
      type,
    });
  } catch (error) {
    console.error('Failed to create notification:', error.message);
  }
};

module.exports = createNotification;
