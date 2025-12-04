import { api } from "../helpers/testServer";

describe("Banking Routes", () => {
  test("GET /banking/records", async () => {
    const res = await api().get("/banking/records?shipId=R001&year=2024");

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("entries");
  });
});
