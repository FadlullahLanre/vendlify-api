const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'name is required']
    },
    price: {
        type: Number,
        required: [true, 'price is required']
    },
    image: {
		type: String,
		default: ""
	},
    type:{
        type: String,
        required: [true, 'type of food is required']
    },
    variation: {
        type: String,
    },
    available:{
        type: Boolean,
        default: true
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



module.exports = mongoose.model("Product", productSchema)