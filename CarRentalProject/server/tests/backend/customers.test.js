const request = require("supertest");
const app = require("../../app");
const db = require("./setup-db");
const User = require("../../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

let adminToken;

beforeAll(async () => {
  await db.connect();
  const hash = await bcrypt.hash("admin", 12);
  const admin = await User.create({
    userName: "custAdmin",
    email: "cust@test.com",
    password: hash,
    role: "admin",
    isVerified: true,
  });
  adminToken = jwt.sign(
    { id: admin._id, role: "admin" },
    process.env.JWT_SECRET_KEY
  );
});

afterEach(async () => await db.clearDatabase());
afterAll(async () => await db.closeDatabase());

describe("Customer Management (Admin)", () => {
  it("GET /api/admin/customers → 200 and empty list initially", async () => {
    const res = await request(app)
      .get("/api/admin/customers")
      .set("Cookie", `token=${adminToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(0);
  });

  it("GET /api/admin/customers?search=notfound → 200 and empty list when no match", async () => {
    const res = await request(app)
      .get("/api/admin/customers?search=notfound@test.com")
      .set("Cookie", `token=${adminToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(0);
  });
});
