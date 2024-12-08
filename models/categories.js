const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
{
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
    }
})

const Category = mongoose.model('category', categorySchema);

module.exports = Category;