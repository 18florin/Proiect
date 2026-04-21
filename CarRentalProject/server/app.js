// server/app.js
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");

// Routers
const authRouter = require("./routes/auth/auth-routes");
const adminVehiclesRouter = require("./routes/admin/vehicles-routes");
const adminReservationsRouter = require("./routes/admin/reservation-routes");
const adminCustomersRouter = require("./routes/admin/customer-routes");

const shopVehiclesRouter = require("./routes/shop/vehicles-routes");
const shopAddressRouter = require("./routes/shop/address-routes");
const shopReservationRouter = require("./routes/shop/reservation-routes");
const shopSearchRouter = require("./routes/shop/search-routes");
const shopVehicleReviewRouter = require("./routes/shop/review-routes");
const shopSavedRouter = require("./routes/shop/saved-routes");

const commonFeatureRouter = require("./routes/common/feature-routes");

const app = express();

// Middleware
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization", "Cache-Control"],
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(express.json());

// Rute
app.use("/api/auth", authRouter);

app.use("/api/admin/vehicles", adminVehiclesRouter);
app.use("/api/admin/reservations", adminReservationsRouter);
app.use("/api/admin/customers", adminCustomersRouter);

app.use("/api/shop/vehicles", shopVehiclesRouter);
app.use("/api/shop/address", shopAddressRouter);
app.use("/api/shop/reservation", shopReservationRouter);
app.use("/api/shop/search", shopSearchRouter);
app.use("/api/shop/vehicle-review", shopVehicleReviewRouter);
app.use("/api/shop/saved", shopSavedRouter);

app.use("/api/common/feature", commonFeatureRouter);

module.exports = app;
