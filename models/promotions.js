const mongoose = require("mongoose");
const Schema = mongoose.Schema;
require('mongoose-currency').loadType(mongoose);
var Currency = mongoose.Types.Currency;

const promotionSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true,
        default: "description"
    },
    label: {
        type: String,
        default: ""
    },
    image: String,
    featured: {
        type: Boolean,
        default: false
    },
    price: {
        type: Currency,
        required:true,
        default:0
    }
}, {
    timestamps:true
})

var Promotions = mongoose.model("Promotion", promotionSchema);

module.exports = Promotions;