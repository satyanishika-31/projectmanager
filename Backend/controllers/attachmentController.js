const path = require('path');
const fs = require('fs');
const Attachment = require('../models/Attachment');

// @desc    Upload an attachment
// @route   POST /api/attachments
// @access  Private
const uploadAttachment = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a file',
      });
    }

    const { task, issue } = req.body;

    if (!task && !issue) {
      // Remove uploaded file if validation fails
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({
        success: false,
        message: 'Attachment must be linked to either a task or an issue',
      });
    }

    const fileUrl = `/uploads/${req.file.filename}`;

    const attachment = await Attachment.create({
      fileName: req.file.originalname,
      fileUrl,
      uploadedBy: req.user._id,
      task: task || null,
      issue: issue || null,
    });

    await attachment.populate('uploadedBy', 'name email avatar');

    res.status(201).json({
      success: true,
      message: 'Attachment uploaded successfully',
      data: attachment,
    });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    next(error);
  }
};

// @desc    Get attachments by task or issue
// @route   GET /api/attachments
// @access  Private
const getAttachments = async (req, res, next) => {
  try {
    const { task, issue } = req.query;
    const filter = {};

    if (task) filter.task = task;
    if (issue) filter.issue = issue;

    const attachments = await Attachment.find(filter)
      .populate('uploadedBy', 'name email avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'Attachments retrieved successfully',
      data: attachments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete attachment
// @route   DELETE /api/attachments/:id
// @access  Private
const deleteAttachment = async (req, res, next) => {
  try {
    const attachment = await Attachment.findById(req.params.id);

    if (!attachment) {
      return res.status(404).json({
        success: false,
        message: 'Attachment not found',
      });
    }

    // Try deleting file from disk
    const filePath = path.join(__dirname, '..', attachment.fileUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await attachment.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Attachment deleted successfully',
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadAttachment,
  getAttachments,
  deleteAttachment,
};
