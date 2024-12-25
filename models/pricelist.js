const mongoose = require('mongoose');
const Product = require('./products');

const priceListSchema = new mongoose.Schema({
    ProductPrice_id: {
        type: Number,
        required: true,
        unique: true,      
    },
    product: {
        type: Number,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    width: {
        type: String,
        required: true
    },
    heigth: {
        type: String,
        required: true
    },
    variety: {
        type: String,
        required: true,
    },
    unit: {
        type: String,
        required: true,
    },
});

const PriceList = mongoose.model('PriceList', priceListSchema);
module.exports = PriceList;
