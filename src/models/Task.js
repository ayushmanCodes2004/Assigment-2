const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  dueDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed'],
    default: 'pending'
  },
  category: {
    type: String,
    enum: ['Work', 'Personal', 'Urgent', 'Shopping', 'Health', 'Other'],
    default: 'Other'
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: 50
  }],
  userId: {
    type: Number,
    required: true,
    index: true
  },
  reminderSent: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date
  }
}, {
  timestamps: true
});

taskSchema.index({ userId: 1, category: 1 });
taskSchema.index({ userId: 1, tags: 1 });
taskSchema.index({ dueDate: 1, status: 1, reminderSent: 1 });

module.exports = mongoose.model('Task', taskSchema);