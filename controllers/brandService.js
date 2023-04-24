const BrandService = require("../models/brandService");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

const getAllBrandServices = catchAsync(async (req, res, next) => {
  const brand_services = await BrandService.find({});

  if (!brand_services) {
    return next(new AppError("There are no brand services", 404));
  }

  res.status(200).json({
    status: "success",
    total: brand_services.length,
    data: { brand_services }
  });
});

const getBrandServiceById = catchAsync(async (req, res, next) => {
  const brand_service = await BrandService.findById({ _id: req.params.id });

  if (!brand_service) {
    return next(new AppError(`No brand_service with id : ${req.params.id}`, 404));
  }

  res.status(200).json({ status: "success", data: brand_service });
});

const createBrandService = catchAsync(async (req, res) => {
  const { name } = req.body;
  const newBrandService = await BrandService.create({
    name
  });
  res.status(201).json({ status: "success", data: newBrandService });
});

const updateBrandService= catchAsync(async (req, res, next) => {
  const updatedBrandService = await BrandService.findOneAndUpdate(
    { _id: req.params.id },
    req.body,
    {
      new: true,
      runValidators: true
    }
  );

  if (!updatedBrandService) {
    return next(new AppError(`No brand service with id : ${req.params.id}`, 404));
  }

  res.status(200).json({ status: "success", data: updatedBrandService });
});

const deleteBrandService = catchAsync(async (req, res, next) => {
  const deletedBrandService = await BrandService.findOneAndDelete({ _id: req.params.id });

  if (!deletedBrandService) {
    return next(new AppError(`No brand service with id : ${req.params.id}`, 404));
  }

  res.status(204).json({ message: "Brand Service deleted successfully!" });
});

module.exports = {
  getAllBrandServices,
  getBrandServiceById,
  createBrandService,
  updateBrandService,
  deleteBrandService
};
