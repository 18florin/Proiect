const request = require("supertest");
const app = require("../../app");
const db = require("./setup-db");
const User = require("../../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

let adminToken;

beforeAll(async () => {
  await db.connect();
  // create an admin
  const hash = await bcrypt.hash("adminpass", 12);
  const admin = await User.create({
    userName: "admin",
    email: "admin@test.com",
    password: hash,
    role: "admin",
    isVerified: true,
  });
  adminToken = jwt.sign(
    { id: admin._id, role: "admin" },
    process.env.JWT_SECRET_KEY,
    { expiresIn: "60m" }
  );
});

afterEach(async () => await db.clearDatabase());
afterAll(async () => await db.closeDatabase());

describe("Vehicle CRUD (Admin)", () => {
  const base = "/api/admin/vehicles";

  it("POST /add → 201 with valid data", async () => {
    const payload = {
      identifier: "veh-001",
      title: "Tesla Model 3",
      description: "Electric car",
      category: "electric",
      brand: "Tesla",
      price: 100,
      salePrice: 0,
      isAvailable: true,
      year: 2022,
      location: "Bucharest",
    };
    const res = await request(app)
      .post(`${base}/add`)
      .set("Cookie", `token=${adminToken}`)
      .send(payload);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("success", true);
    expect(res.body.data).toHaveProperty("_id");
    expect(res.body.data).toHaveProperty("identifier", "veh-001");
  });

  it("POST /add → 400 when missing required fields", async () => {
    const res = await request(app)
      .post(`${base}/add`)
      .set("Cookie", `token=${adminToken}`)
      .send({
        title: "No identifier",
      });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("success", false);
  });

  it("GET /get → returns list of vehicles", async () => {
    await request(app)
      .post(`${base}/add`)
      .set("Cookie", `token=${adminToken}`)
      .send({
        identifier: "veh-A",
        title: "A",
        description: "Desc",
        category: "cat",
        brand: "BrandA",
        price: 50,
        year: 2020,
        location: "Cluj",
      });

    const res = await request(app)
      .get(`${base}/get`)
      .set("Cookie", `token=${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("success", true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(1);
  });

  it("PUT /edit/:id → updates a vehicle", async () => {
    const post = await request(app)
      .post(`${base}/add`)
      .set("Cookie", `token=${adminToken}`)
      .send({
        identifier: "veh-B",
        title: "B",
        description: "Desc",
        category: "cat",
        brand: "BrandB",
        price: 60,
        year: 2021,
        location: "Timisoara",
      });

    const id = post.body.data._id;
    const res = await request(app)
      .put(`${base}/edit/${id}`)
      .set("Cookie", `token=${adminToken}`)
      .send({ price: 75 });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("success", true);
    expect(res.body.data).toHaveProperty("price", 75);
  });

  it("DELETE /delete/:id → deletes a vehicle", async () => {
    const post = await request(app)
      .post(`${base}/add`)
      .set("Cookie", `token=${adminToken}`)
      .send({
        identifier: "veh-C",
        title: "C",
        description: "Desc",
        category: "cat",
        brand: "BrandC",
        price: 80,
        year: 2019,
        location: "Iasi",
      });

    const id = post.body.data._id;
    const res = await request(app)
      .delete(`${base}/delete/${id}`)
      .set("Cookie", `token=${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("success", true);
    expect(res.body).toHaveProperty("message", "Vehicle deleted");
  });
});
