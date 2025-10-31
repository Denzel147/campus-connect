const db = require('../config/database');

class Category {
  static async create(categoryData) {
    const { category_name, description, icon } = categoryData;

    const query = `
      INSERT INTO categories (category_name, description, icon)
      VALUES ($1, $2, $3)
      RETURNING *
    `;

    const values = [category_name, description, icon];
    const { rows } = await db.query(query, values);
    return rows[0];
  }

  static async findAll() {
    const query = `
      SELECT 
        c.*,
        COUNT(i.item_id) as item_count
      FROM categories c
      LEFT JOIN items i ON c.category_id = i.category AND i.availability_status = 'available'
      WHERE c.is_active = TRUE
      GROUP BY c.category_id
      ORDER BY c.category_name ASC
    `;

    const { rows } = await db.query(query);
    return rows;
  }

  static async findById(categoryId) {
    const query = 'SELECT * FROM categories WHERE category_id = $1';
    const { rows } = await db.query(query, [categoryId]);
    return rows[0];
  }

  static async update(categoryId, updateData) {
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

    values.push(categoryId);

    const query = `
      UPDATE categories 
      SET ${fields.join(', ')}
      WHERE category_id = $${paramCount}
      RETURNING *
    `;

    const { rows } = await db.query(query, values);
    return rows[0];
  }

  static async delete(categoryId) {
    // First check if category has items
    const itemCheck = await db.query(
      'SELECT COUNT(*) as count FROM items WHERE category = $1',
      [categoryId]
    );

    if (parseInt(itemCheck.rows[0].count) > 0) {
      throw new Error('Cannot delete category with existing items');
    }

    const query = 'DELETE FROM categories WHERE category_id = $1 RETURNING *';
    const { rows } = await db.query(query, [categoryId]);
    return rows[0];
  }

  static async getPopularCategories(limit = 5) {
    const query = `
      SELECT 
        c.*,
        COUNT(i.item_id) as item_count
      FROM categories c
      LEFT JOIN items i ON c.category_id = i.category
      WHERE c.is_active = TRUE
      GROUP BY c.category_id
      ORDER BY item_count DESC, c.category_name ASC
      LIMIT $1
    `;

    const { rows } = await db.query(query, [limit]);
    return rows;
  }
}

module.exports = Category;
