const express = require("express");
const {
  getReviewsByVehicleId,
  addReview,
} = require("../../controllers/shop/review-controller");
const router = express.Router();

router.post("/", addReview);
router.get("/:productId", getReviewsByVehicleId);

module.exports = router;
