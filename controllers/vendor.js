const nodemailer = require("nodemailer");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const catchAsync = require("../utils/catchAsync");
const Vendor = require("../models/vendor");
const AppError = require("../utils/appError");

const sendEmail = (options) => {
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.MAIL_USERNAME,
      pass: process.env.MAIL_PASSWORD,
    },
  });
  let mailOptions = {
    from: process.env.MAIL_USERNAME,
    to: options.email,
    subject: options.subject,
    html: options.message,
  };
  transporter.sendMail(mailOptions);
};

const signToken = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const createSendToken = catchAsync(async (vendor, statusCode, res) => {
  const token = signToken(vendor._id, vendor.role);

  vendor.loggedOut = false;
  await vendor.save({ validateBeforeSave: false });

  vendor.password = undefined;
  vendor.active = undefined;
  vendor.confirmEmailToken = undefined;
  vendor.loggedOut = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      vendor: vendor,
    },
  });
});

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) {
      newObj[el] = obj[el];
    }
  });

  return newObj;
};

const signup = catchAsync(async (req, res, next) => {
  const vendor = await Vendor.create({
    full_name: req.body.full_name,
    email: req.body.email,
    password: req.body.password,
    password_confirm: req.body.password_confirm,
    phone_number: req.body.phone_number,
  });

  const confirmToken = vendor.createEmailConfirmToken();
  await vendor.save({ validateBeforeSave: false });

  //3 send to user mail
  const confirmURL = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/vendors/confirmEmail/${confirmToken}`;

  const message = `Confirm email address using this <a href=${confirmURL}>Link</a>.`;

  try {
    await sendEmail({
      email: vendor.email,
      subject: "Confirm Email Address",
      message,
    });
    vendor.password = undefined;
    vendor.active = undefined;
    vendor.confirmEmailToken = undefined;
    vendor.loggedOut = undefined;
    res.status(200).json({
      vendor,
      message: "Sign up succesful!! Please confirm your email",
    });
  } catch (err) {
    return next(
      new AppError("Something went wrong, please try again later", 401)
    );
  }
});

const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError("Please provide email and password", 400));
  }

  const vendor = await Vendor.findOne({ email }).select("+password +active");

  if (!vendor || !(await vendor.correctPassword(password, vendor.password))) {
    return next(new AppError("Incorrect email or password", 401));
  }

  if (vendor.active !== true) {
    return next(
      new AppError("Inactive, check email for confirmation link", 401)
    );
  }

  createSendToken(vendor, 200, res);
});
const forgotPassword = catchAsync(async (req, res, next) => {
  //1 Get vendor based on email
  const vendor = await Vendor.findOne({ email: req.body.email });

  if (!user) return next(new AppError("Vendor does not exist", 401));

  //2 Generate the random reset token
  const resetToken = vendor.createPasswordResetToken();
  await vendor.save({ validateBeforeSave: false });

  //3 send to vendor mail
  const resetURL = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/vendors/resetPassword/${resetToken}`;

  const message = `Forgot your password? Submit a PATCH request with your new password and
     passwordConfirm to: <a href=${resetURL}>Link</a>.\n If you didn't forget your password, please ignore this email!`;

  try {
    await sendEmail({
      email: vendor.email,
      subject: "Your password reset token(this link is valid for 10mins )",
      message,
    });

    res.status(200).json({
      status: "success",
      message: "Token sent to mail",
    });
  } catch (err) {
    vendor.passwordResetToken = undefined;
    vendor.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError("There was an error sending the email. Try again later", 500)
    );
  }
});
const resetPassword = catchAsync(async (req, res, next) => {
  //1 get vendor based on token
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const vendor = await Vendor.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  //2 set new password if user exists and token has not expired
  if (!vendor) {
    return next(new AppError("Token is invalid or has expired", 400));
  }
  vendor.password = req.body.password;
  vendor.passwordConfirm = req.body.passwordConfirm;
  vendor.passwordResetToken = undefined;
  vendor.passwordResetExpires = undefined;

  await vendor.save();

  //3 logs vendor in
  res.status(200).json({
    message: "Password succesfully reset!! Proceed to login",
  });
});

const confirmEmail = catchAsync(async (req, res, next) => {
  //1 get user based on token
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const vendor = await Vendor.findOne({
    confirmEmailToken: hashedToken,
  }).select("+active");

  //2 set user as active if user exists
  if (!vendor) {
    return next(new AppError("Token is invalid", 400));
  }
  if (vendor.active)
    return next(
      new AppError("This user is already verified, please login", 401)
    );

  vendor.active = true;
  vendor.confirmEmailToken = undefined;

  await vendor.save({ validateBeforeSave: false });
  createSendToken(vendor, 200, res);
});

