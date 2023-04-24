const School = require("../models/school");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

const getAllSchools = catchAsync(async (req, res, next) => {
  const schools = await School.find({});

  if (!schools) {
    return next(new AppError("There are no brand services", 404));
  }

  res.status(200).json({
    status: "success",
    total: schools.length,
    data: { schools }
  });
});

const getSchoolById = catchAsync(async (req, res, next) => {
  const school = await School.findById({ _id: req.params.id });

  if (!school) {
    return next(new AppError(`No brand_service with id : ${req.params.id}`, 404));
  }

  res.status(200).json({ status: "success", data: school });
});

const createSchool = catchAsync(async (req, res) => {
  const { name } = req.body;
  const newSchool = await School.create({
    name
  });
  res.status(201).json({ status: "success", data: newSchool });
});

const updateSchool = catchAsync(async (req, res, next) => {
  const updatedSchool = await School.findOneAndUpdate(
    { _id: req.params.id },
    req.body,
    {
      new: true,
      runValidators: true
    }
  );

  if (!updatedSchool) {
    return next(new AppError(`No school with id : ${req.params.id}`, 404));
  }

  res.status(200).json({ status: "success", data: updatedSchool });
});

const deleteSchool = catchAsync(async (req, res, next) => {
  const deletedSchool = await School.findOneAndDelete({ _id: req.params.id });

  if (!deletedSchool) {
    return next(new AppError(`No school with id : ${req.params.id}`, 404));
  }

  res.status(204).json({ message: "School deleted successfully!" });
});

module.exports = {
  getAllSchools,
  getSchoolById,
  createSchool,
  updateSchool,
  deleteSchool
};
