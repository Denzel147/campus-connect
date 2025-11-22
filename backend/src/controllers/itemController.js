const Item = require('../models/Item');
const Notification = require('../models/Notification');
const logger = require('../config/logger');
const { generateImageSizes } = require('../utils/imageGenerator');
const webSocketService = require('../utils/webSocketService');

const createItem = async (req, res, next) => {
  try {
    // Add images from uploaded files if any
    const images = req.processedImages || [];
    const itemData = {
      ...req.body,
      images: images.map(img => img.paths)
    };

    const item = await Item.create(itemData, req.user.userId);

    logger.info(`New item created: ${item.item_name} by user ${req.user.userId}`);

    // Send real-time notification to interested users (same campus/category)
    webSocketService.sendNotification(req.user.userId, {
      type: 'item_created',
      message: `Your item "${item.item_name}" has been listed successfully!`,
      priority: 'normal'
    });

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
    const result = await Item.search(filters, Number.parseInt(page), Number.parseInt(limit));

    // Add images to items
    if (result.items) {
      result.items = result.items.map(item => ({
        ...item,
        image: generateImageSizes(item.item_name, item.category, item.condition)
      }));
    }

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

    // Add image to item
    const itemWithImage = {
      ...item,
      image: generateImageSizes(item.item_name, item.category, item.condition)
    };

    res.json({
      success: true,
      data: { item: itemWithImage }
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

    // Add images to items
    if (result.items) {
      result.items = result.items.map(item => ({
        ...item,
        image: generateImageSizes(item.item_name, item.category, item.condition)
      }));
    }

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

    // Check if user already has a pending request for this item
    const Transaction = require('../models/Transaction');
    const existingRequest = await Transaction.findByItemAndBorrower(
      parseInt(id),
      req.user.userId
    );

    if (existingRequest && existingRequest.transaction_status === 'pending') {
      return res.status(400).json({
        success: false,
        message: 'You already have a pending request for this item'
      });
    }

    // Create transaction record
    const transaction = await Transaction.create({
      item_id: parseInt(id),
      lender_id: item.owner_id,
      borrower_id: req.user.userId,
      transaction_type: 'borrow',
      transaction_status: 'pending'
    });

    // Create notification for the lender
    await Notification.createBorrowRequest(
      parseInt(id),
      req.user.userId,
      item.owner_id
    );

    logger.info(`Borrow request created for item ${id} by user ${req.user.userId}`);

    res.json({
      success: true,
      message: 'Borrow request sent successfully',
      data: { transaction }
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
