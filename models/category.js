const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
{
    category_id: {
        type: Number,
        required: true,
        unique: true,
    },
    product_id: {
        type: Number,
    },
    category: {
        type: String,
    },
    type: {
        type: String,
    }
})

const category = mongoose.model('category', categorySchema);

module.exports = category;