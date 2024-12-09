const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
{
    product_id: {
        type: Number,
        required: true,
        unique: true,
    },
    product_name: {
        type: String,
        required: true,
    }
})

const product = mongoose.model('product', productSchema);

module.exports = product;