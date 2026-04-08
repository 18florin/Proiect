//server/routes/admin/vehicles-routes.js
const express = require("express");

const {
  handleImagesUpload,
  addVehicle,
  editVehicle,
  fetchAllVehicles,
  deleteVehicle,
} = require("../../controllers/admin/vehicles-controller");

const { upload } = require("../../helpers/cloudinary");

const router = express.Router();

router.post("/upload-images", upload.array("images", 10), handleImagesUpload);
router.post("/add", addVehicle);
router.put("/edit/:id", editVehicle);
router.delete("/delete/:id", deleteVehicle);
router.get("/get", fetchAllVehicles);

module.exports = router;
