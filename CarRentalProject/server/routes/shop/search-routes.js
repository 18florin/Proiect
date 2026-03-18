const express = require("express");

const { searchVehicles } = require("../../controllers/shop/search-controller");

const router = express.Router();

router.get("/:keyword", searchVehicles);

module.exports = router;
