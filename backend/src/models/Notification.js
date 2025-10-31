const db = require('../config/database');

class Notification {
  static async create(notificationData) {
    const {
      user_id, notification_type, message, related_item_id,
      related_transaction_id, priority = 'normal'
    } = notificationData;

    const query = `
      INSERT INTO notifications (
        user_id, notification_type, message, related_item_id,
        related_transaction_id, priority
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const values = [user_id, notification_type, message, related_item_id, related_transaction_id, priority];
    const { rows } = await db.query(query, values);
    return rows[0];
  }

  static async findByUser(userId, page = 1, limit = 20) {
    const offset = (page - 1) * limit;

    const query = `
      SELECT 
        n.*,
        i.item_name,
        COUNT(*) OVER() as total_count
      FROM notifications n
      LEFT JOIN items i ON n.related_item_id = i.item_id
      WHERE n.user_id = $1
      ORDER BY n.date_created DESC
      LIMIT $2 OFFSET $3
    `;

    const { rows } = await db.query(query, [userId, limit, offset]);

    return {
      notifications: rows,
      totalCount: rows.length > 0 ? parseInt(rows[0].total_count) : 0,
      page,
      totalPages: rows.length > 0 ? Math.ceil(parseInt(rows[0].total_count) / limit) : 0
    };
  }

  static async markAsRead(notificationIds, userId) {
    const query = `
      UPDATE notifications 
      SET is_read = TRUE, date_read = CURRENT_TIMESTAMP
      WHERE notification_id = ANY($1) AND user_id = $2
      RETURNING *
    `;

    const { rows } = await db.query(query, [notificationIds, userId]);
    return rows;
  }

  static async markAllAsRead(userId) {
    const query = `
      UPDATE notifications 
      SET is_read = TRUE, date_read = CURRENT_TIMESTAMP
      WHERE user_id = $1 AND is_read = FALSE
      RETURNING *
    `;

    const { rows } = await db.query(query, [userId]);
    return rows;
  }

  static async getUnreadCount(userId) {
    const query = 'SELECT COUNT(*) as count FROM notifications WHERE user_id = $1 AND is_read = FALSE';
    const { rows } = await db.query(query, [userId]);
    return parseInt(rows[0].count);
  }

  static async delete(notificationId, userId) {
    const query = 'DELETE FROM notifications WHERE notification_id = $1 AND user_id = $2 RETURNING *';
    const { rows } = await db.query(query, [notificationId, userId]);
    return rows[0];
  }

  static async deleteOld(daysOld = 30) {
    const query = `
      DELETE FROM notifications 
      WHERE date_created < CURRENT_TIMESTAMP - INTERVAL '${daysOld} days'
      RETURNING COUNT(*)
    `;

    const { rows } = await db.query(query);
    return rows[0];
  }

  // Helper methods for creating specific notification types
  static async createBorrowRequest(itemId, borrowerId, lenderId) {
    const { rows } = await db.query(
      'SELECT item_name FROM items WHERE item_id = $1',
      [itemId]
    );
    const itemName = rows[0]?.item_name || 'Unknown Item';

    const { rows: borrowerRows } = await db.query(
      'SELECT full_name FROM users WHERE user_id = $1',
      [borrowerId]
    );
    const borrowerName = borrowerRows[0]?.full_name || 'Unknown User';

    return this.create({
      user_id: lenderId,
      notification_type: 'borrow_request',
      message: `${borrowerName} wants to borrow your book "${itemName}"`,
      related_item_id: itemId,
      priority: 'high'
    });
  }

  static async createRequestApproved(itemId, transactionId, borrowerId) {
    const { rows } = await db.query(
      'SELECT item_name FROM items WHERE item_id = $1',
      [itemId]
    );
    const itemName = rows[0]?.item_name || 'Unknown Item';

    return this.create({
      user_id: borrowerId,
      notification_type: 'request_approved',
      message: `Your request to borrow "${itemName}" has been approved!`,
      related_item_id: itemId,
      related_transaction_id: transactionId,
      priority: 'high'
    });
  }

  static async createDueReminder(transactionId, borrowerId) {
    const { rows } = await db.query(`
      SELECT i.item_name, t.due_date
      FROM transactions t
      JOIN items i ON t.item_id = i.item_id
      WHERE t.transaction_id = $1
    `, [transactionId]);

    const { item_name, due_date } = rows[0] || {};

    return this.create({
      user_id: borrowerId,
      notification_type: 'due_reminder',
      message: `Reminder: "${item_name}" is due on ${due_date}`,
      related_transaction_id: transactionId,
      priority: 'medium'
    });
  }

  static async createOverdueNotification(transactionId, borrowerId) {
    const { rows } = await db.query(`
      SELECT i.item_name, t.due_date
      FROM transactions t
      JOIN items i ON t.item_id = i.item_id
      WHERE t.transaction_id = $1
    `, [transactionId]);

    const { item_name, due_date } = rows[0] || {};

    return this.create({
      user_id: borrowerId,
      notification_type: 'overdue',
      message: `"${item_name}" was due on ${due_date}. Please return it as soon as possible.`,
      related_transaction_id: transactionId,
      priority: 'high'
    });
  }
}

module.exports = Notification;
