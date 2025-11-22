const db = require('../config/database');
const logger = require('../config/logger');

const createTables = async () => {
  try {
    console.log('Creating database tables...');

    // Users table - updated to match User.js model
    const usersTableSQL = `
      CREATE TABLE IF NOT EXISTS users (
        user_id SERIAL PRIMARY KEY,
        full_name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        phone_number VARCHAR(15),
        institution VARCHAR(100) DEFAULT 'African Leadership University',
        department VARCHAR(100),
        student_id VARCHAR(50),
        major VARCHAR(100),
        year VARCHAR(20),
        campus VARCHAR(50) DEFAULT 'Rwanda',
        dorm VARCHAR(100),
        room_number VARCHAR(20),
        whatsapp_number VARCHAR(20),
        academic_interests TEXT[], 
        role VARCHAR(20) DEFAULT 'student',
        profile_picture TEXT,
        verification_status BOOLEAN DEFAULT FALSE,
        rating DECIMAL(3,2) DEFAULT 0.00,
        total_lends INTEGER DEFAULT 0,
        total_borrows INTEGER DEFAULT 0,
        account_status VARCHAR(20) DEFAULT 'active',
        date_joined TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP,
        terms_agreed BOOLEAN DEFAULT FALSE,
        terms_agreed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`;
    await db.query(usersTableSQL);
    console.log('✓ Users table created');

    // Categories table - matches Category.js model
    const categoriesTableSQL = `
      CREATE TABLE IF NOT EXISTS categories (
        category_id SERIAL PRIMARY KEY,
        category_name VARCHAR(50) NOT NULL UNIQUE,
        description TEXT,
        icon VARCHAR(50),
        is_active BOOLEAN DEFAULT TRUE,
        date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`;
    await db.query(categoriesTableSQL);
    console.log('✓ Categories table created');

    // Items table - updated to match Item.js model
    const itemsTableSQL = `
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
      )`;
    await db.query(itemsTableSQL);
    console.log('✓ Items table created');

    // Transactions table - matches Transaction.js model
    const transactionsTableSQL = `
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
      )`;
    await db.query(transactionsTableSQL);
    console.log('✓ Transactions table created');

    // Reviews table 
    const reviewsTableSQL = `
      CREATE TABLE IF NOT EXISTS reviews (
        review_id SERIAL PRIMARY KEY,
        transaction_id INTEGER REFERENCES transactions(transaction_id) ON DELETE CASCADE,
        reviewer_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
        reviewee_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        review_type VARCHAR(20) NOT NULL,
        date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`;
    await db.query(reviewsTableSQL);
    console.log('✓ Reviews table created');

    // Notifications table - matches Notification.js model
    const notificationsTableSQL = `
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
      )`;
    await db.query(notificationsTableSQL);
    console.log('✓ Notifications table created');

    // Create indexes for better performance
    console.log('Creating indexes...');
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_items_owner_id ON items(owner_id)',
      'CREATE INDEX IF NOT EXISTS idx_items_category ON items(category)',
      'CREATE INDEX IF NOT EXISTS idx_items_availability ON items(availability_status)',
      'CREATE INDEX IF NOT EXISTS idx_transactions_item_id ON transactions(item_id)',
      'CREATE INDEX IF NOT EXISTS idx_transactions_lender_id ON transactions(lender_id)',
      'CREATE INDEX IF NOT EXISTS idx_transactions_borrower_id ON transactions(borrower_id)',
      'CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read)'
    ];

    for (const indexSQL of indexes) {
      await db.query(indexSQL);
    }
    console.log('✓ Indexes created');

    console.log('\n🎉 Database migration completed successfully!');
    logger.info('Database tables created successfully');
    
  } catch (error) {
    logger.error('Error creating tables:', error);
    console.error('❌ Database migration failed:', error.message);
    throw error;
  }
};

const dropTables = async () => {
  try {
    console.log('Dropping database tables...');
    
    const dropSQL = [
      'DROP TABLE IF EXISTS notifications CASCADE',
      'DROP TABLE IF EXISTS reviews CASCADE',
      'DROP TABLE IF EXISTS transactions CASCADE',
      'DROP TABLE IF EXISTS items CASCADE',
      'DROP TABLE IF EXISTS categories CASCADE',
      'DROP TABLE IF EXISTS users CASCADE'
    ];

    for (const sql of dropSQL) {
      await db.query(sql);
    }
    
    console.log('✓ Database tables dropped successfully');
    logger.info('Database tables dropped successfully');
    
  } catch (error) {
    logger.error('Error dropping tables:', error);
    console.error('❌ Error dropping tables:', error.message);
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
