const Product = require("../models/product");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

const getAllProducts = catchAsync(async (req, res, next) => {
  const products = await Product.find({vendor_id: req.vendor.id});

  if (!products) {
    return next(new AppError("There are no products", 404));
  }

  res.status(200).json({
    status: "success",
    total: products.length,
    data: { products }
  });
});

const getProductById = catchAsync(async (req, res, next) => {
  const product = await Product.findById({ _id: req.params.id, vendor_id: req.vendor.id });

  if (!product) {
    return next(new AppError(`No product with id : ${req.params.id}`, 404));
  }

  res.status(200).json({ status: "success", data: product });
});

const createProduct = catchAsync(async (req, res) => {
  const { name, price, image, type, variation } = req.body;
  const vendor_id = req.vendor.id
  const vendor = req.vendor.brand_name

  const newProduct = await Product.create({
    name,
    price,
    image,
    type,
    vendor_id,
    vendor,
    variation
  });
  res.status(201).json({ status: "success", data: newProduct });
});

const updateProduct = catchAsync(async (req, res, next) => {
  const updatedProduct = await Product.findOneAndUpdate(
    { _id: req.params.id, vendor_id: req.vendor.id },
    req.body,
    {
      new: true,
      runValidators: true
    }
  );

  if (!updatedProduct) {
    return next(new AppError(`No product with id : ${req.params.id}`, 404));
  }

  res.status(200).json({ status: "success", data: updatedProduct });
});

const deleteProduct = catchAsync(async (req, res, next) => {
  const deletedProduct = await Product.findOneAndDelete({ _id: req.params.id, vendor_id: req.vendor.id});

  if (!deletedProduct) {
    return next(new AppError(`No product with id : ${req.params.id}`, 404));
  }

  res.status(204).json({ message: "Product deleted successfully!" });
});

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
