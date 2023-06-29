const express = require("express");
const {protect} = require("../controllers/vendor");

const {
    createDFee,
    getAllDFee,
    updateDFee,
    deleteDFee

} = require("../controllers/deliveryFee");



const router = express.Router();

router.route("/").post(protect, createDFee);
router.route("/:id").get(getAllDFee).patch(protect, updateDFee).delete(protect, deleteDFee);

module.exports = router;
