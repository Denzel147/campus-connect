const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Helper function to process SSL certificate
const getSSLConfig = () => {
  if (process.env.DB_SSL !== 'true') {
    return false;
  }

  // If certificate path is provided, read from file
  if (process.env.DB_CA_CERT && process.env.DB_CA_CERT.trim() !== '') {
    let certPath = process.env.DB_CA_CERT.trim();
    
    // Handle relative path from backend directory
    if (certPath.startsWith('/config/')) {
      certPath = path.join(__dirname, '..', '..', 'src', 'config', path.basename(certPath));
    } else if (!path.isAbsolute(certPath)) {
      certPath = path.resolve(certPath);
    }
    
    try {
      if (fs.existsSync(certPath)) {
        const caCert = fs.readFileSync(certPath, 'utf8');
        console.log('✅ Using SSL certificate from file:', certPath);
        return {
          rejectUnauthorized: true,
          ca: caCert,
          sslmode: 'require'
        };
      } else {
        console.warn('⚠️  SSL certificate file not found:', certPath);
        console.log('Falling back to relaxed SSL mode for cloud providers');
      }
    } catch (err) {
      console.error('❌ Error reading SSL certificate file:', err.message);
      console.log('Falling back to relaxed SSL mode for cloud providers');
    }
  }

  // Fallback: use relaxed SSL for cloud providers (Aiven, etc.)
  console.log('Using relaxed SSL mode for cloud provider');
  return {
    rejectUnauthorized: false,
    sslmode: 'require'
  };
};

// Database configuration
const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME,
  ssl: getSSLConfig(),
  // Connection pool settings
  max: 10, // Reduced for cloud providers
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 20000, // Increased for network latency
  acquireTimeoutMillis: 60000, // Added acquire timeout
  createTimeoutMillis: 30000, // Added create timeout
  destroyTimeoutMillis: 5000, // Added destroy timeout
  reapIntervalMillis: 1000, // Added reap interval
  createRetryIntervalMillis: 200 // Added retry interval
};

// Validate required configuration
const requiredEnvVars = ['DB_USER', 'DB_PASSWORD', 'DB_HOST', 'DB_NAME'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('Missing required environment variables:', missingVars);
  process.exit(1);
}

// Create connection pool
const pool = new Pool(config);

// Enhanced pool event handlers
pool.on('error', (err, _client) => {
  console.error('Unexpected error on idle client:', err);
});

pool.on('connect', (_client) => {
  console.log('New client connected to database');
});

pool.on('acquire', (_client) => {
  console.log('Client acquired from pool');
});

pool.on('remove', (_client) => {
  console.log('Client removed from pool');
});

// Test database connection function with retry logic
const testConnection = async (retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`Testing database connection (attempt ${i + 1}/${retries})...`);
      
      const client = await pool.connect();
      try {
        const result = await client.query('SELECT version(), current_timestamp');
        console.log('✅ Database connected successfully!');
        console.log('  PostgreSQL version:', result.rows[0].version.split(' ')[1]);
        console.log('  Server time:', result.rows[0].current_timestamp);
        console.log('  SSL enabled:', config.ssl !== false);
        return true;
      } finally {
        client.release();
      }
    } catch (err) {
      console.error(`❌ Database connection attempt ${i + 1} failed:`, err.message);
      
      if (i === retries - 1) {
        console.error('All connection attempts failed. Check your database configuration.');
        console.error('Config being used:', {
          host: config.host,
          port: config.port,
          database: config.database,
          user: config.user,
          ssl: config.ssl !== false ? 'enabled' : 'disabled'
        });
        throw err;
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 2000 * (i + 1)));
    }
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down database pool...');
  await pool.end();
  console.log('Database pool closed.');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Shutting down database pool...');
  await pool.end();
  console.log('Database pool closed.');
  process.exit(0);
});

// Test connection on startup
testConnection().catch(() => {
  console.error('Failed to establish initial database connection');
  // Don't exit process - let the app start but log the issue
});

module.exports = {
  query: async (text, params) => {
    try {
      return await pool.query(text, params);
    } catch (err) {
      console.error('Database query error:', err);
      throw err;
    }
  },
  pool,
  testConnection
};
