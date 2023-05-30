const express = require("express");
const { protect } = require("../controllers/vendor")

const {

  createMFee,
  getAllMFee,
  getMFeeById,
  updateMFee,
  deleteMFee
} = require("../controllers/miscellaneousFee");

const router = express.Router();

router.route("/").post(protect, createMFee).get(getAllMFee);
router.route("/:id").get(protect, getMFeeById).patch(protect, updateMFee).delete(protect, deleteMFee);

module.exports = router;
