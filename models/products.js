const mongoose = require('mongoose');

// Define the Product schema
const productSchema = new mongoose.Schema({
  product_id: {
    type: String,
    required: true,
    unique: true,
  },
  product_name: {
    type: String,
    required: true,
  },
});

// Create the Product model
const Product = mongoose.model('Product', productSchema);

// Export the model for use in other files
module.exports = Product;
