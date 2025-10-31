const Notification = require('../models/Notification');
const logger = require('../config/logger');

const getNotifications = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const result = await Notification.findByUser(
      req.user.userId,
      parseInt(page),
      parseInt(limit)
    );

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('Get notifications error:', error);
    next(error);
  }
};

const markAsRead = async (req, res, next) => {
  try {
    const { notification_ids } = req.body;
    const notifications = await Notification.markAsRead(notification_ids, req.user.userId);

    res.json({
      success: true,
      message: 'Notifications marked as read',
      data: { notifications }
    });
  } catch (error) {
    logger.error('Mark notifications as read error:', error);
    next(error);
  }
};

const markAllAsRead = async (req, res, next) => {
  try {
    const notifications = await Notification.markAllAsRead(req.user.userId);

    res.json({
      success: true,
      message: 'All notifications marked as read',
      data: { count: notifications.length }
    });
  } catch (error) {
    logger.error('Mark all notifications as read error:', error);
    next(error);
  }
};

const getUnreadCount = async (req, res, next) => {
  try {
    const count = await Notification.getUnreadCount(req.user.userId);

    res.json({
      success: true,
      data: { count }
    });
  } catch (error) {
    logger.error('Get unread count error:', error);
    next(error);
  }
};

const deleteNotification = async (req, res, next) => {
  try {
    const { id } = req.params;
    const notification = await Notification.delete(id, req.user.userId);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    logger.error('Delete notification error:', error);
    next(error);
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
  deleteNotification
};
