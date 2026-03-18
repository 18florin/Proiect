const express = require("express");
const {
  getAllReservationsForAdmin,
  getReservationDetailsForAdmin,
  updateReservationStatus,
} = require("../../controllers/admin/reservation-controller");
const { authMiddleware } = require("../../controllers/auth/auth-controller");

const router = express.Router();

router.use(authMiddleware);

router.get("/", getAllReservationsForAdmin);

router.get("/:id", getReservationDetailsForAdmin);

router.put("/:id/status", updateReservationStatus);

module.exports = router;
