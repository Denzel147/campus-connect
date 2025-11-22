const db = require('../config/database');
const logger = require('../config/logger');

/**
 * Get admin dashboard statistics
 */
const getDashboardStats = async (req, res, next) => {
  try {
    // Return mock data for now to test frontend integration
    const mockStats = {
      transactions: {
        total: 150,
        pending: 25,
        active: 40,
        approved: 30,
        completed: 35,
        cancelled: 10,
        rejected: 10
      },
      items: {
        total: 75,
        available: 45,
        borrowed: 20,
        reserved: 5,
        unavailable: 5
      },
      users: {
        total: 200,
        active: 180,
        inactive: 20,
        verified: 150,
        unverified: 50
      },
      recentActivity: [
        {
          activity_type: 'transaction',
          id: 1,
          status: 'pending',
          timestamp: new Date(),
          item_name: 'Introduction to Algorithms',
          user_name: 'John Doe'
        },
        {
          activity_type: 'transaction', 
          id: 2,
          status: 'completed',
          timestamp: new Date(),
          item_name: 'Data Structures',
          user_name: 'Jane Smith'
        }
      ]
    };

    res.json({
      success: true,
      data: mockStats
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

    // Mock user data
    const mockUsers = [
      {
        user_id: 1,
        full_name: 'Alice Johnson',
        email: 'alice@alustudent.com',
        phone_number: '+250781234567',
        institution: 'African Leadership University',
        department: 'Computer Science',
        student_id: 'CS2024001',
        verification_status: false,
        account_status: 'active',
        rating: 4.5,
        total_lends: 5,
        total_borrows: 3,
        date_joined: '2025-11-15T06:04:19.290Z',
        last_login: new Date()
      }
    ];

    res.json({
      success: true,
      data: {
        users: mockUsers,
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalCount: 1,
          limit: 20
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

    // Mock item data
    const mockItems = [
      {
        item_id: 1,
        item_name: 'Introduction to Algorithms',
        description: 'Classic computer science textbook',
        category: 'Computer Science',
        condition: 'good',
        availability_status: 'available',
        owner_name: 'Alice Johnson',
        owner_email: 'alice@alustudent.com',
        total_requests: 5,
        date_listed: '2025-11-15T06:04:19.290Z'
      }
    ];

    res.json({
      success: true,
      data: {
        items: mockItems,
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalCount: 1,
          limit: 20
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
