const request = require("supertest");
const app = require("../../app");
const db = require("./setup-db");
const User = require("../../models/User");
const Vehicle = require("../../models/Vehicle");
const Reservation = require("../../models/Reservation");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

let adminToken, userId, vehicle, reservationId;
const adminBase = "/api/admin/reservations";

beforeAll(async () => {
  await db.connect();

  // create customer
  const hU = await bcrypt.hash("userpass", 12);
  const usr = await User.create({
    userName: "buyer",
    email: "buyer@shop.test",
    password: hU,
    role: "user",
    isVerified: true,
  });
  userId = usr._id.toString();

  // create admin
  const hA = await bcrypt.hash("adminpass", 12);
  const adm = await User.create({
    userName: "boss",
    email: "boss@admin.test",
    password: hA,
    role: "admin",
    isVerified: true,
  });
  adminToken = jwt.sign(
    { id: adm._id, role: "admin" },
    process.env.JWT_SECRET_KEY
  );

  // create a vehicle
  vehicle = await Vehicle.create({
    identifier: "admincar-001",
    title: "AdminCar",
    description: "For admin tests",
    images: [],
    price: 80,
    salePrice: 0,
    isAvailable: true,
    year: 2021,
    location: "Timisoara",
    averageReview: 0,
  });

  const shopToken = jwt.sign(
    { id: userId, role: "user" },
    process.env.JWT_SECRET_KEY
  );
  const crt = await request(app)
    .post("/api/shop/reservation/create")
    .set("Cookie", `token=${shopToken}`)
    .send({
      userId,
      vehicles: [{ vehicleId: vehicle._id, quantity: 1, price: 80 }],
      startDate: "2025-09-10",
      endDate: "2025-09-12",
      addressInfo: {
        address: "Admin St. 5",
        city: "Timisoara",
        pincode: "300000",
        phone: "075500600",
        notes: "",
      },
    });
  reservationId = crt.body.data._id;
});

afterAll(async () => {
  await Reservation.deleteMany({});
  await db.closeDatabase();
});

describe("Admin Reservations (Admin)", () => {
  it("GET / → 200 and array of all reservations", async () => {
    const res = await request(app)
      .get(`${adminBase}/`)
      .set("Cookie", `token=${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("success", true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it("GET /:id → 200 and single reservation detail", async () => {
    const res = await request(app)
      .get(`${adminBase}/${reservationId}`)
      .set("Cookie", `token=${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("success", true);
    expect(res.body.data).toHaveProperty("_id", reservationId);
  });

  it("PUT /:id/status → 200 and updates status", async () => {
    const res = await request(app)
      .put(`${adminBase}/${reservationId}/status`)
      .set("Cookie", `token=${adminToken}`)
      .send({ reservationStatus: "confirmed" });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("success", true);
    expect(res.body.data).toHaveProperty("reservationStatus", "confirmed");

    const v = await Vehicle.findById(vehicle._id);
    expect(v.isAvailable).toBe(false);
  });
});
