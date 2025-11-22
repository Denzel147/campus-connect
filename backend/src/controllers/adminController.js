const db = require('../config/database');
const logger = require('../config/logger');

/**
 * Get admin dashboard statistics
 */
const getDashboardStats = async (req, res, next) => {
  try {
    // Get real statistics from database
    const userStatsQuery = `
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE account_status = 'active') as active,
        COUNT(*) FILTER (WHERE account_status = 'inactive') as inactive,
        COUNT(*) FILTER (WHERE verification_status = true) as verified,
        COUNT(*) FILTER (WHERE verification_status = false) as unverified
      FROM users
    `;
    
    const itemStatsQuery = `
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE availability_status = 'available') as available,
        COUNT(*) FILTER (WHERE availability_status = 'borrowed') as borrowed,
        COUNT(*) FILTER (WHERE availability_status = 'reserved') as reserved,
        COUNT(*) FILTER (WHERE availability_status = 'unavailable') as unavailable
      FROM items
    `;
    
    const transactionStatsQuery = `
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE transaction_status = 'pending') as pending,
        COUNT(*) FILTER (WHERE transaction_status = 'active') as active,
        COUNT(*) FILTER (WHERE transaction_status = 'approved') as approved,
        COUNT(*) FILTER (WHERE transaction_status = 'completed') as completed,
        COUNT(*) FILTER (WHERE transaction_status = 'cancelled') as cancelled,
        COUNT(*) FILTER (WHERE transaction_status = 'rejected') as rejected
      FROM transactions
    `;

    const recentActivityQuery = `
      SELECT 
        t.transaction_id as id,
        'transaction' as activity_type,
        t.transaction_status as status,
        t.date_created as timestamp,
        i.item_name,
        u.full_name as user_name
      FROM transactions t
      LEFT JOIN items i ON t.item_id = i.item_id
      LEFT JOIN users u ON t.borrower_id = u.user_id
      ORDER BY t.date_created DESC
      LIMIT 10
    `;

    const [userStats, itemStats, transactionStats, recentActivity] = await Promise.all([
      db.query(userStatsQuery),
      db.query(itemStatsQuery),
      db.query(transactionStatsQuery),
      db.query(recentActivityQuery)
    ]);

    const stats = {
      users: {
        total: Number.parseInt(userStats.rows[0].total),
        active: Number.parseInt(userStats.rows[0].active),
        inactive: Number.parseInt(userStats.rows[0].inactive),
        verified: Number.parseInt(userStats.rows[0].verified),
        unverified: Number.parseInt(userStats.rows[0].unverified)
      },
      items: {
        total: Number.parseInt(itemStats.rows[0].total),
        available: Number.parseInt(itemStats.rows[0].available),
        borrowed: Number.parseInt(itemStats.rows[0].borrowed),
        reserved: Number.parseInt(itemStats.rows[0].reserved),
        unavailable: Number.parseInt(itemStats.rows[0].unavailable)
      },
      transactions: {
        total: Number.parseInt(transactionStats.rows[0].total),
        pending: Number.parseInt(transactionStats.rows[0].pending),
        active: Number.parseInt(transactionStats.rows[0].active),
        approved: Number.parseInt(transactionStats.rows[0].approved),
        completed: Number.parseInt(transactionStats.rows[0].completed),
        cancelled: Number.parseInt(transactionStats.rows[0].cancelled),
        rejected: Number.parseInt(transactionStats.rows[0].rejected)
      },
      recentActivity: recentActivity.rows
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    logger.error('Error fetching dashboard stats:', error);
    next(error);
  }
};

/**
 * Get all users for admin management
 */
const getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE 1=1';
    const queryParams = [];

    // Add status filter
    if (status && status !== 'all') {
      queryParams.push(status);
      whereClause += ` AND account_status = $${queryParams.length}`;
    }

    // Add search filter
    if (search) {
      queryParams.push(`%${search}%`);
      whereClause += ` AND (full_name ILIKE $${queryParams.length} OR email ILIKE $${queryParams.length} OR student_id ILIKE $${queryParams.length})`;
    }

    // Get total count for pagination
    const countQuery = `SELECT COUNT(*) as total FROM users ${whereClause}`;
    const countResult = await db.query(countQuery, queryParams);
    const totalCount = parseInt(countResult.rows[0].total);

    // Get users with pagination
    queryParams.push(limit, offset);
    const usersQuery = `
      SELECT 
        user_id,
        full_name,
        email,
        phone_number,
        institution,
        major as department,
        student_id,
        verification_status,
        account_status,
        COALESCE(rating, 0) as rating,
        COALESCE(total_lends, 0) as total_lends,
        COALESCE(total_borrows, 0) as total_borrows,
        date_joined,
        last_login,
        profile_picture
      FROM users 
      ${whereClause}
      ORDER BY date_joined DESC
      LIMIT $${queryParams.length - 1} OFFSET $${queryParams.length}
    `;

    const result = await db.query(usersQuery, queryParams);
    const users = result.rows;

    const totalPages = Math.ceil(totalCount / limit);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalCount,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    logger.error('Error fetching users:', error);
    next(error);
  }
};

/**
 * Get all items for admin management  
 */
