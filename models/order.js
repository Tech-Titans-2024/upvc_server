const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    quotation_no: {
        type: String,
        required: true
    },
    salesper: {
        type: String,
    },
    cus_name: {
        type: String,
    },
    cus_add: {
        type: String
    },
    cus_con: {
        type: String
    },
    date: {
        type: String
    },
    netTotal: {
        type: Number
    },
    gst: {
        type: Number
    },
    gTotal: {
        type: Number
    },
    product: [
        {
            brand: { type: String },
            product: { type: String },
            type: { type: String },
            varient: { type: String },
            mesh: { type: String },
            width: { type: String },
            height: { type: String },
            area: { type: String },
            price: { type: String },
            glass: { type: String },
            roller: { type: String },
            totalPrice: { type: String },
            handleType: { type: String },
            color: { type: String },
            additionalcost: { type: String },
            quantity: { type: String },
            total: { type: String }
        }
    ]
}, { strict: false }); 

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
