const Task = require('../models/Task');
const webhookService = require('./webhookService');

class ReminderService {
  constructor() {
    this.reminderQueue = new Map();
    this.checkInterval = parseInt(process.env.REMINDER_CHECK_INTERVAL) || 60000;
    this.advanceTime = parseInt(process.env.REMINDER_ADVANCE_TIME) || 3600000;
  }

  start() {
    console.log('Reminder service started');
    this.scheduleNextCheck();
  }

  scheduleNextCheck() {
    setTimeout(() => {
      this.checkReminders();
      this.scheduleNextCheck();
    }, this.checkInterval);
  }

  async checkReminders() {
    try {
      const now = new Date();
      const reminderTime = new Date(now.getTime() + this.advanceTime);

      const tasksNeedingReminder = await Task.find({
        status: 'pending',
        reminderSent: false,
        dueDate: {
          $gte: now,
          $lte: reminderTime
        }
      });

      for (const task of tasksNeedingReminder) {
        await this.sendReminder(task);
      }
    } catch (error) {
      console.error('Error checking reminders:', error);
    }
  }

  async sendReminder(task) {
    try {
      const reminderData = {
        taskId: task._id,
        title: task.title,
        dueDate: task.dueDate,
        userId: task.userId,
        category: task.category,
        tags: task.tags,
        message: `Reminder: Task "${task.title}" is due in 1 hour`
      };

      console.log('=== TASK REMINDER ===');
      console.log(`Task ID: ${task._id}`);
      console.log(`Title: ${task.title}`);
      console.log(`Due Date: ${task.dueDate}`);
      console.log(`User ID: ${task.userId}`);
      console.log(`Category: ${task.category}`);
      console.log(`Tags: ${task.tags.join(', ')}`);
      console.log('====================');

      await webhookService.sendNotification('reminder', reminderData);

      task.reminderSent = true;
      await task.save();

      console.log(`Reminder sent for task: ${task._id}`);
    } catch (error) {
      console.error(`Error sending reminder for task ${task._id}:`, error);
    }
  }

  async scheduleTaskReminder(taskId) {
    try {
      const task = await Task.findById(taskId);
      if (!task || task.status === 'completed' || task.reminderSent) {
        return;
      }

      const now = new Date();
      const dueDate = new Date(task.dueDate);
      const reminderTime = new Date(dueDate.getTime() - this.advanceTime);

      if (reminderTime > now) {
        const delay = reminderTime.getTime() - now.getTime();
        
        if (this.reminderQueue.has(taskId.toString())) {
          clearTimeout(this.reminderQueue.get(taskId.toString()));
        }

        const timeoutId = setTimeout(async () => {
          await this.sendReminder(task);
          this.reminderQueue.delete(taskId.toString());
        }, delay);

        this.reminderQueue.set(taskId.toString(), timeoutId);
        console.log(`Scheduled reminder for task ${taskId} at ${reminderTime}`);
      }
    } catch (error) {
      console.error(`Error scheduling reminder for task ${taskId}:`, error);
    }
  }

  cancelTaskReminder(taskId) {
    const timeoutId = this.reminderQueue.get(taskId.toString());
    if (timeoutId) {
      clearTimeout(timeoutId);
      this.reminderQueue.delete(taskId.toString());
      console.log(`Cancelled reminder for task ${taskId}`);
    }
  }
}

module.exports = new ReminderService();
