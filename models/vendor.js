const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const vendorSchema = new mongoose.Schema({
	full_name: {
		type: String,
		trim: true,
		required: [true, 'Must provide full name']
	},
	brand_name: {
		type: String,
		trim: true,
		default: ''
	},
	email: {
		type: String,
		unique: true,
		trim: true,
		required: [true, 'Must have email'],
		lowercase: true,
		validate: [validator.isEmail, 'Please provide a valid email'],
	},
	password: {
		type: String,
		required: [true, 'Please enter password'],
		minLength: 6,
		select: false,
	},
	role:{
		type: String,
		default: 'vendor'
	},
	bank_details: {
		bank_name: {type: String},
		account_number: {type: String},
		account_name: {type: String}
	},
	password_confirm: {
        type: String,
        required: [true, 'Please confirm password'],
		validate: {
			validator: function (el) {
				return el === this.password;
			},
			message: 'Passwords mismatch',
		},
    },
	phone_number: {
		type: String,
		required: [true, 'Please enter phone number'],
		unique: true,
        match: [/^(\+\d{1,3})?\d{11}$/, "Phone number must start with +234 or 0"]
	},
	address: {
		type: String,
	},
	state_region: {
		type: String,
	},
	location: {
		type: String,
		default: ""
	},
	brand_services: {
		type: [String]
	},
	working_hours: {
		type: String,
		default: ""
	},
	brand_img: {
		type: String,
		default: ""
	},
	cloudinary_id:{
		type: String,
		select: false
	},
	brand_description: {
		type: String,
		default: ""
	},
	subscription: {
		type: String,
		enum: ["basic", "standard", "premium"],
		default: "basic",
	},
	passwordResetToken: String,
	passwordResetExpires: Date,
	confirmEmailToken: String,
	active: {
		type: Boolean,
		default: false,
		select: false,
	},
	loggedOut: {
		type: Boolean,
		default: true,
		select: false,
	}
},
	{ timestamps: true });

//Document middleware for encrpting password
vendorSchema.pre('save', async function (next) {
	if (!this.isModified('password')) {
		return next();
	}
	this.password = await bcrypt.hash(this.password, 12);
	this.password_confirm = undefined;
	next();
});

//Document middleware for indicating password change
vendorSchema.pre('save', function (next) {
	if (!this.isModified('password') || this.isNew) {
		return next();
	}
	this.passwordChangedAt = Date.now() - 1000;
	next();
});

//this creates a function available to all users used to compare user password to another
vendorSchema.methods.correctPassword = async function (
	candidatePassword,
	userPassword
) {
	return await bcrypt.compare(candidatePassword, userPassword);
};

//this creates a schema function that makes the password reset token
vendorSchema.methods.createPasswordResetToken = function () {
	const resetToken = crypto.randomBytes(32).toString('hex');

	this.passwordResetToken = crypto
		.createHash('sha256')
		.update(resetToken)
		.digest('hex');
	this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

	return resetToken;
};

//this creates a schema function that makes the email confirm token
vendorSchema.methods.createEmailConfirmToken = function () {
	const confirmToken = crypto.randomBytes(32).toString('hex');

	this.confirmEmailToken = crypto
		.createHash('sha256')
		.update(confirmToken)
		.digest('hex');

	return confirmToken;
};

module.exports = mongoose.model('Vendor', vendorSchema);
