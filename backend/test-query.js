require('dotenv').config();
const db = require('./src/config/database');

async function testQuery() {
  try {
    console.log('Testing getUserStatistics...');
    
    const query = `
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN account_status = 'active' THEN 1 END) as active,
        COUNT(CASE WHEN account_status = 'inactive' THEN 1 END) as inactive,
        COUNT(CASE WHEN verification_status = true THEN 1 END) as verified,
        COUNT(CASE WHEN verification_status = false OR verification_status IS NULL THEN 1 END) as unverified
      FROM users
    `;
    
    console.log('Query:', query);
    const result = await db.query(query);
    console.log('Result:', result.rows[0]);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    process.exit(0);
  }
}

testQuery();
