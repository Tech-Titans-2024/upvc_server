const mongoose = require('mongoose')
const AutoIncrement = require('mongoose-sequence')(mongoose);

const PriceSchema = new mongoose.Schema(
{
    s_no :  Number,
    p_id :  Number,
    pt_id :  Number,
    price : Number,
    unit: 
    {
        type: String,
        default: 0
    }   
})

PriceSchema.plugin(AutoIncrement, { inc_field: 's_no' });

const PriceModel = mongoose.model("pricelist", PriceSchema)

module.exports = PriceModel