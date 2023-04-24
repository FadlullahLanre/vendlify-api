const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
	user_name : {
		type: String,
		trim : true,
		required : [true, 'Must provide username']
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
		minLength: 5,
		select: false,
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
    phone_number : {
        type: String,
        required: [true, 'Please enter phone number'],
		unique: true,
        match: [/^(\+\d{1,3})?\d{11}$/, "Phone number must start with +234 or 0"]
    },
	role: {
		type: String,
		default: 'user'
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
{ timestamps : true });

//Document middleware for enycrpting password
userSchema.pre('save', async function (next) {
	if (!this.isModified('password')) {
		return next();
	}
	this.password = await bcrypt.hash(this.password, 12);
	this.password_confirm = undefined;
	next();
});

//Document middleware for indicating password change
userSchema.pre('save', function (next) {
	if (!this.isModified('password') || this.isNew) {
		return next();
	}
	this.passwordChangedAt = Date.now() - 1000;
	next();
});

//this creates a function available to all users used to compare user password to another
userSchema.methods.correctPassword = async function (
	candidatePassword,
	userPassword
) {
	return await bcrypt.compare(candidatePassword, userPassword);
};

//this creates a schema function that makes the password reset token
userSchema.methods.createPasswordResetToken = function () {
	const resetToken = crypto.randomBytes(32).toString('hex');

	this.passwordResetToken = crypto
		.createHash('sha256')
		.update(resetToken)
		.digest('hex');
	this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

	return resetToken;
};

//this creates a schema function that makes the email confirm token
userSchema.methods.createEmailConfirmToken = function () {
	const confirmToken = crypto.randomBytes(32).toString('hex');

	this.confirmEmailToken = crypto
		.createHash('sha256')
		.update(confirmToken)
		.digest('hex');

	return confirmToken;
};

module.exports = mongoose.model('User', userSchema);
