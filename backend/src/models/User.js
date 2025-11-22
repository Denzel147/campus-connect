const db = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  static async create(userData) {
    const { 
      full_name, 
      email, 
      password, 
      phone_number, 
      institution, 
      department, 
      student_id,
      major,
      year,
      campus,
      dorm,
      room_number,
      whatsapp_number,
      academic_interests,
      role,
      terms_agreed
    } = userData;
    
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Determine role based on email or provided role
    const userRole = email === 's.abijuru1@alustudent.com' ? 'admin' : (role || 'student');
    
    const query = `
      INSERT INTO users (
        full_name, email, password_hash, phone_number, institution, department, student_id,
        major, year, campus, dorm, room_number, whatsapp_number, academic_interests,
        role, terms_agreed, terms_agreed_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      RETURNING user_id, full_name, email, phone_number, institution, department, student_id, 
                major, year, campus, dorm, room_number, whatsapp_number, academic_interests,
                role, verification_status, rating, total_lends, total_borrows, account_status, 
                date_joined, terms_agreed, terms_agreed_at
    `;
    
    const values = [
      full_name, 
      email, 
      hashedPassword, 
      phone_number, 
      institution || 'African Leadership University', 
      department, 
      student_id,
      major,
      year,
      campus || 'Rwanda',
      dorm,
      room_number,
      whatsapp_number,
      academic_interests || [],
      userRole,
      terms_agreed || false,
      terms_agreed ? new Date() : null
    ];
    
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
             major, year, campus, dorm, room_number, whatsapp_number, academic_interests,
             role, profile_picture, verification_status, rating, total_lends, total_borrows,
             account_status, date_joined, last_login, terms_agreed, terms_agreed_at
      FROM users WHERE user_id = $1
    `;
    const { rows } = await db.query(query, [userId]);
    return rows[0];
  }

  static async updateProfile(userId, updateData) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    for (const [key, value] of Object.entries(updateData)) {
      if (value !== undefined) {
        fields.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    }

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
                major, year, campus, dorm, room_number, whatsapp_number, academic_interests,
                role, profile_picture, verification_status, rating, total_lends, total_borrows,
                account_status, date_joined, updated_at, terms_agreed, terms_agreed_at
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
        COUNT(DISTINCT CASE WHEN t.transaction_status = 'active' THEN t.transaction_id END) as active_transactions,
        COUNT(DISTINCT CASE WHEN t.transaction_status = 'completed' THEN t.transaction_id END) as completed_transactions,
        COUNT(DISTINCT CASE WHEN t.transaction_status = 'approved' THEN t.transaction_id END) as approved_transactions,
        COALESCE(SUM(CASE WHEN t.lender_id = u.user_id AND t.transaction_status = 'completed' AND i.sharing_type = 'sell' THEN 10 ELSE 0 END), 0) as total_earnings,
        COUNT(DISTINCT CASE WHEN t.lender_id = u.user_id AND t.transaction_status = 'completed' THEN t.transaction_id END) as items_lent,
        COUNT(DISTINCT CASE WHEN t.borrower_id = u.user_id AND t.transaction_status = 'completed' THEN t.transaction_id END) as items_borrowed
      FROM users u
      LEFT JOIN items i ON u.user_id = i.owner_id
      LEFT JOIN transactions t ON u.user_id = t.lender_id OR u.user_id = t.borrower_id
      WHERE u.user_id = $1
      GROUP BY u.user_id, u.full_name, u.rating, u.total_lends, u.total_borrows
    `;
    
    const { rows } = await db.query(query, [userId]);
    const baseStats = rows[0];
    
    // Calculate streak
    const streak = await this.calculateUserStreak(userId);
    
    return {
      ...baseStats,
      streak,
      itemsShared: Number.parseInt(baseStats.items_listed || 0),
      totalTransactions: Number.parseInt(baseStats.total_transactions || 0),
      completedTransactions: Number.parseInt(baseStats.completed_transactions || 0),
      totalEarnings: Number.parseFloat(baseStats.total_earnings || 0),
      activeRequests: Number.parseInt(baseStats.active_transactions || 0)
    };
  }

  static async calculateUserStreak(userId) {
    // Calculate streak based on consecutive days with activity
    const query = `
      WITH daily_activity AS (
        SELECT DISTINCT DATE(date_created) as activity_date
        FROM transactions 
        WHERE (lender_id = $1 OR borrower_id = $1)
        AND transaction_status IN ('approved', 'completed')
        UNION
        SELECT DISTINCT DATE(date_listed) as activity_date
        FROM items
        WHERE owner_id = $1
        ORDER BY activity_date DESC
      ),
      consecutive_days AS (
        SELECT 
          activity_date,
          ROW_NUMBER() OVER (ORDER BY activity_date DESC) as rn,
          activity_date - INTERVAL '1 day' * (ROW_NUMBER() OVER (ORDER BY activity_date DESC) - 1) as group_date
        FROM daily_activity
        WHERE activity_date >= CURRENT_DATE - INTERVAL '30 days'
      ),
      streak_groups AS (
        SELECT 
          group_date,
          COUNT(*) as streak_length,
          MIN(activity_date) as streak_start,
          MAX(activity_date) as streak_end
        FROM consecutive_days
        GROUP BY group_date
      )
      SELECT COALESCE(MAX(streak_length), 0) as current_streak
      FROM streak_groups
      WHERE streak_end >= CURRENT_DATE - INTERVAL '1 day'
    `;
    
    const { rows } = await db.query(query, [userId]);
    return Number.parseInt(rows[0]?.current_streak || 0);
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
