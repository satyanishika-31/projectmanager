const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    user: {
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
    text: {
      type: String,
      required: [true, 'Please provide comment text'],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Validate that comment belongs to either a Task or an Issue
commentSchema.pre('validate', function () {
  if (!this.task && !this.issue) {
    throw new Error('A comment must belong to either a Task or an Issue');
  }
  if (this.task && this.issue) {
    throw new Error('A comment cannot belong to both a Task and an Issue simultaneously');
  }
});

commentSchema.index({ task: 1 });
commentSchema.index({ issue: 1 });

module.exports = mongoose.model('Comment', commentSchema);
