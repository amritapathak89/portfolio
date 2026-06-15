const request = require("supertest");
const app = require("../src/app");

describe("Backend smoke tests", () => {
  it("GET / responds with health message", async () => {
    const res = await request(app).get("/");
    expect(res.status).toBe(200);
    expect(res.text).toMatch(/Backend is working/);
  });

  it("POST /submit-form rejects an empty payload", async () => {
    const res = await request(app).post("/submit-form").send({});
    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
  });

  it("POST /submit-form rejects an invalid email", async () => {
    const res = await request(app)
      .post("/submit-form")
      .send({ name: "Test", email: "not-an-email", message: "Hi" });
    expect(res.status).toBe(400);
  });

  it("POST /submit-form silently accepts honeypot submissions (no DB write)", async () => {
    const res = await request(app)
      .post("/submit-form")
      .send({ name: "Bot", email: "bot@example.com", message: "spam", website: "http://spam" });
    expect(res.status).toBe(200);
  });
});
