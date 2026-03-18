const VehicleReview = require("../../models/Review");

exports.getReviewsByVehicleId = async (req, res) => {
  try {
    const { productId } = req.params;
    if (!productId) {
      return res
        .status(400)
        .json({ success: false, message: "Missing productId" });
    }
    const reviews = await VehicleReview.find({ vehicleId: productId }).sort({
      createdAt: -1,
    });
    return res.status(200).json({ success: true, data: reviews });
  } catch (err) {
    console.error("Error fetching reviews:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.addReview = async (req, res) => {
  try {
    const { productId, userId, userName, reviewMessage, reviewValue } =
      req.body;
    if (
      !productId ||
      !userId ||
      !userName ||
      !reviewMessage ||
      reviewValue == null
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required review fields" });
    }

    const review = await VehicleReview.create({
      vehicleId: productId,
      userId,
      userName,
      reviewMessage,
      reviewValue,
    });

    return res.status(201).json({ success: true, data: review });
  } catch (err) {
    console.error("Error saving review:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
