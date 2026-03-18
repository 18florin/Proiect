const express = require("express");
const {
  createReservation,
  getReservationsByUserId,
  getReservationDetails,
  cancelReservation,
} = require("../../controllers/shop/reservation-controller");
const { authMiddleware } = require("../../controllers/auth/auth-controller");

const router = express.Router();

router.use(authMiddleware);

router.post("/create", createReservation);
router.get("/list/:userId", getReservationsByUserId);
router.get("/details/:id", getReservationDetails);
router.delete("/cancel/:id", cancelReservation);

module.exports = router;