const getAllItems = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, category, search } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE 1=1';
    const queryParams = [];

    // Add status filter
    if (status && status !== 'all') {
      queryParams.push(status);
      whereClause += ` AND availability_status = $${queryParams.length}`;
    }

    // Add category filter
    if (category && category !== 'all') {
      queryParams.push(category);
      whereClause += ` AND c.category_name = $${queryParams.length}`;
    }

    // Add search filter
    if (search) {
      queryParams.push(`%${search}%`);
      whereClause += ` AND (i.item_name ILIKE $${queryParams.length} OR i.description ILIKE $${queryParams.length} OR u.full_name ILIKE $${queryParams.length})`;
    }

    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM items i
      LEFT JOIN users u ON i.owner_id = u.user_id
      LEFT JOIN categories c ON i.category = c.category_id
      ${whereClause}
    `;
    const countResult = await db.query(countQuery, queryParams);
    const totalCount = Number.parseInt(countResult.rows[0].total);

    // Get items with pagination
    queryParams.push(limit, offset);
    const itemsQuery = `
      SELECT 
        i.item_id,
        i.item_name,
        i.description,
        c.category_name as category,
        i.condition,
        i.availability_status,
        u.full_name as owner_name,
        u.email as owner_email,
        i.sharing_type,
        i.location,
        i.date_listed,
        i.date_updated,
        COALESCE(
          (SELECT COUNT(*) FROM transactions t WHERE t.item_id = i.item_id),
          0
        ) as total_requests
      FROM items i
      LEFT JOIN users u ON i.owner_id = u.user_id
      LEFT JOIN categories c ON i.category = c.category_id
      ${whereClause}
      ORDER BY i.date_listed DESC
      LIMIT $${queryParams.length - 1} OFFSET $${queryParams.length}
    `;

    const result = await db.query(itemsQuery, queryParams);
    const items = result.rows;

    const totalPages = Math.ceil(totalCount / limit);

    res.json({
      success: true,
      data: {
        items,
        pagination: {
          currentPage: Number.parseInt(page),
          totalPages,
          totalCount,
          limit: Number.parseInt(limit)
        }
      }
    });
  } catch (error) {
    logger.error('Error fetching items:', error);
    next(error);
  }
};

/**
 * Get all transactions for admin management
 */
const getAllTransactions = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;

    // Mock transaction data
    const mockTransactions = [
      {
        transaction_id: 1,
        transaction_status: 'pending',
        item_title: 'Introduction to Algorithms',
        item_condition: 'good',
        lender_name: 'Alice Johnson',
        lender_email: 'alice@alustudent.com',
        borrower_name: 'Bob Smith',
        borrower_email: 'bob@alustudent.com',
        date_created: '2025-11-20T06:04:19.290Z',
        borrow_date: null,
        due_date: null,
        return_date: null
      }
    ];

    res.json({
      success: true,
      data: {
        transactions: mockTransactions,
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalCount: 1,
          limit: 20
        }
      }
    });
  } catch (error) {
    logger.error('Error fetching transactions:', error);
    next(error);
  }
};

/**
 * Get all book requests/transactions with details
 */
const getAllBookRequests = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20, sortBy = 'date_created', order = 'DESC' } = req.query;

    // Mock book request data
    const mockRequests = [
      {
        transaction_id: 1,
        transaction_status: 'pending',
        book_title: 'Introduction to Algorithms',
        book_condition: 'good',
        lender_name: 'Alice Johnson',
        lender_email: 'alice@alustudent.com',
        lender_phone: '+250781234567',
        lender_department: 'Computer Science',
        borrower_name: 'Bob Smith',
        borrower_email: 'bob@alustudent.com', 
        borrower_phone: '+250787654321',
        borrower_department: 'Software Engineering',
        date_created: '2025-11-20T06:04:19.290Z'
      }
    ];

    res.json({
      success: true,
      data: {
        requests: mockRequests,
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalCount: 1,
          limit: 20
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

    // Mock book statistics
    const mockBookStats = {
      item_id: parseInt(itemId),
      item_name: 'Introduction to Algorithms',
      description: 'Classic computer science textbook',
      owner_name: 'Alice Johnson',
      owner_email: 'alice@alustudent.com',
      total_requests: 5,
      pending_requests: 2,
      active_borrows: 1,
      completed_borrows: 2,
      late_returns: 0
    };

    res.json({
      success: true,
      data: mockBookStats
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

    // Mock requesters data
    const mockRequesters = [
      {
        transaction_id: 1,
        transaction_status: 'pending',
        start_date: null,
        expected_return_date: null,
        actual_return_date: null,
        request_date: '2025-11-20T06:04:19.290Z',
        user_id: 2,
        full_name: 'Bob Smith',
        email: 'bob@alustudent.com',
        phone_number: '+250787654321',
        department: 'Software Engineering',
        student_id: 'SE2024001',
        rating: 4.2
      }
    ];

    res.json({
      success: true,
      data: {
        itemId: parseInt(itemId),
        totalRequesters: 1,
        requesters: mockRequesters
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

    // Mock user activity data
    const mockUserActivity = {
      user_id: parseInt(userId),
      full_name: 'Alice Johnson',
      email: 'alice@alustudent.com',
      phone_number: '+250781234567',
      department: 'Computer Science',
      books_listed: 3,
      active_lendings: 1,
      active_borrowings: 0,
      completed_lendings: 2,
      completed_borrowings: 1
    };

    res.json({
      success: true,
      data: mockUserActivity
    });
  } catch (error) {
    logger.error('Error fetching user activity:', error);
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getAllBookRequests,
  getBookStatistics,
  getBookRequesters,
  getUserActivity,
  getAllUsers,
  getAllItems,
  getAllTransactions
};
