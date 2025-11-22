const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken } = require('../middleware/auth');

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
router.get('/dashboard', authenticateToken, adminController.getDashboardStats);

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
router.get('/requests', authenticateToken, adminController.getAllBookRequests);

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
router.get('/books/:itemId/stats', authenticateToken, adminController.getBookStatistics);

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
router.get('/books/:itemId/requesters', authenticateToken, adminController.getBookRequesters);

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
router.get('/users/:userId/activity', authenticateToken, adminController.getUserActivity);

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Get all users for admin management
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 */
router.get('/users', authenticateToken, adminController.getAllUsers);

/**
 * @swagger
 * /api/admin/items:
 *   get:
 *     summary: Get all items for admin management
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Items retrieved successfully
 */
router.get('/items', authenticateToken, adminController.getAllItems);

/**
 * @swagger
 * /api/admin/transactions:
 *   get:
 *     summary: Get all transactions for admin management
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Transactions retrieved successfully
 */
router.get('/transactions', authenticateToken, adminController.getAllTransactions);

// Test endpoint without auth
router.get('/test', (req, res) => {
  res.json({ success: true, message: 'Admin mock controller is working!' });
});

module.exports = router;
