const express = require('express');
const route = express.Router();
const mongoose = require('mongoose');
const Product = require('../models/products'); // Ensure correct model path

// Fetch all products
route.get('/product', async (req, res) => {
  try {
    const products = await Product.find(); // Fetch all products from MongoDB
    res.json(products); // Send the fetched products as JSON
    console.log(products);
    
  } catch (err) {
    console.error('Error fetching products:', err.message);
    res.status(500).json({ message: 'Error fetching products' }); // Handle errors gracefully
  }
});

module.exports = route;
