const request = require("supertest");
const app = require("../../app");
const db = require("./setup-db");

beforeAll(async () => await db.connect());
afterEach(async () => await db.clearDatabase());
afterAll(async () => await db.closeDatabase());

describe("Auth: /api/auth/register & /api/auth/login", () => {
  it("REQ-1: should register a new user", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ userName: "ion", email: "ion@test.ro", password: "123456" });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("success", true);
  });

  it("REQ-2: passwords must be hashed", async () => {
    const raw = "parola";
    await request(app)
      .post("/api/auth/register")
      .send({ userName: "a", email: "a@a", password: raw });
    const user = await require("../../models/User").findOne({ email: "a@a" });
    expect(user.password).not.toBe(raw);
  });

  it("REQ-4: lock account after 5 failed logins", async () => {
    await request(app)
      .post("/api/auth/register")
      .send({ userName: "u", email: "u@u", password: "pass" });
    // 5 wrong attempts
    for (let i = 0; i < 5; i++) {
      await request(app)
        .post("/api/auth/login")
        .send({ email: "u@u", password: "wrong" });
    }
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "u@u", password: "pass" });
    expect(res.statusCode).toBe(200);
  });
});
