const crypto = require('crypto');
const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    order_id: {
        type: String,
    },
    name: {
        type: String
    },
    phoneNumber: {
        type: String
    },
    delivery_fee:{
        type: Number
    },
    location: {
        type: String
    },
    orderedBy:{
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        select: false
    },
    pack_fee:{
        type: Number
    },
    vendor: {
        type: String
    },
    ordered_items: [{
        item: String,
        price: Number
    }],
    total: {
        type: Number
    }
    },
    {timestamps : true}

)

module.exports = mongoose.model("Order", OrderSchema)
