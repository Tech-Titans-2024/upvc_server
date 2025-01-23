const mongoose = require('mongoose');

const priceListSchema = new mongoose.Schema({
    pro_price_id: {
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
        type: Number,
        required: true
    },
    height: {
        type: Number,
        required: true
    },
    variety: {
        type: String,
        required: true,
    },
    unit: {
        type: Number,
        required: true,
    },
});

const PriceList = mongoose.model('PriceList', priceListSchema);
module.exports = PriceList;
