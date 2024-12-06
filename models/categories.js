const mongoose = require('mongoose');

// Define the Category schema
const categorySchema = new mongoose.Schema({
  category_id: {
    type: String,
    required: true,
    unique: true,
  },
  product_id: {
    type: String,
    required: true,
  },
  sub_category: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
});

// Create the Category model
const Category = mongoose.model('category', categorySchema);

// Export the model for use in other files
module.exports = Category;
