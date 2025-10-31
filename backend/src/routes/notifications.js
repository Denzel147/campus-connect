const express = require('express');
const { validate } = require('../middleware/validation');
const { notificationSchemas } = require('../utils/validation');
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
  deleteNotification
} = require('../controllers/notificationController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Notification:
 *       type: object
 *       properties:
 *         notification_id:
 *           type: integer
 *           description: Unique notification identifier
 *         user_id:
 *           type: integer
 *           description: User ID
 *         notification_type:
 *           type: string
 *           description: Type of notification
 *         message:
 *           type: string
 *           description: Notification message
 *         related_item_id:
 *           type: integer
 *           description: Related item ID
 *         related_transaction_id:
 *           type: integer
 *           description: Related transaction ID
 *         is_read:
 *           type: boolean
 *           description: Whether notification is read
 *         priority:
 *           type: string
 *           enum: [normal, medium, high]
 *           description: Notification priority
 *         date_created:
 *           type: string
 *           format: date-time
 *           description: Date notification was created
 *         date_read:
 *           type: string
 *           format: date-time
 *           description: Date notification was read
 */

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Get user's notifications
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 20
 *     responses:
 *       200:
 *         description: Notifications retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     notifications:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Notification'
 *                     totalCount:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *       401:
 *         description: Unauthorized
 */
router.get('/', authenticateToken, getNotifications);

/**
 * @swagger
 * /api/notifications/unread-count:
 *   get:
 *     summary: Get unread notifications count
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Unread count retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     count:
 *                       type: integer
 *       401:
 *         description: Unauthorized
 */
router.get('/unread-count', authenticateToken, getUnreadCount);

/**
 * @swagger
 * /api/notifications/mark-read:
 *   put:
 *     summary: Mark notifications as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - notification_ids
 *             properties:
 *               notification_ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 minItems: 1
 *                 description: Array of notification IDs to mark as read
 *     responses:
 *       200:
 *         description: Notifications marked as read successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.put('/mark-read', authenticateToken, validate(notificationSchemas.markAsRead), markAsRead);

/**
 * @swagger
 * /api/notifications/mark-all-read:
 *   put:
 *     summary: Mark all notifications as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All notifications marked as read successfully
 *       401:
 *         description: Unauthorized
 */
router.put('/mark-all-read', authenticateToken, markAllAsRead);

/**
 * @swagger
 * /api/notifications/{id}:
 *   delete:
 *     summary: Delete notification
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Notification ID
 *     responses:
 *       200:
 *         description: Notification deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Notification not found
 */
router.delete('/:id', authenticateToken, deleteNotification);

module.exports = router;
