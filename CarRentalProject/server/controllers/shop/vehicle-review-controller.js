const Reservation = require("../../models/Reservation");
const Vehicle = require("../../models/Vehicle");
const VehicleReview = require("../../models/Review");

const addVehicleReview = async (req, res) => {
  try {
    const { vehicleId, userId, userName, reviewMessage, reviewValue } =
      req.body;

    const reservation = await Reservation.findOne({
      userId,
      "cartItems.vehicleId": vehicleId,
    });

    if (!reservation) {
      return res.status(403).json({
        success: false,
        message: "You need to reserve a vehicle to review it.",
      });
    }

    const checkExistingReview = await VehicleReview.findOne({
      vehicleId,
      userId,
    });

    if (checkExistingReview) {
      return res.status(400).json({
        success: false,
        message: "You already reviewed this vehicle!",
      });
    }

    const newReview = new VehicleReview({
      vehicleId,
      userId,
      userName,
      reviewMessage,
      reviewValue,
    });

    await newReview.save();

    const reviews = await VehicleReview.find({ vehicleId });
    const totalReviewsLength = reviews.length;
    const averageReview =
      reviews.reduce((sum, reviewItem) => sum + reviewItem.reviewValue, 0) /
      totalReviewsLength;

    await Vehicle.findByIdAndUpdate(vehicleId, { averageReview });

    res.status(201).json({
      success: true,
      data: newReview,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Error",
    });
  }
};

const getVehicleReviews = async (req, res) => {
  try {
    const { vehicleId } = req.params;

    const reviews = await VehicleReview.find({ vehicleId });
    res.status(200).json({
      success: true,
      data: reviews,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Error",
    });
  }
};

module.exports = { addVehicleReview, getVehicleReviews };
