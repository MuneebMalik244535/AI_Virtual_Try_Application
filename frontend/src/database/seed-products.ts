import { pool, createProductsTable } from './migrate.js';
import { products } from '../app/data/products.js';

const insertProducts = async () => {
  try {
    // First create the table
    await createProductsTable();
    
    // Clear existing products
    await pool.query('DELETE FROM products');
    console.log('Cleared existing products');
    
    // Insert all products
    for (const product of products) {
      const insertQuery = `
        INSERT INTO products (
          id, name, price, original_price, category, image, 
          rating, reviews, colors, sizes, description, features, in_stock
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13
        )
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          price = EXCLUDED.price,
          original_price = EXCLUDED.original_price,
          category = EXCLUDED.category,
          image = EXCLUDED.image,
          rating = EXCLUDED.rating,
          reviews = EXCLUDED.reviews,
          colors = EXCLUDED.colors,
          sizes = EXCLUDED.sizes,
          description = EXCLUDED.description,
          features = EXCLUDED.features,
          in_stock = EXCLUDED.in_stock,
          updated_at = CURRENT_TIMESTAMP
      `;
      
      const values = [
        product.id,
        product.name,
        product.price,
        product.originalPrice || null,
        product.category,
        product.image,
        product.rating,
        product.reviews,
        product.colors || [],
        product.sizes || [],
        product.description || null,
        product.features || [],
        product.inStock !== undefined ? product.inStock : true
      ];
      
      await pool.query(insertQuery, values);
      console.log(`Inserted product: ${product.name}`);
    }
    
    console.log(`Successfully inserted ${products.length} products into the database`);
    
    // Verify insertion
    const result = await pool.query('SELECT COUNT(*) as count FROM products');
    console.log(`Total products in database: ${result.rows[0].count}`);
    
  } catch (error) {
    console.error('Error inserting products:', error);
    throw error;
  }
};

// Run the insertion
insertProducts()
  .then(() => {
    console.log('Product insertion completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed to insert products:', error);
    process.exit(1);
  })
  .finally(() => {
    pool.end();
  });
