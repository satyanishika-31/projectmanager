const mongoose = require('mongoose');

const attachmentSchema = new mongoose.Schema(
  {
    fileName: {
      type: String,
      required: true,
      trim: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
    },
    issue: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Issue',
    },
  },
  {
    timestamps: true,
  }
);

attachmentSchema.index({ task: 1 });
attachmentSchema.index({ issue: 1 });

module.exports = mongoose.model('Attachment', attachmentSchema);
