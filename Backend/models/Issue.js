const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Please provide an issue title'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide an issue description'],
      trim: true,
    },
    reproductionSteps: {
      type: String,
      trim: true,
      default: '',
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['open', 'in-progress', 'resolved', 'closed'],
      default: 'open',
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    resolution: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

issueSchema.index({ project: 1, status: 1 });
issueSchema.index({ project: 1, severity: 1 });

module.exports = mongoose.model('Issue', issueSchema);
