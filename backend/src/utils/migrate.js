const db = require('../config/database');
const logger = require('../config/logger');

const createTables = async () => {
  try {
    // Users table
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        user_id SERIAL PRIMARY KEY,
        full_name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        phone_number VARCHAR(15),
        institution VARCHAR(100),
        department VARCHAR(100),
        student_id VARCHAR(50),
        profile_picture TEXT,
        verification_status BOOLEAN DEFAULT FALSE,
        rating DECIMAL(3,2) DEFAULT 0.00,
        total_lends INTEGER DEFAULT 0,
        total_borrows INTEGER DEFAULT 0,
        account_status VARCHAR(20) DEFAULT 'active',
        date_joined TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Categories table
    await db.query(`
      CREATE TABLE IF NOT EXISTS categories (
        category_id SERIAL PRIMARY KEY,
        category_name VARCHAR(50) NOT NULL UNIQUE,
        description TEXT,
        icon VARCHAR(50),
        is_active BOOLEAN DEFAULT TRUE,
        date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Items (Books) table
    await db.query(`
      CREATE TABLE IF NOT EXISTS items (
        item_id SERIAL PRIMARY KEY,
        owner_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
        item_name VARCHAR(200) NOT NULL,
        category INTEGER REFERENCES categories(category_id),
        description TEXT,
        condition VARCHAR(20) NOT NULL,
        availability_status VARCHAR(20) DEFAULT 'available',
        sharing_type VARCHAR(20) NOT NULL,
        item_image TEXT,
        location VARCHAR(100),
        isbn VARCHAR(20),
        author VARCHAR(100),
        publication_year INTEGER,
        due_date DATE,
        date_listed TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        date_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Transactions table
    await db.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        transaction_id SERIAL PRIMARY KEY,
        item_id INTEGER REFERENCES items(item_id) ON DELETE CASCADE,
        lender_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
        borrower_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
        transaction_type VARCHAR(20) NOT NULL,
        transaction_status VARCHAR(20) DEFAULT 'pending',
        borrow_date DATE,
        due_date DATE,
        return_date TIMESTAMP,
        late_return BOOLEAN DEFAULT FALSE,
        days_overdue INTEGER DEFAULT 0,
        notes TEXT,
        date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        date_completed TIMESTAMP
      );
    `);

    // Reviews table
    await db.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        review_id SERIAL PRIMARY KEY,
        transaction_id INTEGER REFERENCES transactions(transaction_id) ON DELETE CASCADE,
        reviewer_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
        reviewee_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        review_type VARCHAR(20) NOT NULL,
        date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Notifications table
    await db.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        notification_id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
        notification_type VARCHAR(50) NOT NULL,
        message TEXT NOT NULL,
        related_item_id INTEGER REFERENCES items(item_id) ON DELETE SET NULL,
        related_transaction_id INTEGER REFERENCES transactions(transaction_id) ON DELETE SET NULL,
        is_read BOOLEAN DEFAULT FALSE,
        priority VARCHAR(20) DEFAULT 'normal',
        date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        date_read TIMESTAMP
      );
    `);

    // Create indexes for better performance
    await db.query('CREATE INDEX IF NOT EXISTS idx_items_owner_id ON items(owner_id);');
    await db.query('CREATE INDEX IF NOT EXISTS idx_items_category ON items(category);');
    await db.query('CREATE INDEX IF NOT EXISTS idx_items_availability ON items(availability_status);');
    await db.query('CREATE INDEX IF NOT EXISTS idx_transactions_item_id ON transactions(item_id);');
    await db.query('CREATE INDEX IF NOT EXISTS idx_transactions_lender_id ON transactions(lender_id);');
    await db.query('CREATE INDEX IF NOT EXISTS idx_transactions_borrower_id ON transactions(borrower_id);');
    await db.query('CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);');
    await db.query('CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);');

    logger.info('Database tables created successfully');
    console.log('Database migration completed successfully');
  } catch (error) {
    logger.error('Error creating tables:', error);
    console.error('Database migration failed:', error.message);
    throw error;
  }
};

const dropTables = async () => {
  try {
    await db.query('DROP TABLE IF EXISTS notifications CASCADE;');
    await db.query('DROP TABLE IF EXISTS reviews CASCADE;');
    await db.query('DROP TABLE IF EXISTS transactions CASCADE;');
    await db.query('DROP TABLE IF EXISTS items CASCADE;');
    await db.query('DROP TABLE IF EXISTS categories CASCADE;');
    await db.query('DROP TABLE IF EXISTS users CASCADE;');
    
    logger.info('Database tables dropped successfully');
    console.log('Database tables dropped successfully');
  } catch (error) {
    logger.error('Error dropping tables:', error);
    console.error('Error dropping tables:', error.message);
    throw error;
  }
};

// Run migration if called directly
if (require.main === module) {
  const command = process.argv[2];
  
  if (command === 'drop') {
    dropTables()
      .then(() => process.exit(0))
      .catch(() => process.exit(1));
  } else {
    createTables()
      .then(() => process.exit(0))
      .catch(() => process.exit(1));
  }
}

module.exports = { createTables, dropTables };
