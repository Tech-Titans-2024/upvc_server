require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Products = require('./models/products'); // Ensure this is the correct path

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

//-------------------------------------------------------------------------------------------------
// Start the server
const port = process.env.PORT || 5001;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
