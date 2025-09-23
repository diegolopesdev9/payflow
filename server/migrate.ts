
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { users, categories, bills } from '../shared/schema';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

const db = drizzle(pool);

async function migrate() {
  try {
    console.log('🔄 Creating database tables...');
    
    // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `);

    // Create categories table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name TEXT NOT NULL,
        color TEXT DEFAULT '#3b82f6',
        icon TEXT DEFAULT 'CreditCard',
        user_id UUID REFERENCES users(id) NOT NULL
      )
    `);

    // Create bills table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS bills (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name TEXT NOT NULL,
        amount INTEGER NOT NULL,
        due_date TIMESTAMP NOT NULL,
        is_paid BOOLEAN DEFAULT false,
        description TEXT,
        category_id UUID REFERENCES categories(id),
        user_id UUID REFERENCES users(id) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `);

    console.log('✅ Database tables created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating tables:', error);
    process.exit(1);
  }
}

migrate();
