const mongoose = require("mongoose");

const VehicleSchema = new mongoose.Schema(
  {
    identifier: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    images: { type: [String], default: [] },
    title: String,
    description: String,
    category: String,
    brand: String,
    year: {
      type: Number,
      required: true,
      min: 1900,
      max: new Date().getFullYear() + 1,
    },
    price: Number,
    salePrice: Number,
    isAvailable: {
      type: Boolean,
      default: true,
    },
    location: { type: String, required: true },
    averageReview: Number,
    currentReservation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Reservation",
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Vehicle", VehicleSchema);
