const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const {
  createPaymentIntent,
  confirmPayment,
  getPaymentMethods,
  addPaymentMethod,
  getPaymentHistory,
  refundPayment
} = require('../controllers/paymentController');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     PaymentIntent:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Payment intent ID
 *         amount:
 *           type: number
 *           description: Amount in cents
 *         currency:
 *           type: string
 *           description: Currency code
 *         status:
 *           type: string
 *           description: Payment intent status
 *         payment_method:
 *           type: string
 *           description: Payment method type
 */

/**
 * @swagger
 * /api/payments/intent:
 *   post:
 *     summary: Create payment intent
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               transactionId:
 *                 type: integer
 *               paymentMethod:
 *                 type: string
 *             required:
 *               - transactionId
 *               - paymentMethod
 *     responses:
 *       200:
 *         description: Payment intent created successfully
 */
router.post('/intent', authenticateToken, createPaymentIntent);

/**
 * @swagger
 * /api/payments/confirm:
 *   post:
 *     summary: Confirm payment
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               paymentIntentId:
 *                 type: string
 *               paymentDetails:
 *                 type: object
 *             required:
 *               - paymentIntentId
 *               - paymentDetails
 *     responses:
 *       200:
 *         description: Payment confirmed successfully
 */
router.post('/confirm', authenticateToken, confirmPayment);

// Temporary endpoints until payments are fully implemented
/**
 * @swagger
 * /api/payments/methods:
 *   get:
 *     summary: Get user's payment methods
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Payment methods retrieved successfully
 */
router.get('/methods', authenticateToken, getPaymentMethods);

/**
 * @swagger
 * /api/payments/methods:
 *   post:
 *     summary: Add payment method
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [card, mobile_money, bank_transfer]
 *               details:
 *                 type: object
 *             required:
 *               - type
 *               - details
 *     responses:
 *       201:
 *         description: Payment method added successfully
 */
router.post('/methods', authenticateToken, addPaymentMethod);

/**
 * @swagger
 * /api/payments/history:
 *   get:
 *     summary: Get payment history
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Payment history retrieved successfully
 */
router.get('/history', authenticateToken, getPaymentHistory);

/**
 * @swagger
 * /api/payments/refund:
 *   post:
 *     summary: Refund payment
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               transactionId:
 *                 type: integer
 *               reason:
 *                 type: string
 *             required:
 *               - transactionId
 *               - reason
 *     responses:
 *       200:
 *         description: Refund processed successfully
 */
router.post('/refund', authenticateToken, refundPayment);

module.exports = router;
