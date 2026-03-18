const Reservation = require("../../models/Reservation");
const Vehicle = require("../../models/Vehicle");

async function createReservation(req, res) {
  try {
    const { vehicles, startDate, endDate, addressInfo } = req.body;
    const userId = req.user.id;

    if (!Array.isArray(vehicles) || vehicles.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Must reserve at least one vehicle",
      });
    }

    const sd = new Date(startDate);
    const ed = new Date(endDate);
    const days = Math.ceil((ed - sd) / (1000 * 60 * 60 * 24)) || 1;

    const totalAmount = vehicles.reduce((sum, v) => {
      return sum + v.price * v.quantity * days;
    }, 0);

    const r = new Reservation({
      userId,
      vehicles,
      startDate,
      endDate,
      addressInfo,
      totalAmount,
    });

    await r.save();

    res.status(201).json({ success: true, data: r });
  } catch (err) {
    console.error(err);
    if (err.name === "ValidationError") {
      return res.status(400).json({ success: false, message: err.message });
    }
    res.status(500).json({ success: false, message: "Server error" });
  }
}

async function getReservationsByUserId(req, res) {
  try {
    const userId = req.user.id;
    const list = await Reservation.find({ userId })
      .sort({ reservationDate: -1 })
      .populate("vehicles.vehicleId", "title image price salePrice");
    return res.json({ success: true, data: list });
  } catch (err) {
    console.error("getReservationsByUserId error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

async function getReservationDetails(req, res) {
  try {
    const { id } = req.params;
    const r = await Reservation.findById(id)
      .populate("userId", "userName email")
      .populate("vehicles.vehicleId", "title image price salePrice");
    if (!r) {
      return res.status(404).json({ success: false, message: "Not found" });
    }
    return res.json({ success: true, data: r });
  } catch (err) {
    console.error("getReservationDetails error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

async function cancelReservation(req, res) {
  try {
    const { id } = req.params;
    const r = await Reservation.findByIdAndUpdate(
      id,
      { reservationStatus: "cancelled" },
      { new: true }
    );
    if (!r) {
      return res.status(404).json({ success: false, message: "Not found" });
    }
    return res.json({
      success: true,
      data: r,
      message: "Reservation cancelled",
    });
  } catch (err) {
    console.error("cancelReservation error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

module.exports = {
  createReservation,
  getReservationsByUserId,
  getReservationDetails,
  cancelReservation,
};
