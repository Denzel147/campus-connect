const Category = require('../models/Category');
const logger = require('../config/logger');

const createCategory = async (req, res, next) => {
  try {
    const category = await Category.create(req.body);

    logger.info(`New category created: ${category.category_name}`);

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: { category }
    });
  } catch (error) {
    logger.error('Create category error:', error);
    next(error);
  }
};

const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.findAll();

    res.json({
      success: true,
      data: { categories }
    });
  } catch (error) {
    logger.error('Get categories error:', error);
    next(error);
  }
};

const getCategoryById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.json({
      success: true,
      data: { category }
    });
  } catch (error) {
    logger.error('Get category by ID error:', error);
    next(error);
  }
};

const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const category = await Category.update(id, req.body);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    logger.info(`Category updated: ${category.category_name}`);

    res.json({
      success: true,
      message: 'Category updated successfully',
      data: { category }
    });
  } catch (error) {
    logger.error('Update category error:', error);
    next(error);
  }
};

const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const category = await Category.delete(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    logger.info(`Category deleted: ${category.category_name}`);

    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    logger.error('Delete category error:', error);
    
    if (error.message === 'Cannot delete category with existing items') {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    
    next(error);
  }
};

const getPopularCategories = async (req, res, next) => {
  try {
    const { limit = 5 } = req.query;
    const categories = await Category.getPopularCategories(parseInt(limit));

    res.json({
      success: true,
      data: { categories }
    });
  } catch (error) {
    logger.error('Get popular categories error:', error);
    next(error);
  }
};

module.exports = {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  getPopularCategories
};
