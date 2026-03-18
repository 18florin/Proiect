const express = require("express");

const {
  getFilteredVehicles,
  getVehicleDetails,
} = require("../../controllers/shop/vehicles-controller");

const router = express.Router();

router.get("/get", getFilteredVehicles);
router.get("/get/:id", getVehicleDetails);

module.exports = router;
