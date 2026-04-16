const axios = require('axios');

class WebhookService {
  constructor() {
    this.webhookUrl = process.env.WEBHOOK_URL;
    this.maxRetries = parseInt(process.env.WEBHOOK_RETRY_ATTEMPTS) || 3;
    this.retryDelay = parseInt(process.env.WEBHOOK_RETRY_DELAY) || 1000;
  }

  async sendNotification(type, data) {
    if (!this.webhookUrl) {
      console.log('Webhook URL not configured, skipping notification');
      return;
    }

    const payload = {
      type,
      timestamp: new Date().toISOString(),
      data
    };

    await this.sendWithRetry(payload);
  }

  async sendWithRetry(payload, attempt = 1) {
    try {
      console.log(`Sending webhook (attempt ${attempt}/${this.maxRetries})...`);
      
      const response = await axios.post(this.webhookUrl, payload, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 5000
      });

      console.log(`Webhook sent successfully: ${response.status}`);
      return response.data;
    } catch (error) {
      console.error(`Webhook attempt ${attempt} failed:`, error.message);

      if (attempt < this.maxRetries) {
        const delay = this.retryDelay * Math.pow(2, attempt - 1);
        console.log(`Retrying in ${delay}ms...`);
        
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.sendWithRetry(payload, attempt + 1);
      } else {
        console.error('Max retry attempts reached. Webhook delivery failed.');
        throw new Error('Webhook delivery failed after maximum retries');
      }
    }
  }

  async sendTaskCompletionNotification(task) {
    const payload = {
      taskId: task._id,
      title: task.title,
      completionDate: task.completedAt || new Date(),
      userId: task.userId,
      category: task.category,
      tags: task.tags,
      createdAt: task.createdAt,
      dueDate: task.dueDate
    };

    console.log('=== TASK COMPLETED WEBHOOK ===');
    console.log(`Task ID: ${task._id}`);
    console.log(`Title: ${task.title}`);
    console.log(`User ID: ${task.userId}`);
    console.log(`Completed At: ${payload.completionDate}`);
    console.log('==============================');

    await this.sendNotification('task_completed', payload);
  }
}

module.exports = new WebhookService();
