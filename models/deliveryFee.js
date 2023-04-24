const mongoose = require("mongoose");

const deliveryFeeSchema = new mongoose.Schema({
    location: {
        type: String,
        required: [true, 'location is required']
    },
    price: {
        type: Number,
        required: [true, 'price is required']
    },
    vendor: {
        type: String,
    },
    vendor_id: {
        type: mongoose.Schema.ObjectId,
        ref: 'Vendor'
    }
}, { timestamps: true },
)



module.exports = mongoose.model("DeliveryFee", deliveryFeeSchema)