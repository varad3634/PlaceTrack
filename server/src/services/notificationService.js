import Notification from '../models/Notification.js';

export const sendNotification = async ({
  recipientId,
  title,
  message,
  type = 'system',
  link = '',
}) => {
  try {
    return await Notification.create({
      recipient: recipientId,
      title,
      message,
      type,
      link,
    });
  } catch (error) {
    console.error('Failed to send notification:', error.message);
  }
};

export const sendBulkNotifications = async (notifications = []) => {
  try {
    if (!notifications.length) return [];
    return await Notification.insertMany(notifications);
  } catch (error) {
    console.error('Failed to send bulk notifications:', error.message);
  }
};
