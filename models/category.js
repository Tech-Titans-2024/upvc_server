const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    type_id: {
        type: Number,
        required: true,
    },
    product_id: {
        type: Number,
    },
    type: {
        type: String,
    },
    varient: {
        type: String,
    },
    image: {
        type: String,
    }
});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
