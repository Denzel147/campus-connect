const Transaction = require('../models/Transaction');
const Item = require('../models/Item');
const Notification = require('../models/Notification');
const logger = require('../config/logger');

const createTransaction = async (req, res, next) => {
  try {
    const { item_id, transaction_type, borrow_date, due_date, notes } = req.body;

    // Get item details
    const item = await Item.findById(item_id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    // Determine lender and borrower
    let lender_id, borrower_id;
    if (transaction_type === 'borrow') {
      lender_id = item.owner_id;
      borrower_id = req.user.userId;
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid transaction type'
      });
    }

    // Create transaction
    const transaction = await Transaction.create({
      item_id,
      lender_id,
      borrower_id,
      transaction_type,
      borrow_date,
      due_date,
      notes
    });

    logger.info(`Transaction created: ${transaction.transaction_id}`);

    res.status(201).json({
      success: true,
      message: 'Transaction created successfully',
      data: { transaction }
    });
  } catch (error) {
    logger.error('Create transaction error:', error);
    next(error);
  }
};

const getTransactions = async (req, res, next) => {
  try {
    const { role = 'all', page = 1, limit = 10 } = req.query;
    const result = await Transaction.findByUser(
      req.user.userId,
      role,
      parseInt(page),
      parseInt(limit)
    );

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('Get transactions error:', error);
    next(error);
  }
};

const getTransactionById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const transaction = await Transaction.findById(id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    // Check if user is involved in this transaction
    if (transaction.lender_id !== req.user.userId && transaction.borrower_id !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view this transaction'
      });
    }

    res.json({
      success: true,
      data: { transaction }
    });
  } catch (error) {
    logger.error('Get transaction by ID error:', error);
    next(error);
  }
};

const updateTransactionStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { transaction_status, notes } = req.body;

    const transaction = await Transaction.updateStatus(
      id,
      transaction_status,
      req.user.userId,
      notes
    );

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found or you do not have permission to update it'
      });
    }

    // Update item availability based on transaction status
    if (transaction_status === 'approved') {
      await Item.updateAvailability(transaction.item_id, 'borrowed');
      
      // Create notification for borrower
      await Notification.createRequestApproved(
        transaction.item_id,
        transaction.transaction_id,
        transaction.borrower_id
      );
    } else if (transaction_status === 'completed' || transaction_status === 'cancelled') {
      await Item.updateAvailability(transaction.item_id, 'available');
    }

    logger.info(`Transaction ${id} status updated to ${transaction_status}`);

    res.json({
      success: true,
      message: 'Transaction status updated successfully',
      data: { transaction }
    });
  } catch (error) {
    logger.error('Update transaction status error:', error);
    next(error);
  }
};

const markAsReturned = async (req, res, next) => {
  try {
    const { id } = req.params;

    const transaction = await Transaction.markAsReturned(id, req.user.userId);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found or you do not have permission to update it'
      });
    }

    // Update item availability
    await Item.updateAvailability(transaction.item_id, 'available');

    logger.info(`Transaction ${id} marked as returned`);

    res.json({
      success: true,
      message: 'Item marked as returned successfully',
      data: { transaction }
    });
  } catch (error) {
    logger.error('Mark as returned error:', error);
    next(error);
  }
};

const getActiveTransactions = async (req, res, next) => {
  try {
    const transactions = await Transaction.getActiveTransactions(req.user.userId);

    res.json({
      success: true,
      data: { transactions }
    });
  } catch (error) {
    logger.error('Get active transactions error:', error);
    next(error);
  }
};

const getTransactionStats = async (req, res, next) => {
  try {
    const stats = await Transaction.getTransactionStats();

    res.json({
      success: true,
      data: { stats }
    });
  } catch (error) {
    logger.error('Get transaction stats error:', error);
    next(error);
  }
};

const approveTransaction = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const transaction = await Transaction.findById(id);
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    // Only lender can approve
    if (transaction.lender_id !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Only the lender can approve this transaction'
      });
    }

    const updatedTransaction = await Transaction.updateStatus(
      id,
      'approved',
      req.user.userId,
      notes
    );

    // Update item status and create notification
    await Item.updateAvailability(transaction.item_id, 'borrowed');
    await Notification.createRequestApproved(
      transaction.item_id,
      transaction.transaction_id,
      transaction.borrower_id
    );

    logger.info(`Transaction ${id} approved by lender ${req.user.userId}`);

    res.json({
      success: true,
      message: 'Transaction approved successfully',
      data: { transaction: updatedTransaction }
    });
  } catch (error) {
    logger.error('Approve transaction error:', error);
    next(error);
  }
};

const rejectTransaction = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const transaction = await Transaction.findById(id);
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    // Only lender can reject
    if (transaction.lender_id !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Only the lender can reject this transaction'
      });
    }

    const updatedTransaction = await Transaction.updateStatus(
      id,
      'rejected',
      req.user.userId,
      notes
    );

    logger.info(`Transaction ${id} rejected by lender ${req.user.userId}`);

    res.json({
      success: true,
      message: 'Transaction rejected',
      data: { transaction: updatedTransaction }
    });
  } catch (error) {
    logger.error('Reject transaction error:', error);
    next(error);
  }
};

module.exports = {
  createTransaction,
  getTransactions,
  getTransactionById,
  updateTransactionStatus,
  markAsReturned,
  getActiveTransactions,
  getTransactionStats,
  approveTransaction,
  rejectTransaction
};
