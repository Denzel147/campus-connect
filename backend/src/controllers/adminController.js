const Transaction = require('../models/Transaction');
const Item = require('../models/Item');
const User = require('../models/User');
const db = require('../config/database');
const logger = require('../config/logger');

/**
 * Get admin dashboard statistics
 */
const getDashboardStats = async (req, res, next) => {
  try {
    // Get all statistics in parallel
    const [transactionStats, itemStats, userStats, recentActivity] = await Promise.all([
      getTransactionStatistics(),
      getItemStatistics(),
      getUserStatistics(),
      getRecentActivity()
    ]);

    res.json({
      success: true,
      data: {
        transactions: transactionStats,
        items: itemStats,
        users: userStats,
        recentActivity
      }
    });
  } catch (error) {
    logger.error('Error fetching dashboard stats:', error);
    next(error);
  }
};

/**
 * Get all book requests/transactions with details
 */
const getAllBookRequests = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20, sortBy = 'date_created', order = 'DESC' } = req.query;
    const offset = (page - 1) * limit;

    let statusFilter = '';
    const queryParams = [];
    let paramCount = 1;

    if (status && status !== 'all') {
      statusFilter = `WHERE t.transaction_status = $${paramCount}`;
      queryParams.push(status);
      paramCount++;
    }

    const query = `
      SELECT 
        t.*,
        i.title as book_title,
        i.condition as book_condition,
        i.deposit_amount,
        lender.full_name as lender_name,
        lender.email as lender_email,
        lender.phone_number as lender_phone,
        lender.department as lender_department,
        borrower.full_name as borrower_name,
        borrower.email as borrower_email,
        borrower.phone_number as borrower_phone,
        borrower.department as borrower_department,
        COUNT(*) OVER() as total_count
      FROM transactions t
      JOIN items i ON t.item_id = i.item_id
      JOIN users lender ON t.lender_id = lender.user_id
      JOIN users borrower ON t.borrower_id = borrower.user_id
      ${statusFilter}
      ORDER BY t.${sortBy} ${order}
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `;

    queryParams.push(limit, offset);
    const { rows } = await db.query(query, queryParams);

    const totalCount = rows.length > 0 ? parseInt(rows[0].total_count) : 0;
    const totalPages = Math.ceil(totalCount / limit);

    res.json({
      success: true,
      data: {
        requests: rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalCount,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    logger.error('Error fetching book requests:', error);
    next(error);
  }
};

/**
 * Get statistics for a specific book
 */
const getBookStatistics = async (req, res, next) => {
  try {
    const { itemId } = req.params;

    const query = `
      SELECT 
        i.*,
        u.full_name as owner_name,
        u.email as owner_email,
        COUNT(t.transaction_id) as total_requests,
        COUNT(CASE WHEN t.transaction_status = 'pending' THEN 1 END) as pending_requests,
        COUNT(CASE WHEN t.transaction_status = 'active' THEN 1 END) as active_borrows,
        COUNT(CASE WHEN t.transaction_status = 'completed' THEN 1 END) as completed_borrows,
        COUNT(CASE WHEN t.late_return = TRUE THEN 1 END) as late_returns
      FROM items i
      LEFT JOIN users u ON i.owner_id = u.user_id
      LEFT JOIN transactions t ON i.item_id = t.item_id
      WHERE i.item_id = $1
      GROUP BY i.item_id, u.user_id
    `;

    const { rows } = await db.query(query, [itemId]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    res.json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    logger.error('Error fetching book statistics:', error);
    next(error);
  }
};

/**
 * Get all users who requested a specific book
 */
const getBookRequesters = async (req, res, next) => {
  try {
    const { itemId } = req.params;

    const query = `
      SELECT 
        t.transaction_id,
        t.transaction_status,
        t.start_date,
        t.expected_return_date,
        t.actual_return_date,
        t.created_at as request_date,
        u.user_id,
        u.full_name,
        u.email,
        u.phone_number,
        u.department,
        u.student_id,
        u.rating
      FROM transactions t
      JOIN users u ON t.borrower_id = u.user_id
      WHERE t.item_id = $1
      ORDER BY t.created_at DESC
    `;

    const { rows } = await db.query(query, [itemId]);

    res.json({
      success: true,
      data: {
        itemId: parseInt(itemId),
        totalRequesters: rows.length,
        requesters: rows
      }
    });
  } catch (error) {
    logger.error('Error fetching book requesters:', error);
    next(error);
  }
};

/**
 * Get user activity and statistics
 */
const getUserActivity = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const query = `
      SELECT 
        u.*,
        COUNT(DISTINCT i.item_id) as books_listed,
        COUNT(DISTINCT CASE WHEN t_lender.transaction_status = 'active' THEN t_lender.transaction_id END) as active_lendings,
        COUNT(DISTINCT CASE WHEN t_borrower.transaction_status = 'active' THEN t_borrower.transaction_id END) as active_borrowings,
        COUNT(DISTINCT CASE WHEN t_lender.transaction_status = 'completed' THEN t_lender.transaction_id END) as completed_lendings,
        COUNT(DISTINCT CASE WHEN t_borrower.transaction_status = 'completed' THEN t_borrower.transaction_id END) as completed_borrowings
      FROM users u
      LEFT JOIN items i ON u.user_id = i.owner_id
      LEFT JOIN transactions t_lender ON u.user_id = t_lender.lender_id
      LEFT JOIN transactions t_borrower ON u.user_id = t_borrower.borrower_id
      WHERE u.user_id = $1
      GROUP BY u.user_id
    `;

    const { rows } = await db.query(query, [userId]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    logger.error('Error fetching user activity:', error);
    next(error);
  }
};

// Helper functions
async function getTransactionStatistics() {
  const query = `
    SELECT 
      COUNT(*) as total,
      COUNT(CASE WHEN transaction_status = 'pending' THEN 1 END) as pending,
      COUNT(CASE WHEN transaction_status = 'active' THEN 1 END) as active,
      COUNT(CASE WHEN transaction_status = 'completed' THEN 1 END) as completed,
      COUNT(CASE WHEN transaction_status = 'cancelled' THEN 1 END) as cancelled,
      COUNT(CASE WHEN transaction_status = 'overdue' THEN 1 END) as overdue
    FROM transactions
  `;
  const { rows } = await db.query(query);
  return rows[0];
}

async function getItemStatistics() {
  const query = `
    SELECT 
      COUNT(*) as total,
      COUNT(CASE WHEN availability_status = 'available' THEN 1 END) as available,
      COUNT(CASE WHEN availability_status = 'borrowed' THEN 1 END) as borrowed,
      COUNT(CASE WHEN availability_status = 'reserved' THEN 1 END) as reserved,
      COUNT(CASE WHEN availability_status = 'unavailable' THEN 1 END) as unavailable
    FROM items
  `;
  const { rows } = await db.query(query);
  return rows[0];
}

async function getUserStatistics() {
  const query = `
    SELECT 
      COUNT(*) as total,
      COUNT(CASE WHEN account_status = 'active' THEN 1 END) as active,
      COUNT(CASE WHEN account_status = 'inactive' THEN 1 END) as inactive,
      COUNT(CASE WHEN verification_status = 'verified' THEN 1 END) as verified,
      COUNT(CASE WHEN verification_status = 'unverified' THEN 1 END) as unverified
    FROM users
  `;
  const { rows } = await db.query(query);
  return rows[0];
}

async function getRecentActivity() {
  const query = `
    SELECT 
      'transaction' as activity_type,
      t.transaction_id as id,
      t.transaction_status as status,
      t.created_at as timestamp,
      i.title as item_name,
      borrower.full_name as user_name
    FROM transactions t
    JOIN items i ON t.item_id = i.item_id
    JOIN users borrower ON t.borrower_id = borrower.user_id
    ORDER BY t.created_at DESC
    LIMIT 10
  `;
  const { rows } = await db.query(query);
  return rows;
}

module.exports = {
  getDashboardStats,
  getAllBookRequests,
  getBookStatistics,
  getBookRequesters,
  getUserActivity
};
