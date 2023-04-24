const express = require("express");
const {protect} = require("../controllers/vendor");

const {
  
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct
} = require("../controllers/product");

const router = express.Router();

router.route("/").post(protect, createProduct).get(protect, getAllProducts);
router.route("/:id").get(protect, getProductById).patch(protect, updateProduct).delete(protect, deleteProduct);

module.exports = router;
