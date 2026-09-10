const mongoose = require('mongoose');

const labelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a label name'],
      trim: true,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

labelSchema.index({ project: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Label', labelSchema);
