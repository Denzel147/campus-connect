const db = require('../config/database');

class Transaction {
  static async create(transactionData) {
    const {
      item_id, lender_id, borrower_id, 
      borrow_date, due_date, notes, transaction_status = 'pending', transaction_type = 'borrow'
    } = transactionData;

    const query = `
      INSERT INTO transactions (
        item_id, lender_id, borrower_id,
        borrow_date, due_date, notes, transaction_status, transaction_type
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;

    const values = [item_id, lender_id, borrower_id, borrow_date, due_date, notes, transaction_status, transaction_type];
    const { rows } = await db.query(query, values);
    return rows[0];
  }

  static async findById(transactionId) {
    const query = `
      SELECT 
        t.*,
        i.item_name,
        i.condition as item_condition,
        lender.full_name as lender_name,
        lender.email as lender_email,
        lender.phone_number as lender_phone,
        borrower.full_name as borrower_name,
        borrower.email as borrower_email,
        borrower.phone_number as borrower_phone
      FROM transactions t
      JOIN items i ON t.item_id = i.item_id
      JOIN users lender ON t.lender_id = lender.user_id
      JOIN users borrower ON t.borrower_id = borrower.user_id
      WHERE t.transaction_id = $1
    `;

    const { rows } = await db.query(query, [transactionId]);
    return rows[0];
  }

  static async findByUser(userId, role = 'all', page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    let whereClause = '';

    if (role === 'lender') {
      whereClause = 'WHERE t.lender_id = $1';
    } else if (role === 'borrower') {
      whereClause = 'WHERE t.borrower_id = $1';
    } else {
      whereClause = 'WHERE (t.lender_id = $1 OR t.borrower_id = $1)';
    }

    const query = `
      SELECT 
        t.*,
        i.item_name,
        i.condition as item_condition,
        lender.full_name as lender_name,
        borrower.full_name as borrower_name,
        COUNT(*) OVER() as total_count
      FROM transactions t
      JOIN items i ON t.item_id = i.item_id
      JOIN users lender ON t.lender_id = lender.user_id
      JOIN users borrower ON t.borrower_id = borrower.user_id
      ${whereClause}
      ORDER BY t.date_created DESC
      LIMIT $2 OFFSET $3
    `;

    const { rows } = await db.query(query, [userId, limit, offset]);

    return {
      transactions: rows,
      totalCount: rows.length > 0 ? Number.parseInt(rows[0].total_count) : 0,
      page,
      totalPages: rows.length > 0 ? Math.ceil(Number.parseInt(rows[0].total_count) / limit) : 0
    };
  }

  static async updateStatus(transactionId, status, userId, notes = null) {
    let query = `
      UPDATE transactions 
      SET transaction_status = $1
    `;
    let values = [status];
    let paramCount = 2;

    if (notes) {
      query += `, notes = $${paramCount}`;
      values.push(notes);
      paramCount++;
    }

    if (status === 'completed') {
      query += ', return_date = CURRENT_TIMESTAMP, date_completed = CURRENT_TIMESTAMP';
    }

    query += ` WHERE transaction_id = $${paramCount} AND (lender_id = $${paramCount + 1} OR borrower_id = $${paramCount + 1}) RETURNING *`;
    values.push(transactionId, userId);

    const { rows } = await db.query(query, values);
    return rows[0];
  }

  static async markAsReturned(transactionId, userId) {
    const query = `
      UPDATE transactions 
      SET 
        transaction_status = 'completed',
        return_date = CURRENT_TIMESTAMP,
        date_completed = CURRENT_TIMESTAMP,
        late_return = CASE 
          WHEN due_date < CURRENT_DATE THEN TRUE 
          ELSE FALSE 
        END,
        days_overdue = CASE 
          WHEN due_date < CURRENT_DATE THEN CURRENT_DATE - due_date 
          ELSE 0 
        END
      WHERE transaction_id = $1 AND (lender_id = $2 OR borrower_id = $2)
      RETURNING *
    `;

    const { rows } = await db.query(query, [transactionId, userId]);
    return rows[0];
  }

  static async getActiveTransactions(userId) {
    const query = `
      SELECT 
        t.*,
        i.item_name,
        i.condition as item_condition,
        CASE WHEN t.lender_id = $1 THEN borrower.full_name ELSE lender.full_name END as other_party_name,
        CASE WHEN t.lender_id = $1 THEN 'lending' ELSE 'borrowing' END as user_role
      FROM transactions t
      JOIN items i ON t.item_id = i.item_id
      JOIN users lender ON t.lender_id = lender.user_id
      JOIN users borrower ON t.borrower_id = borrower.user_id
      WHERE (t.lender_id = $1 OR t.borrower_id = $1) 
        AND t.transaction_status IN ('pending', 'approved', 'active')
      ORDER BY t.date_created DESC
    `;

    const { rows } = await db.query(query, [userId]);
    return rows;
  }

  static async getOverdueTransactions() {
    const query = `
      SELECT 
        t.*,
        i.item_name,
        lender.full_name as lender_name,
        lender.email as lender_email,
        borrower.full_name as borrower_name,
        borrower.email as borrower_email
      FROM transactions t
      JOIN items i ON t.item_id = i.item_id
      JOIN users lender ON t.lender_id = lender.user_id
      JOIN users borrower ON t.borrower_id = borrower.user_id
      WHERE t.transaction_status = 'active' 
        AND t.due_date < CURRENT_DATE
      ORDER BY t.due_date ASC
    `;

    const { rows } = await db.query(query);
    return rows;
  }

  static async getTransactionStats() {
    const query = `
      SELECT 
        COUNT(*) as total_transactions,
        COUNT(CASE WHEN transaction_status = 'active' THEN 1 END) as active_transactions,
        COUNT(CASE WHEN transaction_status = 'completed' THEN 1 END) as completed_transactions,
        COUNT(CASE WHEN transaction_status = 'pending' THEN 1 END) as pending_transactions,
        COUNT(CASE WHEN late_return = TRUE THEN 1 END) as late_returns,
        AVG(CASE WHEN transaction_status = 'completed' THEN days_overdue END) as avg_overdue_days
      FROM transactions
    `;

    const { rows } = await db.query(query);
    return rows[0];
  }

  static async findByItemAndBorrower(itemId, borrowerId) {
    const query = `
      SELECT * FROM transactions
      WHERE item_id = $1 AND borrower_id = $2
      ORDER BY date_created DESC
      LIMIT 1
    `;

    const { rows } = await db.query(query, [itemId, borrowerId]);
    return rows[0];
  }

  // Get requests received by a user (as lender/owner) - ALL statuses
  static async getReceivedRequests(userId) {
    const query = `
      SELECT 
        t.*,
        i.item_name,
        i.condition,
        i.description,
        i.sharing_type,
        borrower.full_name as borrower_name,
        borrower.full_name as requester_name,
        borrower.email as borrower_email,
        borrower.phone_number as borrower_phone,
        borrower.institution as campus,
        borrower.department as dorm
      FROM transactions t
      JOIN items i ON t.item_id = i.item_id
      JOIN users borrower ON t.borrower_id = borrower.user_id
      WHERE t.lender_id = $1
      ORDER BY t.date_created DESC
    `;

    const { rows } = await db.query(query, [userId]);
    return rows;
  }

  // Create payment record
  static async createPayment(transactionId, paymentMethod, amount) {
    const query = `
      UPDATE transactions 
      SET payment_method = $1, payment_amount = $2, payment_status = 'pending'
      WHERE transaction_id = $3
      RETURNING *
    `;

    const { rows } = await db.query(query, [paymentMethod, amount, transactionId]);
    return rows[0];
  }

  // Update payment status
  static async updatePayment(transactionId, paymentData) {
    const query = `
      UPDATE transactions 
      SET 
        payment_status = $1,
        payment_reference = $2,
        payment_processed_at = $3
      WHERE transaction_id = $4
      RETURNING *
    `;

    const { rows } = await db.query(query, [
      paymentData.status,
      paymentData.reference,
      paymentData.processed_at,
      transactionId
    ]);
    return rows[0];
  }
}

module.exports = Transaction;
