import { Pool } from 'pg';

// Neon database connection string
const connectionString = 'postgresql://neondb_owner:npg_DY7Vv8WhJOMi@ep-little-mud-ai7rvo11-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const pool = new Pool({
  connectionString,
});

// Create products table
const createProductsTable = async () => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS products (
      id VARCHAR(50) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      price DECIMAL(10,2) NOT NULL,
      original_price DECIMAL(10,2),
      category VARCHAR(100) NOT NULL,
      image TEXT NOT NULL,
      rating DECIMAL(3,2) NOT NULL,
      reviews INTEGER NOT NULL,
      colors TEXT[],
      sizes TEXT[],
      description TEXT,
      features TEXT[],
      in_stock BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  try {
    await pool.query(createTableQuery);
    console.log('Products table created successfully');
  } catch (error) {
    console.error('Error creating products table:', error);
    throw error;
  }
};

export { pool, createProductsTable };
