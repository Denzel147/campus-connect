const express = require('express');
const { validate, validateQuery } = require('../middleware/validation');
const { itemSchemas } = require('../utils/validation');
const {
  createItem,
  getItems,
  getItemById,
  getMyItems,
  updateItem,
  deleteItem,
  getPopularItems,
  getRecentItems,
  requestToBorrow
} = require('../controllers/itemController');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Item:
 *       type: object
 *       properties:
 *         item_id:
 *           type: integer
 *           description: Unique item identifier
 *         owner_id:
 *           type: integer
 *           description: Owner's user ID
 *         item_name:
 *           type: string
 *           description: Name of the item
 *         category:
 *           type: integer
 *           description: Category ID
 *         description:
 *           type: string
 *           description: Item description
 *         condition:
 *           type: string
 *           enum: [Like New, Good, Fair, Poor]
 *           description: Item condition
 *         availability_status:
 *           type: string
 *           enum: [available, borrowed, unavailable]
 *           description: Availability status
 *         sharing_type:
 *           type: string
 *           enum: [lend, sell, exchange]
 *           description: Type of sharing
 *         location:
 *           type: string
 *           description: Item location
 *         isbn:
 *           type: string
 *           description: Book ISBN
 *         author:
 *           type: string
 *           description: Book author
 *         publication_year:
 *           type: integer
 *           description: Publication year
 *         due_date:
 *           type: string
 *           format: date
 *           description: Due date for return
 *         date_listed:
 *           type: string
 *           format: date-time
 *           description: Date item was listed
 */

/**
 * @swagger
 * /api/items:
 *   post:
 *     summary: Create a new item
 *     tags: [Items]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - item_name
 *               - category
 *               - condition
 *               - sharing_type
 *             properties:
 *               item_name:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 200
 *               category:
 *                 type: integer
 *                 minimum: 1
 *               description:
 *                 type: string
 *                 maxLength: 1000
 *               condition:
 *                 type: string
 *                 enum: [Like New, Good, Fair, Poor]
 *               sharing_type:
 *                 type: string
 *                 enum: [lend, sell, exchange]
 *               location:
 *                 type: string
 *                 maxLength: 100
 *               isbn:
 *                 type: string
 *                 maxLength: 20
 *               author:
 *                 type: string
 *                 maxLength: 100
 *               publication_year:
 *                 type: integer
 *               due_date:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Item created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post('/', authenticateToken, validate(itemSchemas.create), createItem);

/**
 * @swagger
 * /api/items:
 *   get:
 *     summary: Get items with search and filtering
 *     tags: [Items]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search query
 *       - in: query
 *         name: category
 *         schema:
 *           type: integer
 *         description: Category ID
 *       - in: query
 *         name: condition
 *         schema:
 *           type: string
 *           enum: [Like New, Good, Fair, Poor]
 *         description: Item condition
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: Location filter
 *       - in: query
 *         name: availability
 *         schema:
 *           type: string
 *           enum: [available, borrowed, unavailable]
 *         description: Availability status
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *         description: Items per page
 *     responses:
 *       200:
 *         description: Items retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     items:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Item'
 *                     totalCount:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 */
router.get('/', validateQuery(itemSchemas.search), optionalAuth, getItems);

/**
 * @swagger
 * /api/items/my:
 *   get:
 *     summary: Get current user's items
 *     tags: [Items]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *     responses:
 *       200:
 *         description: User's items retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/my', authenticateToken, getMyItems);

/**
 * @swagger
 * /api/items/popular:
 *   get:
 *     summary: Get popular items
 *     tags: [Items]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *     responses:
 *       200:
 *         description: Popular items retrieved successfully
 */
router.get('/popular', getPopularItems);

/**
 * @swagger
 * /api/items/recent:
 *   get:
 *     summary: Get recently listed items
 *     tags: [Items]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *     responses:
 *       200:
 *         description: Recent items retrieved successfully
 */
router.get('/recent', getRecentItems);

/**
 * @swagger
 * /api/items/{id}:
 *   get:
 *     summary: Get item by ID
 *     tags: [Items]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Item ID
 *     responses:
 *       200:
 *         description: Item retrieved successfully
 *       404:
 *         description: Item not found
 */
router.get('/:id', getItemById);

/**
 * @swagger
 * /api/items/{id}:
 *   put:
 *     summary: Update item
 *     tags: [Items]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Item ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               item_name:
 *                 type: string
 *               category:
 *                 type: integer
 *               description:
 *                 type: string
 *               condition:
 *                 type: string
 *                 enum: [Like New, Good, Fair, Poor]
 *               availability_status:
 *                 type: string
 *                 enum: [available, borrowed, unavailable]
 *               location:
 *                 type: string
 *               isbn:
 *                 type: string
 *               author:
 *                 type: string
 *               publication_year:
 *                 type: integer
 *               due_date:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Item updated successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Item not found
 */
router.put('/:id', authenticateToken, validate(itemSchemas.update), updateItem);

/**
 * @swagger
 * /api/items/{id}:
 *   delete:
 *     summary: Delete item
 *     tags: [Items]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Item ID
 *     responses:
 *       200:
 *         description: Item deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Item not found
 */
router.delete('/:id', authenticateToken, deleteItem);

/**
 * @swagger
 * /api/items/{id}/request:
 *   post:
 *     summary: Request to borrow an item
 *     tags: [Items]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Item ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notes:
 *                 type: string
 *                 maxLength: 500
 *               due_date:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Borrow request sent successfully
 *       400:
 *         description: Item not available or invalid request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Item not found
 */
router.post('/:id/request', authenticateToken, requestToBorrow);

module.exports = router;
