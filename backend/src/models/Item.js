const db = require('../config/database');

class Item {
  static async create(itemData, ownerId) {
    const {
      item_name, category, description, condition, sharing_type,
      location, isbn, author, publication_year, due_date
    } = itemData;

    const query = `
      INSERT INTO items (
        owner_id, item_name, category, description, condition, sharing_type,
        location, isbn, author, publication_year, due_date
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;

    const values = [
      ownerId, item_name, category, description, condition, sharing_type,
      location, isbn, author, publication_year, due_date
    ];

    const { rows } = await db.query(query, values);
    return rows[0];
  }

  static async findById(itemId) {
    const query = `
      SELECT 
        i.*,
        u.full_name as owner_name,
        u.email as owner_email,
        u.phone_number as owner_phone,
        u.rating as owner_rating,
        c.category_name
      FROM items i
      JOIN users u ON i.owner_id = u.user_id
      LEFT JOIN categories c ON i.category = c.category_id
      WHERE i.item_id = $1
    `;

    const { rows } = await db.query(query, [itemId]);
    return rows[0];
  }

  static async findByOwner(ownerId, page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    
    const query = `
      SELECT 
        i.*,
        c.category_name,
        COUNT(*) OVER() as total_count
      FROM items i
      LEFT JOIN categories c ON i.category = c.category_id
      WHERE i.owner_id = $1
      ORDER BY i.date_listed DESC
      LIMIT $2 OFFSET $3
    `;

    const { rows } = await db.query(query, [ownerId, limit, offset]);
    
    return {
      items: rows,
      totalCount: rows.length > 0 ? parseInt(rows[0].total_count) : 0,
      page,
      totalPages: rows.length > 0 ? Math.ceil(parseInt(rows[0].total_count) / limit) : 0
    };
  }

  static async search(filters = {}, page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    let whereClause = 'WHERE i.availability_status = $1';
    let values = ['available'];
    let paramCount = 2;

    // Build dynamic where clause
    if (filters.q) {
      whereClause += ` AND (i.item_name ILIKE $${paramCount} OR i.description ILIKE $${paramCount} OR i.author ILIKE $${paramCount})`;
      values.push(`%${filters.q}%`);
      paramCount++;
    }

    if (filters.category) {
      whereClause += ` AND i.category = $${paramCount}`;
      values.push(filters.category);
      paramCount++;
    }

    if (filters.condition) {
      whereClause += ` AND i.condition = $${paramCount}`;
      values.push(filters.condition);
      paramCount++;
    }

    if (filters.location) {
      whereClause += ` AND i.location ILIKE $${paramCount}`;
      values.push(`%${filters.location}%`);
      paramCount++;
    }

    if (filters.availability) {
      whereClause = whereClause.replace('i.availability_status = $1', 'i.availability_status = $1');
      values[0] = filters.availability;
    }

    const query = `
      SELECT 
        i.*,
        u.full_name as owner_name,
        u.rating as owner_rating,
        c.category_name,
        COUNT(*) OVER() as total_count
      FROM items i
      JOIN users u ON i.owner_id = u.user_id
      LEFT JOIN categories c ON i.category = c.category_id
      ${whereClause}
      ORDER BY i.date_listed DESC
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `;

    values.push(limit, offset);
    const { rows } = await db.query(query, values);

    return {
      items: rows,
      totalCount: rows.length > 0 ? parseInt(rows[0].total_count) : 0,
      page,
      totalPages: rows.length > 0 ? Math.ceil(parseInt(rows[0].total_count) / limit) : 0
    };
  }

  static async update(itemId, updateData, ownerId) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        fields.push(`${key} = $${paramCount}`);
        values.push(updateData[key]);
        paramCount++;
      }
    });

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    fields.push('date_updated = CURRENT_TIMESTAMP');
    values.push(itemId, ownerId);

    const query = `
      UPDATE items 
      SET ${fields.join(', ')}
      WHERE item_id = $${paramCount} AND owner_id = $${paramCount + 1}
      RETURNING *
    `;

    const { rows } = await db.query(query, values);
    return rows[0];
  }

  static async delete(itemId, ownerId) {
    const query = 'DELETE FROM items WHERE item_id = $1 AND owner_id = $2 RETURNING *';
    const { rows } = await db.query(query, [itemId, ownerId]);
    return rows[0];
  }

  static async updateAvailability(itemId, status) {
    const query = `
      UPDATE items 
      SET availability_status = $1, date_updated = CURRENT_TIMESTAMP
      WHERE item_id = $2
      RETURNING *
    `;
    const { rows } = await db.query(query, [status, itemId]);
    return rows[0];
  }

  static async getPopularItems(limit = 10) {
    const query = `
      SELECT 
        i.*,
        u.full_name as owner_name,
        u.rating as owner_rating,
        c.category_name,
        COUNT(t.transaction_id) as transaction_count
      FROM items i
      JOIN users u ON i.owner_id = u.user_id
      LEFT JOIN categories c ON i.category = c.category_id
      LEFT JOIN transactions t ON i.item_id = t.item_id
      WHERE i.availability_status = 'available'
      GROUP BY i.item_id, u.full_name, u.rating, c.category_name
      ORDER BY transaction_count DESC, i.date_listed DESC
      LIMIT $1
    `;

    const { rows } = await db.query(query, [limit]);
    return rows;
  }

  static async getRecentItems(limit = 10) {
    const query = `
      SELECT 
        i.*,
        u.full_name as owner_name,
        u.rating as owner_rating,
        c.category_name
      FROM items i
      JOIN users u ON i.owner_id = u.user_id
      LEFT JOIN categories c ON i.category = c.category_id
      WHERE i.availability_status = 'available'
      ORDER BY i.date_listed DESC
      LIMIT $1
    `;

    const { rows } = await db.query(query, [limit]);
    return rows;
  }
}

module.exports = Item;
