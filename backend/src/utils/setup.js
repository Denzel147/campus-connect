#!/usr/bin/env node
/**
 * CampusConnect Database Setup Script
 * 
 * This script sets up the complete database schema and populates it with sample data.
 * 
 * Usage:
 *   npm run db:setup     - Full setup (migrate + seed)
 *   npm run db:reset     - Reset database (drop + migrate + seed)
 *   npm run db:migrate   - Run migrations only
 *   npm run db:seed      - Run seeding only
 *   npm run db:clear     - Clear all data
 */

const db = require('../config/database');
const logger = require('../config/logger');
const { seedDatabase, clearDatabase } = require('./seed');

// SQL Queries for table creation
const TABLE_QUERIES = {
  users: `
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
    )`,
  
  categories: `
    CREATE TABLE IF NOT EXISTS categories (
      category_id SERIAL PRIMARY KEY,
      category_name VARCHAR(50) NOT NULL UNIQUE,
      description TEXT,
      icon VARCHAR(50),
      is_active BOOLEAN DEFAULT TRUE,
      date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
  
  items: `
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
    )`,
  
  transactions: `
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
    )`,
  
  reviews: `
    CREATE TABLE IF NOT EXISTS reviews (
      review_id SERIAL PRIMARY KEY,
      transaction_id INTEGER REFERENCES transactions(transaction_id) ON DELETE CASCADE,
      reviewer_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
      reviewee_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
      rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
      comment TEXT,
      review_type VARCHAR(20) NOT NULL,
      date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
  
  notifications: `
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
    )`
};

const INDEXES = [
  'CREATE INDEX IF NOT EXISTS idx_items_owner_id ON items(owner_id)',
  'CREATE INDEX IF NOT EXISTS idx_items_category ON items(category)',
  'CREATE INDEX IF NOT EXISTS idx_items_availability ON items(availability_status)',
  'CREATE INDEX IF NOT EXISTS idx_transactions_item_id ON transactions(item_id)',
  'CREATE INDEX IF NOT EXISTS idx_transactions_lender_id ON transactions(lender_id)',
  'CREATE INDEX IF NOT EXISTS idx_transactions_borrower_id ON transactions(borrower_id)',
  'CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id)',
  'CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read)'
];

const createTables = async () => {
  try {
    console.log('🚀 Starting database migration...');
    
    // Create tables in dependency order
    const tableOrder = ['users', 'categories', 'items', 'transactions', 'reviews', 'notifications'];
    
    for (const tableName of tableOrder) {
      console.log(`Creating ${tableName} table...`);
      await db.query(TABLE_QUERIES[tableName]);
      console.log(`✓ ${tableName} table created`);
    }

    // Create indexes
    console.log('Creating database indexes...');
    for (const indexSQL of INDEXES) {
      await db.query(indexSQL);
    }
    console.log('✓ Database indexes created');

    console.log('✅ Database migration completed successfully!');
    logger.info('Database tables created successfully');
    return true;
    
  } catch (error) {
    logger.error('Error creating tables:', error);
    console.error('❌ Database migration failed:', error.message);
    throw error;
  }
};

const dropTables = async () => {
  try {
    console.log('🗑️  Dropping database tables...');
    
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
    return true;
    
  } catch (error) {
    logger.error('Error dropping tables:', error);
    console.error('❌ Error dropping tables:', error.message);
    throw error;
  }
};

const checkTables = async () => {
  try {
    const result = await db.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log('📊 Current database tables:');
    if (result.rows.length === 0) {
      console.log('   No tables found');
    } else {
      result.rows.forEach(row => {
        console.log(`   - ${row.table_name}`);
      });
    }
    
    return result.rows;
  } catch (error) {
    console.error('❌ Error checking tables:', error.message);
    throw error;
  }
};

const getTableCounts = async () => {
  try {
    const tables = ['users', 'categories', 'items', 'transactions', 'reviews', 'notifications'];
    console.log('📈 Database record counts:');
    
    for (const table of tables) {
      try {
        const result = await db.query(`SELECT COUNT(*) as count FROM ${table}`);
        console.log(`   ${table}: ${result.rows[0].count}`);
      } catch (err) {
        console.log(`   ${table}: table does not exist`);
      }
    }
  } catch (error) {
    console.error('❌ Error getting table counts:', error.message);
  }
};

// Main execution logic
async function main() {
  const command = process.argv[2];
  
  try {
    switch (command) {
      case 'migrate':
        await createTables();
        break;
        
      case 'seed':
        await seedDatabase();
        break;
        
      case 'setup':
        await createTables();
        await seedDatabase();
        await getTableCounts();
        break;
        
      case 'reset':
        await dropTables();
        await createTables();
        await seedDatabase();
        await getTableCounts();
        break;
        
      case 'clear':
        await clearDatabase();
        break;
        
      case 'drop':
        await dropTables();
        break;
        
      case 'status':
        await checkTables();
        await getTableCounts();
        break;
        
      default:
        console.log(`
🏫 CampusConnect Database Setup

Usage:
  node setup.js <command>

Commands:
  setup     - Full setup (migrate + seed)
  reset     - Reset database (drop + migrate + seed)
  migrate   - Run migrations only
  seed      - Run seeding only
  clear     - Clear all data (keep tables)
  drop      - Drop all tables
  status    - Check database status

Examples:
  node setup.js setup
  node setup.js reset
  node setup.js status
        `);
        process.exit(0);
    }
    
    console.log('✨ Operation completed successfully!');
    process.exit(0);
    
  } catch (error) {
    console.error('💥 Operation failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { 
  createTables, 
  dropTables, 
  checkTables, 
  getTableCounts,
  seedDatabase,
  clearDatabase
};
