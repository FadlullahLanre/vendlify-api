const express = require("express");
const {
  createSchool,
  getAllSchools,
  getSchoolById,
  updateSchool,
  deleteSchool
} = require("../controllers/school");

const router = express.Router();

router.route("/").post(createSchool).get(getAllSchools);
router.route("/:id").get(getSchoolById).patch(updateSchool).delete(deleteSchool);

module.exports = router;
