const mongoose = require("mongoose");

const miscellaneousFeeSchema = new mongoose.Schema({
    item_name: {
        type: String,
        required: [true, 'item name is required']
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
        ref: 'Vendor',
        select: false
    }
}, { timestamps: true },
)


module.exports = mongoose.model("MiscellaneousFee", miscellaneousFeeSchema)