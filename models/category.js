const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
{
    type_id : {
        type: Number,
        required: true,
        unique: true,
    },
    product_id : {
        type: Number,
    },
    type : {
        type: String,
    },
    varient : {
        type: String,
    }
})

const category = mongoose.model('category', categorySchema);

module.exports = category;