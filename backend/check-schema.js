require('dotenv').config();
const db = require('./src/config/database');

async function checkSchema() {
  try {
    // Check items table schema
    console.log('=== ITEMS TABLE SCHEMA ===');
    const itemsSchema = await db.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'items' 
      ORDER BY ordinal_position;
    `);
    console.log(itemsSchema.rows);
    
    // Check users table schema
    console.log('\n=== USERS TABLE SCHEMA ===');
    const usersSchema = await db.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position;
    `);
    console.log(usersSchema.rows);
    
    // Check transactions table schema
    console.log('\n=== TRANSACTIONS TABLE SCHEMA ===');
    const transactionsSchema = await db.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'transactions' 
      ORDER BY ordinal_position;
    `);
    console.log(transactionsSchema.rows);
    
    // Test a simple query to see what columns exist
    console.log('\n=== SAMPLE DATA ===');
    const sampleItems = await db.query('SELECT * FROM items LIMIT 1');
    console.log('Items sample:', sampleItems.rows[0]);
    
    const sampleUsers = await db.query('SELECT * FROM users LIMIT 1');
    console.log('Users sample:', sampleUsers.rows[0]);
    
    const sampleTransactions = await db.query('SELECT * FROM transactions LIMIT 1');
    console.log('Transactions sample:', sampleTransactions.rows[0]);
    
  } catch (error) {
    console.error('Error checking schema:', error);
  } finally {
    await db.end();
  }
}

checkSchema();
