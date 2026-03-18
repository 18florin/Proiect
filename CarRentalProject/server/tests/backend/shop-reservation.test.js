const request = require("supertest");
const app = require("../../app");
const db = require("./setup-db");
const User = require("../../models/User");
const Vehicle = require("../../models/Vehicle");
const Reservation = require("../../models/Reservation");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

let userToken, userId, vehicle;
const shopBase = "/api/shop/reservation";

beforeAll(async () => {
  await db.connect();

  // create & login user
  const passHash = await bcrypt.hash("custpass", 12);
  const user = await User.create({
    userName: "cust",
    email: "cust@shop.test",
    password: passHash,
    role: "user",
    isVerified: true,
  });
  userId = user._id.toString();
  userToken = jwt.sign(
    { id: userId, role: "user" },
    process.env.JWT_SECRET_KEY
  );

  // create a vehicle
  vehicle = await Vehicle.create({
    identifier: "testcar-001",
    title: "TestCar",
    description: "for reservations",
    images: [],
    price: 50,
    salePrice: 0,
    isAvailable: true,
    year: 2023,
    location: "Cluj",
    averageReview: 0,
  });
});

afterEach(async () => {
  await Reservation.deleteMany({});
});
afterAll(async () => {
  await db.closeDatabase();
});

describe("Shop Reservations (Customer)", () => {
  it("POST /create → 201 and returns reservation", async () => {
    const payload = {
      userId,
      vehicles: [{ vehicleId: vehicle._id, quantity: 1, price: vehicle.price }],
      startDate: "2025-10-01",
      endDate: "2025-10-05",
      addressInfo: {
        address: "Strada Principală 1",
        city: "Cluj",
        pincode: "400000",
        phone: "0712345678",
        notes: "Niciun comentariu",
      },
    };

    const res = await request(app)
      .post(`${shopBase}/create`)
      .set("Cookie", `token=${userToken}`)
      .send(payload);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("success", true);
    expect(res.body.data).toHaveProperty("_id");
  });

  it("GET /list/:userId → 200 and array of reservations", async () => {
    await request(app)
      .post(`${shopBase}/create`)
      .set("Cookie", `token=${userToken}`)
      .send({
        userId,
        vehicles: [{ vehicleId: vehicle._id, quantity: 2, price: 50 }],
        startDate: "2025-11-01",
        endDate: "2025-11-04",
        addressInfo: {
          address: "Aleea Test",
          city: "Cluj",
          pincode: "400000",
          phone: "072200300",
          notes: "",
        },
      });

    const res = await request(app)
      .get(`${shopBase}/list/${userId}`)
      .set("Cookie", `token=${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("success", true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(1);
  });

  it("GET /details/:id → 200 and single reservation", async () => {
    const crt = await request(app)
      .post(`${shopBase}/create`)
      .set("Cookie", `token=${userToken}`)
      .send({
        userId,
        vehicles: [{ vehicleId: vehicle._id, quantity: 1, price: 50 }],
        startDate: "2025-12-10",
        endDate: "2025-12-11",
        addressInfo: {
          address: "Str. Unirii 2",
          city: "Cluj",
          pincode: "400000",
          phone: "073300400",
          notes: "Please hurry",
        },
      });
    const id = crt.body.data._id;

    const res = await request(app)
      .get(`${shopBase}/details/${id}`)
      .set("Cookie", `token=${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("success", true);
    expect(res.body.data).toHaveProperty("_id", id);
    expect(res.body.data).toHaveProperty("vehicles");
  });

  it("DELETE /cancel/:id → 200 and marks reservation cancelled", async () => {
    const crt = await request(app)
      .post(`${shopBase}/create`)
      .set("Cookie", `token=${userToken}`)
      .send({
        userId,
        vehicles: [{ vehicleId: vehicle._id, quantity: 1, price: 50 }],
        startDate: "2026-01-01",
        endDate: "2026-01-02",
        addressInfo: {
          address: "Bd. Testare 3",
          city: "Cluj",
          pincode: "400000",
          phone: "074400500",
          notes: "",
        },
      });
    const id = crt.body.data._id;

    const res = await request(app)
      .delete(`${shopBase}/cancel/${id}`)
      .set("Cookie", `token=${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("success", true);
    expect(res.body).toHaveProperty("message", "Reservation cancelled");

    const updated = await Reservation.findById(id);
    expect(updated.reservationStatus).toBe("cancelled");
  });
});
