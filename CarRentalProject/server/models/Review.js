const mongoose = require("mongoose");

const VehicleReviewSchema = new mongoose.Schema(
  {
    vehicleId: String,
    userId: String,
    userName: String,
    reviewMessage: String,
    reviewValue: Number,
  },
  { timestamps: true }
);

module.exports = mongoose.model("VehicleReview", VehicleReviewSchema);
