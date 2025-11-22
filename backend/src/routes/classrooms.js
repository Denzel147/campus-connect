const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const {
  getClassrooms,
  getJoinedClassrooms,
  joinClassroom,
  leaveClassroom,
  getClassroomMessages,
  sendMessage,
  toggleMessageLike,
  deleteMessage
} = require('../controllers/classroomController');

const router = express.Router();

// Temporary endpoints until classrooms are fully implemented
/**
 * @swagger
 * /api/classrooms:
 *   get:
 *     summary: Get available classrooms
 *     tags: [Classrooms]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Classrooms retrieved successfully
 */
router.get('/', authenticateToken, getClassrooms);

/**
 * @swagger
 * /api/classrooms/joined:
 *   get:
 *     summary: Get user's joined classrooms
 *     tags: [Classrooms]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User's classrooms retrieved successfully
 */
router.get('/joined', authenticateToken, getJoinedClassrooms);

/**
 * @swagger
 * /api/classrooms/{id}/join:
 *   post:
 *     summary: Join a classroom
 *     tags: [Classrooms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Successfully joined classroom
 */
router.post('/:id/join', authenticateToken, joinClassroom);

/**
 * @swagger
 * /api/classrooms/{id}/leave:
 *   post:
 *     summary: Leave a classroom
 *     tags: [Classrooms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Successfully left classroom
 */
router.post('/:id/leave', authenticateToken, leaveClassroom);

/**
 * @swagger
 * /api/classrooms/{id}/messages:
 *   get:
 *     summary: Get classroom messages
 *     tags: [Classrooms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Messages retrieved successfully
 */
router.get('/:id/messages', authenticateToken, getClassroomMessages);

/**
 * @swagger
 * /api/classrooms/{id}/messages:
 *   post:
 *     summary: Send a message to classroom
 *     tags: [Classrooms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *     responses:
 *       201:
 *         description: Message sent successfully
 */
router.post('/:id/messages', authenticateToken, sendMessage);

/**
 * @swagger
 * /api/messages/{messageId}/like:
 *   post:
 *     summary: Toggle like on a message
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Like toggled successfully
 */
router.post('/messages/:messageId/like', authenticateToken, toggleMessageLike);

/**
 * @swagger
 * /api/messages/{messageId}:
 *   delete:
 *     summary: Delete a message
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Message deleted successfully
 */
router.delete('/messages/:messageId', authenticateToken, deleteMessage);

module.exports = router;
