import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pkg;

// Handle password - ensure it's a string (empty string for no password, or actual password)
// For SCRAM authentication, password must be a string (can be empty string for trust auth)
const dbPassword = process.env.DB_PASSWORD !== undefined 
  ? String(process.env.DB_PASSWORD) 
  : '';

const poolConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'focuswave',
  user: process.env.DB_USER || 'postgres',
};

// Only add password if it's provided (non-empty)
if (dbPassword && dbPassword.trim() !== '') {
  poolConfig.password = dbPassword.trim();
}

const pool = new Pool(poolConfig);

// Test connection
pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ Database connection error:', err);
  process.exit(-1);
});

export default pool;

