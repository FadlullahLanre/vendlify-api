const express = require("express");
const { protect } = require("../controllers/vendor")

const {

  createMFee,
  getAllMFee,
  updateMFee,
  deleteMFee
} = require("../controllers/miscellaneousFee");

const router = express.Router();

router.route("/").post(protect, createMFee)
router.route("/:id").get(getAllMFee).patch(protect, updateMFee).delete(protect, deleteMFee);

module.exports = router;
