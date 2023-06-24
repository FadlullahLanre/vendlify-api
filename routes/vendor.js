const express = require('express');
const router = express.Router();
const cloudinary = require("../utils/cloudinary");
const upload = require("../utils/multer");
const Vendor = require("../models/vendor");


const {
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
	getAllVendors,
	getBankDetails,
	getVendorsByName,
	updateVendor
} = require('../controllers/vendor');


router.route('/login').post(login);
router.route('/signup').post(signup);
router.route('/forgotPassword').post(forgotPassword);
router.route('/resendEmail').post(resendEmail);
router.route('/updatePassword').post(protect,updatePassword);
router.route('/bank-details/:id').get(getBankDetails);
router.route('/bank-details/').post(protect, addBankDetails)
router.route('/resetPassword/:token').post(resetPassword);
router.route('/confirmEmail/:token').get(confirmEmail);
router.route('/logout').get(protect, logout);
router.route('/').get(getAllVendors);
router.route('/:brand_name').get(getVendorsByName);
router.route('/update-vendor').patch(protect, updateVendor)



// update vendor image
router.patch("/update-image/", protect, upload.single("image",), async (req, res, next) => {
	try {
  
	  const vendor_id = req.vendor.id
  
	  // Upload image to cloudinary
	  await cloudinary.uploader.upload(req.file.path, {folder: 'Vendlify'}, (err, result) => {
		if (err) {
		  return res.status(400).json({ message: 'Error uploading image' })
		}
		const brand_img = result.secure_url
		const cloudinary_id = result.public_id
  
		// update vendor profile
		Vendor.findByIdAndUpdate(vendor_id, {
		  brand_img: brand_img,
		  cloudinary_id: cloudinary_id

		}, { new: true }, (err, vendor) => {
		  if (err) {
			return res.status(400).json({ message: 'Error updating vendor image' });
		  }
		  res.status(200).json(vendor);
  
		});
	  });
	} catch (err) {
	  console.log(err);
	}
  });

module.exports = router;
