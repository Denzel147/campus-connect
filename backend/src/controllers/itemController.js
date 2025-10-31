const Item = require('../models/Item');
const Notification = require('../models/Notification');
const logger = require('../config/logger');

const createItem = async (req, res, next) => {
  try {
    const item = await Item.create(req.body, req.user.userId);

    logger.info(`New item created: ${item.item_name} by user ${req.user.userId}`);

    res.status(201).json({
      success: true,
      message: 'Item created successfully',
      data: { item }
    });
  } catch (error) {
    logger.error('Create item error:', error);
    next(error);
  }
};

const getItems = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, ...filters } = req.query;
    const result = await Item.search(filters, parseInt(page), parseInt(limit));

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('Get items error:', error);
    next(error);
  }
};

const getItemById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const item = await Item.findById(id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    res.json({
      success: true,
      data: { item }
    });
  } catch (error) {
    logger.error('Get item by ID error:', error);
    next(error);
  }
};

const getMyItems = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const result = await Item.findByOwner(req.user.userId, parseInt(page), parseInt(limit));

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('Get my items error:', error);
    next(error);
  }
};

const updateItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const item = await Item.update(id, req.body, req.user.userId);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found or you do not have permission to update it'
      });
    }

    logger.info(`Item updated: ${item.item_name} by user ${req.user.userId}`);

    res.json({
      success: true,
      message: 'Item updated successfully',
      data: { item }
    });
  } catch (error) {
    logger.error('Update item error:', error);
    next(error);
  }
};

const deleteItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const item = await Item.delete(id, req.user.userId);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found or you do not have permission to delete it'
      });
    }

    logger.info(`Item deleted: ${item.item_name} by user ${req.user.userId}`);

    res.json({
      success: true,
      message: 'Item deleted successfully'
    });
  } catch (error) {
    logger.error('Delete item error:', error);
    next(error);
  }
};

const getPopularItems = async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;
    const items = await Item.getPopularItems(parseInt(limit));

    res.json({
      success: true,
      data: { items }
    });
  } catch (error) {
    logger.error('Get popular items error:', error);
    next(error);
  }
};

const getRecentItems = async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;
    const items = await Item.getRecentItems(parseInt(limit));

    res.json({
      success: true,
      data: { items }
    });
  } catch (error) {
    logger.error('Get recent items error:', error);
    next(error);
  }
};

const requestToBorrow = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Get item details
    const item = await Item.findById(id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    // Check if item is available
    if (item.availability_status !== 'available') {
      return res.status(400).json({
        success: false,
        message: 'Item is not available for borrowing'
      });
    }

    // Check if user is trying to borrow their own item
    if (item.owner_id === req.user.userId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot borrow your own item'
      });
    }

    // Create notification for the lender
    await Notification.createBorrowRequest(
      parseInt(id),
      req.user.userId,
      item.owner_id
    );

    logger.info(`Borrow request created for item ${id} by user ${req.user.userId}`);

    res.json({
      success: true,
      message: 'Borrow request sent successfully'
    });
  } catch (error) {
    logger.error('Request to borrow error:', error);
    next(error);
  }
};

module.exports = {
  createItem,
  getItems,
  getItemById,
  getMyItems,
  updateItem,
  deleteItem,
  getPopularItems,
  getRecentItems,
  requestToBorrow
};
