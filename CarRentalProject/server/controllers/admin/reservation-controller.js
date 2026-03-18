const Reservation = require("../../models/Reservation");
const Vehicle = require("../../models/Vehicle");

async function getAllReservationsForAdmin(req, res) {
  try {
    const list = await Reservation.find().populate("userId", "userName email");
    res.json({ success: true, data: list });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

async function getReservationDetailsForAdmin(req, res) {
  try {
    const { id } = req.params;
    const r = await Reservation.findById(id)
      .populate("userId", "userName email")
      .populate("vehicles.vehicleId", "title image price salePrice");
    if (!r) {
      return res.status(404).json({ success: false, message: "Not found" });
    }
    res.json({ success: true, data: r });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

async function updateReservationStatus(req, res) {
  try {
    const { id } = req.params;
    const { reservationStatus } = req.body;
    const allowed = ["pending", "confirmed", "rejected", "cancelled"];
    if (!allowed.includes(reservationStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }
    const r = await Reservation.findByIdAndUpdate(
      id,
      { reservationStatus },
      { new: true }
    );
    if (!r) {
      return res.status(404).json({ success: false, message: "Not found" });
    }

    if (reservationStatus === "confirmed") {
      for (const item of r.vehicles) {
        const v = await Vehicle.findById(item.vehicleId);
        if (!v) continue;
        v.isAvailable = false;
        v.currentReservation = r._id;
        await v.save();
      }
    }

    if (["rejected", "cancelled"].includes(reservationStatus)) {
      for (const item of r.vehicles) {
        const v = await Vehicle.findById(item.vehicleId);
        if (!v) continue;
        v.isAvailable = true;
        v.currentReservation = null;
        await v.save();
      }
    }

    res.json({ success: true, data: r, message: "Status updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

module.exports = {
  getAllReservationsForAdmin,
  getReservationDetailsForAdmin,
  updateReservationStatus,
};
