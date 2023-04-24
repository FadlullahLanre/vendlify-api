const express = require("express");
const {
 
  createBrandService,
  getAllBrandServices,
  getBrandServiceById,
  updateBrandService,
  deleteBrandService
} = require("../controllers/brandService");

const router = express.Router();

router.route("/").post(createBrandService).get(getAllBrandServices);
router.route("/:id").get(getBrandServiceById).patch(updateBrandService).delete(deleteBrandService);

module.exports = router;
