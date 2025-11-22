const Transaction = require('../models/Transaction');
const User = require('../models/User');
const Item = require('../models/Item');
const logger = require('../config/logger');
const webSocketService = require('../utils/webSocketService');

// Create payment intent for transaction
const createPaymentIntent = async (req, res, next) => {
  try {
    const { transactionId, paymentMethod } = req.body;
    const userId = req.user.userId;

    // Validate transaction
    const transaction = await Transaction.findById(transactionId);
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    // Verify user is the borrower
    if (transaction.borrower_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to make payment for this transaction'
      });
    }

    // Check transaction status
    if (transaction.transaction_status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Transaction is not in pending status'
      });
    }

    // For demo purposes, we'll simulate different payment methods
    const paymentIntent = {
      id: `pi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      amount: transaction.amount * 100, // Convert to cents
      currency: 'usd',
      status: 'requires_confirmation',
      payment_method: paymentMethod,
      transaction_id: transactionId,
      created_at: new Date().toISOString()
    };

    // Store payment intent (in production, this would be handled by payment processor)
    await Transaction.updatePaymentIntent(transactionId, paymentIntent.id);

    logger.info(`Payment intent created for transaction ${transactionId}: ${paymentIntent.id}`);

    res.json({
      success: true,
      data: { paymentIntent }
    });
  } catch (error) {
    logger.error('Create payment intent error:', error);
    next(error);
  }
};

// Confirm payment
const confirmPayment = async (req, res, next) => {
  try {
    const { paymentIntentId, paymentDetails } = req.body;
    const userId = req.user.userId;

    // Find transaction by payment intent
    const transaction = await Transaction.findByPaymentIntent(paymentIntentId);
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Payment intent not found'
      });
    }

    // Verify user authorization
    if (transaction.borrower_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to confirm this payment'
      });
    }

    // Simulate payment processing based on payment method
    let paymentResult;
    switch (paymentDetails.method) {
      case 'card':
        paymentResult = await processCardPayment(paymentDetails);
        break;
      case 'mobile_money':
        paymentResult = await processMobileMoneyPayment(paymentDetails);
        break;
      case 'bank_transfer':
        paymentResult = await processBankTransferPayment(paymentDetails);
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Unsupported payment method'
        });
    }

    if (!paymentResult.success) {
      return res.status(400).json({
        success: false,
        message: paymentResult.error || 'Payment failed'
      });
    }

    // Update transaction status
    await Transaction.updateStatus(transaction.transaction_id, 'completed');
    await Transaction.updatePaymentStatus(transaction.transaction_id, 'paid');

    // Update item availability
    await Item.updateAvailability(transaction.item_id, 'borrowed');

    // Send notifications
    await Promise.all([
      webSocketService.sendNotification(transaction.borrower_id, {
        type: 'payment_confirmed',
        message: 'Payment confirmed! You can now collect the item.',
        relatedTransactionId: transaction.transaction_id,
        priority: 'high'
      }),
      webSocketService.sendNotification(transaction.lender_id, {
        type: 'payment_received',
        message: 'Payment received for your item! The borrower can now collect it.',
        relatedTransactionId: transaction.transaction_id,
        priority: 'high'
      })
    ]);

    logger.info(`Payment confirmed for transaction ${transaction.transaction_id}`);

    res.json({
      success: true,
      message: 'Payment confirmed successfully',
      data: {
        transaction: {
          ...transaction,
          transaction_status: 'completed',
          payment_status: 'paid'
        },
        payment: paymentResult.payment
      }
    });
  } catch (error) {
    logger.error('Confirm payment error:', error);
    next(error);
  }
};

// Get payment methods for user
const getPaymentMethods = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    // In production, this would fetch from payment processor
    const paymentMethods = [
      {
        id: 'pm_card_visa',
        type: 'card',
        card: {
          brand: 'visa',
          last4: '4242',
          exp_month: 12,
          exp_year: 2025
        },
        is_default: true
      },
      {
        id: 'pm_momo_mtn',
        type: 'mobile_money',
        mobile_money: {
          provider: 'MTN',
          phone_number: '*****1234'
        },
        is_default: false
      }
    ];

    res.json({
      success: true,
      data: { paymentMethods }
    });
  } catch (error) {
    logger.error('Get payment methods error:', error);
    next(error);
  }
};

// Add payment method
const addPaymentMethod = async (req, res, next) => {
  try {
    const { type, details } = req.body;
    const userId = req.user.userId;

    // Validate payment method details
    if (!type || !details) {
      return res.status(400).json({
        success: false,
        message: 'Payment method type and details are required'
      });
    }

    // Create payment method (simulated)
    const paymentMethod = {
      id: `pm_${type}_${Date.now()}`,
      type,
      user_id: userId,
      created_at: new Date().toISOString(),
      is_default: false
    };

    switch (type) {
      case 'card':
        paymentMethod.card = {
          brand: details.brand || 'visa',
          last4: details.number.slice(-4),
          exp_month: details.exp_month,
          exp_year: details.exp_year
        };
        break;
      case 'mobile_money':
        paymentMethod.mobile_money = {
          provider: details.provider,
          phone_number: details.phone_number.replace(/\d(?=\d{4})/g, '*')
        };
        break;
      case 'bank_transfer':
        paymentMethod.bank_account = {
          bank_name: details.bank_name,
          account_number: details.account_number.replace(/\d(?=\d{4})/g, '*')
        };
        break;
    }

    logger.info(`Payment method added for user ${userId}: ${type}`);

    res.status(201).json({
      success: true,
      message: 'Payment method added successfully',
      data: { paymentMethod }
    });
  } catch (error) {
    logger.error('Add payment method error:', error);
    next(error);
  }
};

// Get payment history
const getPaymentHistory = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 20 } = req.query;

    const payments = await Transaction.getUserPaymentHistory(
      userId, 
      Number.parseInt(page), 
      Number.parseInt(limit)
    );

    res.json({
      success: true,
      data: payments
    });
  } catch (error) {
    logger.error('Get payment history error:', error);
    next(error);
  }
};

// Refund payment
const refundPayment = async (req, res, next) => {
  try {
    const { transactionId, reason } = req.body;
    const userId = req.user.userId;

    const transaction = await Transaction.findById(transactionId);
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    // Check authorization (lender or admin can refund)
    if (transaction.lender_id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to refund this payment'
      });
    }

    if (transaction.payment_status !== 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Cannot refund unpaid transaction'
      });
    }

    // Process refund (simulated)
    const refund = {
      id: `re_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      amount: transaction.amount,
      reason,
      status: 'succeeded',
      created_at: new Date().toISOString()
    };

    // Update transaction
    await Transaction.updatePaymentStatus(transactionId, 'refunded');
    await Transaction.updateStatus(transactionId, 'cancelled');

    // Update item availability
    await Item.updateAvailability(transaction.item_id, 'available');

    // Send notifications
    await Promise.all([
      webSocketService.sendNotification(transaction.borrower_id, {
        type: 'payment_refunded',
        message: `Your payment has been refunded. Reason: ${reason}`,
        relatedTransactionId: transactionId,
        priority: 'high'
      }),
      webSocketService.sendNotification(transaction.lender_id, {
        type: 'refund_processed',
        message: 'Refund has been processed successfully.',
        relatedTransactionId: transactionId,
        priority: 'normal'
      })
    ]);

    logger.info(`Payment refunded for transaction ${transactionId}: ${refund.id}`);

    res.json({
      success: true,
      message: 'Refund processed successfully',
      data: { refund }
    });
  } catch (error) {
    logger.error('Refund payment error:', error);
    next(error);
  }
};

