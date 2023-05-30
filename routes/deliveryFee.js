const express = require("express");
const {protect} = require("../controllers/vendor");

const {
    createDFee,
    getAllDFee,
    getDFeeById,
    updateDFee,
    deleteDFee

} = require("../controllers/deliveryFee");



const router = express.Router();

router.route("/").post(protect, createDFee).get(getAllDFee);
router.route("/:id").get(protect, getDFeeById).patch(protect, updateDFee).delete(protect, deleteDFee);

module.exports = router;
