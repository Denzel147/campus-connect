const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { getUserStats } = require('../controllers/authController');

const router = express.Router();

/**
 * @swagger
 * /api/users/stats:
 *   get:
 *     summary: Get user statistics (alias for /api/auth/stats)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalItems:
 *                       type: integer
 *                       description: Total items posted by user
 *                     totalTransactions:
 *                       type: integer
 *                       description: Total transactions completed
 *                     totalEarnings:
 *                       type: number
 *                       description: Total earnings from sales
 *                     itemsSold:
 *                       type: integer
 *                       description: Number of items sold
 *                     itemsBought:
 *                       type: integer
 *                       description: Number of items bought
 *       401:
 *         description: Unauthorized
 */
router.get('/stats', authenticateToken, getUserStats);

module.exports = router;