// Simulate payment processing functions
async function processCardPayment(paymentDetails) {
  // Simulate card payment processing
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Simple validation
  if (paymentDetails.card_number === '4000000000000002') {
    return { success: false, error: 'Your card was declined' };
  }
  
  return {
    success: true,
    payment: {
      id: `ch_${Date.now()}`,
      status: 'succeeded',
      method: 'card',
      card: {
        last4: paymentDetails.card_number.slice(-4),
        brand: 'visa'
      }
    }
  };
}

async function processMobileMoneyPayment(paymentDetails) {
  // Simulate mobile money payment
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  return {
    success: true,
    payment: {
      id: `momo_${Date.now()}`,
      status: 'succeeded',
      method: 'mobile_money',
      mobile_money: {
        provider: paymentDetails.provider,
        phone_number: paymentDetails.phone_number
      }
    }
  };
}

async function processBankTransferPayment(paymentDetails) {
  // Simulate bank transfer
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  return {
    success: true,
    payment: {
      id: `bt_${Date.now()}`,
      status: 'succeeded',
      method: 'bank_transfer',
      bank_account: {
        account_number: paymentDetails.account_number
      }
    }
  };
}

module.exports = {
  createPaymentIntent,
  confirmPayment,
  getPaymentMethods,
  addPaymentMethod,
  getPaymentHistory,
  refundPayment
};
