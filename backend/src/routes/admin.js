const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate } = require('../middleware/auth');

/**
 * @swagger
 * /api/admin/dashboard:
 *   get:
 *     summary: Get admin dashboard statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics retrieved successfully
 */
router.get('/dashboard', authenticate, adminController.getDashboardStats);

/**
 * @swagger
 * /api/admin/requests:
 *   get:
 *     summary: Get all book requests
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [all, pending, active, completed, cancelled, overdue]
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Book requests retrieved successfully
 */
router.get('/requests', authenticate, adminController.getAllBookRequests);

/**
 * @swagger
 * /api/admin/books/{itemId}/stats:
 *   get:
 *     summary: Get statistics for a specific book
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Book statistics retrieved successfully
 */
router.get('/books/:itemId/stats', authenticate, adminController.getBookStatistics);

/**
 * @swagger
 * /api/admin/books/{itemId}/requesters:
 *   get:
 *     summary: Get all users who requested a specific book
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Book requesters retrieved successfully
 */
router.get('/books/:itemId/requesters', authenticate, adminController.getBookRequesters);

/**
 * @swagger
 * /api/admin/users/{userId}/activity:
 *   get:
 *     summary: Get user activity and statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User activity retrieved successfully
 */
router.get('/users/:userId/activity', authenticate, adminController.getUserActivity);

module.exports = router;
