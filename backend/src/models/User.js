const db = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  static async create(userData) {
    const { full_name, email, password, phone_number, institution, department, student_id } = userData;
    
    const hashedPassword = await bcrypt.hash(password, 12);
    
    const query = `
      INSERT INTO users (full_name, email, password_hash, phone_number, institution, department, student_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING user_id, full_name, email, phone_number, institution, department, student_id, 
                verification_status, rating, total_lends, total_borrows, account_status, date_joined
    `;
    
    const values = [full_name, email, hashedPassword, phone_number, institution, department, student_id];
    const { rows } = await db.query(query, values);
    
    return rows[0];
  }

  static async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = $1';
    const { rows } = await db.query(query, [email]);
    return rows[0];
  }

  static async findById(userId) {
    const query = `
      SELECT user_id, full_name, email, phone_number, institution, department, student_id,
             profile_picture, verification_status, rating, total_lends, total_borrows,
             account_status, date_joined, last_login
      FROM users WHERE user_id = $1
    `;
    const { rows } = await db.query(query, [userId]);
    return rows[0];
  }

  static async updateProfile(userId, updateData) {
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

    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(userId);

    const query = `
      UPDATE users 
      SET ${fields.join(', ')}
      WHERE user_id = $${paramCount}
      RETURNING user_id, full_name, email, phone_number, institution, department, student_id,
                profile_picture, verification_status, rating, total_lends, total_borrows,
                account_status, date_joined, updated_at
    `;

    const { rows } = await db.query(query, values);
    return rows[0];
  }

  static async changePassword(userId, currentPassword, newPassword) {
    // First verify current password
    const user = await db.query('SELECT password_hash FROM users WHERE user_id = $1', [userId]);
    if (user.rows.length === 0) {
      throw new Error('User not found');
    }

    const isValidPassword = await bcrypt.compare(currentPassword, user.rows[0].password_hash);
    if (!isValidPassword) {
      throw new Error('Current password is incorrect');
    }

    // Hash new password and update
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);
    const query = `
      UPDATE users 
      SET password_hash = $1, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $2
    `;

    await db.query(query, [hashedNewPassword, userId]);
    return true;
  }

  static async updateLastLogin(userId) {
    const query = 'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE user_id = $1';
    await db.query(query, [userId]);
  }

  static async updateRating(userId) {
    const query = `
      UPDATE users 
      SET rating = (
        SELECT COALESCE(AVG(rating)::DECIMAL(3,2), 0.00)
        FROM reviews 
        WHERE reviewee_id = $1
      )
      WHERE user_id = $1
    `;
    await db.query(query, [userId]);
  }

  static async getUserStats(userId) {
    const query = `
      SELECT 
        u.user_id,
        u.full_name,
        u.rating,
        u.total_lends,
        u.total_borrows,
        COUNT(DISTINCT i.item_id) as items_listed,
        COUNT(DISTINCT CASE WHEN i.availability_status = 'available' THEN i.item_id END) as available_items,
        COUNT(DISTINCT t.transaction_id) as total_transactions,
        COUNT(DISTINCT CASE WHEN t.transaction_status = 'active' THEN t.transaction_id END) as active_transactions
      FROM users u
      LEFT JOIN items i ON u.user_id = i.owner_id
      LEFT JOIN transactions t ON u.user_id = t.lender_id OR u.user_id = t.borrower_id
      WHERE u.user_id = $1
      GROUP BY u.user_id, u.full_name, u.rating, u.total_lends, u.total_borrows
    `;
    
    const { rows } = await db.query(query, [userId]);
    return rows[0];
  }

  static async verifyPassword(email, password) {
    const user = await this.findByEmail(email);
    if (!user) {
      return null;
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return null;
    }

    return user;
  }
}

module.exports = User;
