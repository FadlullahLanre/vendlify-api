const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const vendorSchema = new mongoose.Schema({
	brandName: {
		type: String,
		unique: true,
		trim: true,
		required: [true, 'Must provide brandname']
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
		minLength: 8,
		select: false,
	},
	passwordConfirm: {
        type: String,
        required: [true, 'Please confirm password'],
		validate: {
			validator: function (el) {
				return el === this.password;
			},
			message: 'Passwords mismatch',
		},
    },
	phoneNumber: {
		type: String,
		required: [true, 'Please enter phone number'],
		validate: [validator.phoneNumber, 'Please provide a valid phone number']
	},
	address: {
		type: String,

	},
	state_region: {
		type: String,
	},
	activeSchool: {
		type: String
	},
	services: {
		type: String
	},
	working_hour: {
		type: String
	},
	picture: {
		type: String
	},
	description: {
		type: String
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
	this.passwordConfirm = undefined;
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
