const request = require("supertest");
const app = require("../../app");
const db = require("./setup-db");
const Vehicle = require("../../models/Vehicle");
const User = require("../../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

beforeAll(async () => {
  await db.connect();

  const hash = await bcrypt.hash("userpass", 12);
  const user = await User.create({
    userName: "shopper",
    email: "shopper@test.com",
    password: hash,
    role: "user",
    isVerified: true,
  });
  // seed some vehicles
  await Vehicle.create([
    {
      identifier: "m1",
      title: "M1",
      description: "",
      images: [],
      price: 30,
      salePrice: 0,
      isAvailable: true,
      year: 2018,
      location: "Cluj",
      averageReview: 0,
    },
    {
      identifier: "m2",
      title: "M2",
      description: "",
      images: [],
      price: 40,
      salePrice: 0,
      isAvailable: true,
      year: 2019,
      location: "Cluj",
      averageReview: 0,
    },
  ]);
});

afterEach(async () => await db.clearDatabase());
afterAll(async () => await db.closeDatabase());

describe("Shop vehicles listing (Customer)", () => {
  it("GET /api/shop/vehicles/get → 200 with data", async () => {
    const res = await request(app).get("/api/shop/vehicles/get");

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("success", true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(2);
  });
});
