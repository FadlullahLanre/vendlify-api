const dFee = require("../models/deliveryFee");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

const getAllDFee = catchAsync(async (req, res, next) => {
  const deliveryFee = await dFee.find({vendor_id: req.vendor.id});

  if (!deliveryFee) {
    return next(new AppError("There are no delivery fees", 404));
  }

  res.status(200).json({
    status: "success",
    total: deliveryFee.length,
    data: { deliveryFee }
  });
});

const getDFeeById = catchAsync(async (req, res, next) => {
  const deliveryFee = await dFee.findById({ _id: req.params.id, vendor_id: req.vendor.id });

  if (!deliveryFee) {
    return next(new AppError(`No delivery Fee with id : ${req.params.id}`, 404));
  }

  res.status(200).json({ status: "success", data: deliveryFee });
});

const createDFee = catchAsync(async (req, res) => {

  const { location, price} = req.body;
  const vendor_id = req.vendor.id
  const vendor = req.vendor.brand_name

  const newDFee = await dFee.create({
    location, price, vendor_id, vendor
  });
  res.status(201).json({ status: "success", data: newDFee });
});

const updateDFee = catchAsync(async (req, res, next) => {
  const updatedDFee = await dFee.findOneAndUpdate(
    { _id: req.params.id, vendor_id: req.vendor.id },
    req.body,
    {
      new: true,
      runValidators: true
    }
  );

  if (!updatedDFee) {
    return next(new AppError(`No delivery fee with id : ${req.params.id}`, 404));
  }

  res.status(200).json({ status: "success", data: updatedMFee });
});

const deleteDFee = catchAsync(async (req, res, next) => {
  const deletedDFee = await dFee.findOneAndDelete({ _id: req.params.id, vendor_id:req.vendor.id });

  if (!deletedDFee) {
    return next(new AppError(`No Delivery fee with id : ${req.params.id}`, 404));
  }

  res.status(204).json({ message: "Delivery Fee deleted successfully!" });
});

module.exports = {
  getAllDFee,
  getDFeeById,
  createDFee,
  updateDFee,
  deleteDFee
};
