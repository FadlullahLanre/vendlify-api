const mFee = require("../models/miscellaneousFee");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

const getAllMFee = catchAsync(async (req, res, next) => {
  const miscellaneousFee = await mFee.find({vendor_id: req.params.id});

  if (!miscellaneousFee) {
    return next(new AppError("There are no miscellaneous fee", 404));
  }

  res.status(200).json({
    status: "success",
    total: miscellaneousFee.length,
    data: { miscellaneousFee }
  });
});

// const getMFeeById = catchAsync(async (req, res, next) => {
//   const miscellaneousFee = await mFee.findById({ _id: req.params.id, vendor_id: req.params.id });

//   if (!miscellaneousFee) {
//     return next(new AppError(`No miscellaneousFee with id : ${req.params.id}`, 404));
//   }

//   res.status(200).json({ status: "success", data: miscellaneousFee });
// });

const createMFee = catchAsync(async (req, res) => {

  const { item_name, price} = req.body;
  const vendor_id = req.vendor.id
  const vendor = req.vendor.brand_name


  const newMFee = await mFee.create({
    item_name, price, vendor_id, vendor
  });
  res.status(201).json({ status: "success", data: newMFee });
});

const updateMFee = catchAsync(async (req, res, next) => {
  const updatedMFee = await mFee.findOneAndUpdate(
    { _id: req.params.id, vendor_id: req.vendor.id },
    req.body,
    {
      new: true,
      runValidators: true
    }
  );

  if (!updatedMFee) {
    return next(new AppError(`No miscellaneous fee with id : ${req.params.id}`, 404));
  }

  res.status(200).json({ status: "success", data: updatedMFee });
});

const deleteMFee = catchAsync(async (req, res, next) => {
  const deletedMFee = await mFee.findOneAndDelete({ _id: req.params.id, vendor_id:req.vendor.id });

  if (!deletedMFee) {
    return next(new AppError(`No miscellaneous fee with id : ${req.params.id}`, 404));
  }

  res.status(204).json({ message: "Miscellaneous Fee deleted successfully!" });
});

module.exports = {
  getAllMFee,
  createMFee,
  updateMFee,
  deleteMFee
};
