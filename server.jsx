require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Products = require('./models/products'); // Ensure this is the correct path
const Category = require('./models/categories')

const app = express();

// Middleware for parsing JSON and handling CORS
app.use(express.json());


// Use CORS middleware
app.use(cors({
  origin: 'http://localhost:5173', // Match your frontend URL exactly
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed methods
  credentials: true // Allow cookies or authorization headers (if needed)
}));

// Connect to MongoDB
mongoose
  .connect(process.env.DATABASE_URL)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Failed to connect to MongoDB:', err));

//----------------------------------------------------------------------------------------------

// Route to fetch all products
app.get('/product', async (req, res) => {
  try {
    const products = await Products.find();
    res.json(products);
  } catch (err) {
    console.error('Error fetching products:', err.message);
    res.status(500).json({ message: 'Error fetching products' });
  }
});

//fetch sub category

app.post('/subcategory', async (req, res) => {
  try {
    const { products } = req.body;  // The product name passed from the frontend
    

    // Step 1: Find the product by its name
    const product = await Products.find({ product_name: products });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const productId = product.product_id; // Extract the product ID


    // Step 2: Find categories using the product ID
    const categories = await Category.find({ product_id: productId },'sub_category');  // Select only the 'sub_category' field
    console.log(categories)


    // if (categories.length === 0) {
    //   return res.status(404).json({ message: "No categories found for this product" });
    // }

    // // Map and get the sub_category values
    // const subCategories = categories.map((category) => category.sub_category);

    // // Step 3: Send the subcategories back in the response
    // res.status(200).json({ sub_categories: subCategories });

  } catch (error) {
    console.error("Error in subcategory route:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});



//-------------------------------------------------------------------------------------------------
// Start the server
const port = process.env.PORT;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
