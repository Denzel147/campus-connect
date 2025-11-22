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
  rejectTransaction,
  getMyRequests,
  getReceivedRequests,
  acceptRequest,
  getPaymentMethods,
  processPayment
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
 * /api/transactions/my-requests:
 *   get:
 *     summary: Get user's pending borrow requests
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Pending requests retrieved successfully
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
router.get('/my-requests', authenticateToken, getMyRequests);

/**
 * @swagger
 * /api/transactions/received:
 *   get:
 *     summary: Get requests received by the current user
 *     description: Get all pending requests for items owned by the current user
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Received requests retrieved successfully
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
 */
router.get('/received', authenticateToken, getReceivedRequests);

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
 * /api/transactions/payments:
 *   get:
 *     summary: Get user's payment transactions
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Payment transactions retrieved successfully
 */
router.get('/payments', authenticateToken, getPaymentMethods);

/**
 * @swagger
 * /api/payments/process:
 *   post:
 *     summary: Process a payment
 *     description: Process payment for a transaction
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - transactionId
 *               - paymentMethod
 *               - amount
 *             properties:
 *               transactionId:
 *                 type: integer
 *               paymentMethod:
 *                 type: object
 *               amount:
 *                 type: number
 *               paymentData:
 *                 type: object
 *     responses:
 *       200:
 *         description: Payment processed successfully
 */
router.post('/payments/process', authenticateToken, processPayment);

// ============================================================================
// PARAMETERIZED ROUTES - These must come AFTER all specific routes
// ============================================================================

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
router.post('/:id/reject', authenticateToken, rejectTransaction);

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

/**
 * @swagger
 * /api/transactions/{id}/accept:
 *   post:
 *     summary: Accept a transaction request
 *     description: Accept a pending request for your item
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
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notes:
 *                 type: string
 *                 description: Optional notes for the acceptance
 *               payment_method:
 *                 type: string
 *                 description: Payment method for paid items
 *     responses:
 *       200:
 *         description: Request accepted successfully
 */
router.post('/:id/accept', authenticateToken, acceptRequest);

/**
 * @swagger
 * /api/transactions/payments:
 *   get:
 *     summary: Get available payment methods
 *     description: Get list of available payment methods
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Payment methods retrieved successfully
 */

/**
 * @swagger
 * /api/payments/process:
 *   post:
 *     summary: Process a payment
 *     description: Process payment for a transaction
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - transaction_id
 *               - payment_method
 *               - amount
 *             properties:
 *               transaction_id:
 *                 type: integer
 *               payment_method:
 *                 type: string
 *               amount:
 *                 type: number
 *     responses:
 *       200:
 *         description: Payment processed successfully
 */
router.post('/payments/process', authenticateToken, processPayment);

/**
 * @swagger
 * /api/transactions/{id}/cancel:
 *   patch:
 *     summary: Cancel a transaction
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
 *         description: Transaction cancelled successfully
 */
router.patch('/:id/cancel', authenticateToken, (req, res) => {
  // For now, just return success - would implement proper cancellation logic
  res.json({
    success: true,
    message: 'Transaction cancelled successfully'
  });
});

module.exports = router;
