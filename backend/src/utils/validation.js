const Joi = require('joi');

const userSchemas = {
  register: Joi.object({
    full_name: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(100).required(),
    phone_number: Joi.string().pattern(/^[+]?[1-9][\d]{0,15}$/).optional(),
    institution: Joi.string().max(100).optional(),
    department: Joi.string().max(100).optional(),
    student_id: Joi.string().max(50).optional()
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),

  updateProfile: Joi.object({
    full_name: Joi.string().min(2).max(100).optional(),
    phone_number: Joi.string().pattern(/^[+]?[1-9][\d]{0,15}$/).optional(),
    institution: Joi.string().max(100).optional(),
    department: Joi.string().max(100).optional(),
    student_id: Joi.string().max(50).optional()
  }),

  changePassword: Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().min(6).max(100).required()
  })
};

const itemSchemas = {
  create: Joi.object({
    item_name: Joi.string().min(1).max(200).required(),
    category: Joi.number().integer().positive().required(),
    description: Joi.string().max(1000).optional(),
    condition: Joi.string().valid('Like New', 'Good', 'Fair', 'Poor').required(),
    sharing_type: Joi.string().valid('lend', 'sell', 'exchange').required(),
    location: Joi.string().max(100).optional(),
    isbn: Joi.string().max(20).optional(),
    author: Joi.string().max(100).optional(),
    publication_year: Joi.number().integer().min(1900).max(new Date().getFullYear()).optional(),
    due_date: Joi.date().greater('now').optional()
  }),

  update: Joi.object({
    item_name: Joi.string().min(1).max(200).optional(),
    category: Joi.number().integer().positive().optional(),
    description: Joi.string().max(1000).optional(),
    condition: Joi.string().valid('Like New', 'Good', 'Fair', 'Poor').optional(),
    availability_status: Joi.string().valid('available', 'borrowed', 'unavailable').optional(),
    location: Joi.string().max(100).optional(),
    isbn: Joi.string().max(20).optional(),
    author: Joi.string().max(100).optional(),
    publication_year: Joi.number().integer().min(1900).max(new Date().getFullYear()).optional(),
    due_date: Joi.date().greater('now').optional().allow(null)
  }),

  search: Joi.object({
    q: Joi.string().max(200).optional(),
    category: Joi.number().integer().positive().optional(),
    condition: Joi.string().valid('Like New', 'Good', 'Fair', 'Poor').optional(),
    location: Joi.string().max(100).optional(),
    availability: Joi.string().valid('available', 'borrowed', 'unavailable').optional(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(50).default(10)
  })
};

const transactionSchemas = {
  create: Joi.object({
    item_id: Joi.number().integer().positive().required(),
    transaction_type: Joi.string().valid('borrow', 'lend').required(),
    borrow_date: Joi.date().optional(),
    due_date: Joi.date().greater('now').optional(),
    notes: Joi.string().max(500).optional()
  }),

  update: Joi.object({
    transaction_status: Joi.string().valid('pending', 'approved', 'rejected', 'active', 'completed', 'cancelled').optional(),
    return_date: Joi.date().optional(),
    notes: Joi.string().max(500).optional()
  })
};

const reviewSchemas = {
  create: Joi.object({
    transaction_id: Joi.number().integer().positive().required(),
    rating: Joi.number().integer().min(1).max(5).required(),
    comment: Joi.string().max(500).optional(),
    review_type: Joi.string().valid('lender', 'borrower').required()
  })
};

const categorySchemas = {
  create: Joi.object({
    category_name: Joi.string().min(1).max(50).required(),
    description: Joi.string().max(200).optional(),
    icon: Joi.string().max(50).optional()
  }),

  update: Joi.object({
    category_name: Joi.string().min(1).max(50).optional(),
    description: Joi.string().max(200).optional(),
    icon: Joi.string().max(50).optional(),
    is_active: Joi.boolean().optional()
  })
};

const notificationSchemas = {
  markAsRead: Joi.object({
    notification_ids: Joi.array().items(Joi.number().integer().positive()).min(1).required()
  })
};

module.exports = {
  userSchemas,
  itemSchemas,
  transactionSchemas,
  reviewSchemas,
  categorySchemas,
  notificationSchemas
};