const resendEmail = catchAsync(async (req, res, next) => {
  //1 Get user based on email
  const vendor = await Vendor.findOne({ email: req.body.email }).select(
    "+active"
  );

  if (!vendor)
    return next(new AppError("User does not exist, please sign up", 401));
  if (vendor.active)
    return next(
      new AppError("This user is already verified, please login", 401)
    );

  //2 Generate the random email token
  const confirmToken = vendor.createEmailConfirmToken();
  await vendor.save({ validateBeforeSave: false });

  //3 send to user mail
  const confirmURL = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/vendors/confirmEmail/${confirmToken}`;

  const message = `Confirm email address using this <a href=${confirmURL}>Link</a>.`;

  try {
    await sendEmail({
      email: vendor.email,
      subject: "Confirm Email Address",
      message,
    });
    vendor.password = undefined;
    vendor.active = undefined;
    vendor.confirmEmailToken = undefined;
    vendor.loggedOut = undefined;
    vendor.status(200).json({
      vendor,
      message: "Email sent succesfully",
    });
  } catch (err) {
    return next(
      new AppError("Something went wrong, please try again later", 401)
    );
  }
});

const protect = catchAsync(async (req, res, next) => {
  //1). Getting token and check if its there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(
      new AppError("You are not logged in! Please log in to get access", 401)
    );
  }

  //2). Verification of token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  //3). Checek if user still exists
  const currentVendor = await Vendor.findById(decoded.id).select("+loggedOut");
  if (!currentVendor) {
    return next(new AppError("The vendor no longer exists", 401));
  }
  //4). Check if user is logged in
  if (currentVendor.loggedOut) {
    return next(
      new AppError("You are not logged in! Please log in to get access", 401)
    );
  }

  req.vendor = currentVendor;
  next();
});

const logout = catchAsync(async (req, res, next) => {
  const vendor = await Vendor.findOne({
    email: req.vendor.email,
  });
  vendor.loggedOut = true;
  await vendor.save({ validateBeforeSave: false });

  res.status(200).json({
    status: "success",
    message: "You have successfully logged out",
  });
});

const updatePassword = catchAsync(async (req, res, next) => {
  //1 Get user from collection
  const vendor = await Vendor.findOne({ email: req.vendor.email }).select(
    "+password"
  );
  //2 Check if posted current password is correct
  if (
    !(await vendor.correctPassword(req.body.passwordCurrent, vendor.password))
  ) {
    return next(new AppError("Your current password is wrong", 401));
  }
  //3 if so, update password
  vendor.password = req.body.password;
  vendor.password_confirm = req.body.password_confirm;

  await vendor.save();

  vendor.loggedOut = true;
  await vendor.save({ validateBeforeSave: false });

  res.status(200).json({
    status: "success",
    message: "Password changed successfully",
  });
});

const addBankDetails = catchAsync(async (req, res, next) => {
  //1 create error if user POSTs password data
  if (req.body.password) {
    return next(new AppError("This route isnt for updating password", 400));
  }
  //2 Filter unwanted fields
  const filteredBody = filterObj(req.body, "bank_details");

  //2 Update user data
  const updatedVendor = await Vendor.findByIdAndUpdate(
    req.vendor.id,
    filteredBody,
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    status: "success",
    data: {
      vendor: updatedVendor,
    },
  });
});

const getBankDetails = catchAsync(async (req, res, next) => {
  const bank_details = await Vendor.findById({
    _id: req.params.id,
  }).select("bank_details");

  if (!bank_details) {
    return next(new AppError(`no vendor with id : ${req.params.id}`, 400));
  }
  res.status(200).json({ data: bank_details });
});

const getAllVendors = catchAsync(async (req, res, next) => {
  const vendors = await Vendor.find({});

  if (!vendors) {
    return next(new AppError(`no vendors`));
  }
  res.status(200).json({total: vendors.length, data:{ vendors} });
});

const getVendorsByName = catchAsync(async (req, res, next) => {

	const vendor = await Vendor.findOne({brand_name: req.params.brand_name});

	if(!vendor){
		return next(new AppError(`no vendor with brand name ${req.params.brand_name}`))
	}
	res.status(200).json({data: vendor});
});

module.exports = {
  signup,
  login,
  forgotPassword,
  resetPassword,
  updatePassword,
  confirmEmail,
  resendEmail,
  protect,
  logout,
  addBankDetails,
  getBankDetails,
  getAllVendors,
  getVendorsByName
};
