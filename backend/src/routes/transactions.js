const express = require('express');
const { validate } = require('../middleware/validation');
const { transactionSchemas } = require('../utils/validation');
const {
  createTransaction,
  getTransactions,
  getTransactionById,
  updateTransactionStatus,
  markAsReturned,
  getActiveTransactions,
  getTransactionStats,
  approveTransaction,
  rejectTransaction
} = require('../controllers/transactionController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Transaction:
 *       type: object
 *       properties:
 *         transaction_id:
 *           type: integer
 *           description: Unique transaction identifier
 *         item_id:
 *           type: integer
 *           description: Item ID
 *         lender_id:
 *           type: integer
 *           description: Lender's user ID
 *         borrower_id:
 *           type: integer
 *           description: Borrower's user ID
 *         transaction_type:
 *           type: string
 *           enum: [borrow, lend]
 *           description: Type of transaction
 *         transaction_status:
 *           type: string
 *           enum: [pending, approved, rejected, active, completed, cancelled]
 *           description: Transaction status
 *         borrow_date:
 *           type: string
 *           format: date
 *           description: Date item was borrowed
 *         due_date:
 *           type: string
 *           format: date
 *           description: Due date for return
 *         return_date:
 *           type: string
 *           format: date-time
 *           description: Date item was returned
 *         late_return:
 *           type: boolean
 *           description: Whether return was late
 *         days_overdue:
 *           type: integer
 *           description: Number of days overdue
 *         notes:
 *           type: string
 *           description: Transaction notes
 *         date_created:
 *           type: string
 *           format: date-time
 *           description: Date transaction was created
 */

/**
 * @swagger
 * /api/transactions:
 *   post:
 *     summary: Create a new transaction
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - item_id
 *               - transaction_type
 *             properties:
 *               item_id:
 *                 type: integer
 *                 minimum: 1
 *               transaction_type:
 *                 type: string
 *                 enum: [borrow, lend]
 *               borrow_date:
 *                 type: string
 *                 format: date
 *               due_date:
 *                 type: string
 *                 format: date
 *               notes:
 *                 type: string
 *                 maxLength: 500
 *     responses:
 *       201:
 *         description: Transaction created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post('/', authenticateToken, validate(transactionSchemas.create), createTransaction);

/**
 * @swagger
 * /api/transactions:
 *   get:
 *     summary: Get user's transactions
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [all, lender, borrower]
 *           default: all
 *         description: Filter by user role in transaction
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
 *           default: 10
 *     responses:
 *       200:
 *         description: Transactions retrieved successfully
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
 *                     transactions:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Transaction'
 *                     totalCount:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *       401:
 *         description: Unauthorized
 */
router.get('/', authenticateToken, getTransactions);

/**
 * @swagger
 * /api/transactions/active:
 *   get:
 *     summary: Get user's active transactions
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Active transactions retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/active', authenticateToken, getActiveTransactions);

/**
 * @swagger
 * /api/transactions/stats:
 *   get:
 *     summary: Get transaction statistics
 *     tags: [Transactions]
 *     responses:
 *       200:
 *         description: Transaction statistics retrieved successfully
 */
router.get('/stats', getTransactionStats);

/**
 * @swagger
 * /api/transactions/{id}:
 *   get:
 *     summary: Get transaction by ID
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Transaction ID
 *     responses:
 *       200:
 *         description: Transaction retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: Transaction not found
 */
router.get('/:id', authenticateToken, getTransactionById);

/**
 * @swagger
 * /api/transactions/{id}/status:
 *   put:
 *     summary: Update transaction status
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Transaction ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               transaction_status:
 *                 type: string
 *                 enum: [pending, approved, rejected, active, completed, cancelled]
 *               notes:
 *                 type: string
 *                 maxLength: 500
 *     responses:
 *       200:
 *         description: Transaction status updated successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Transaction not found
 */
router.put('/:id/status', authenticateToken, validate(transactionSchemas.update), updateTransactionStatus);

/**
 * @swagger
 * /api/transactions/{id}/approve:
 *   put:
 *     summary: Approve a transaction (lender only)
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Transaction ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notes:
 *                 type: string
 *                 maxLength: 500
 *     responses:
 *       200:
 *         description: Transaction approved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Only lender can approve
 *       404:
 *         description: Transaction not found
 */
router.put('/:id/approve', authenticateToken, approveTransaction);

/**
 * @swagger
 * /api/transactions/{id}/reject:
 *   put:
 *     summary: Reject a transaction (lender only)
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Transaction ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notes:
 *                 type: string
 *                 maxLength: 500
 *     responses:
 *       200:
 *         description: Transaction rejected successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Only lender can reject
 *       404:
 *         description: Transaction not found
 */
router.put('/:id/reject', authenticateToken, rejectTransaction);

/**
 * @swagger
 * /api/transactions/{id}/return:
 *   put:
 *     summary: Mark item as returned
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Transaction ID
 *     responses:
 *       200:
 *         description: Item marked as returned successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Transaction not found
 */
router.put('/:id/return', authenticateToken, markAsReturned);

module.exports = router;
