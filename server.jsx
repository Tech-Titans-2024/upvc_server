require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Import models
const Products = require('./models/products');
const Category = require('./models/categories');

const app = express();

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  })
);

// Connect to MongoDB
mongoose
  .connect(process.env.DATABASE_URL)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Failed to connect to MongoDB:', err));

//----------------------------------------------------------------------------------------

// Route to fetch all products
app.get('/product', async (req, res) => {
  try {
    const products = await Products.find(); // Fetch all products
    res.json(products);
  } catch (err) {
    console.error('Error fetching products:', err.message);
    res.status(500).json({ message: 'Error fetching products' });
  }
});

// Route to fetch subcategories based on a product
app.post('/subcategory', async (req, res) => {
  try {
    const { product_name } = req.body;


    // Find the product by name
    const product = await Products.findOne({ product_name });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const productId = product.product_id;


    const categories = await Category.find(
      // { product_id: productId }, // Query the Category collection with product_id: 1
      // 'sub_category' // Select only the `sub_category` field
    );

    console.log(categories)

    // Check if categories were found and log them
    if (categories.length > 0) {
      console.log('Subcategories for Product ID 1:', categories);
    } else {
      console.log('No subcategories found for Product ID 1');
    }


    const subCategories = categories.map((category) => category.sub_category);

    res.status(200).json({ sub_categories: subCategories });
  } catch (error) {
    console.error('Error in subcategory route:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//----------------------------------------------------------------------------------------------

// Start the server
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
