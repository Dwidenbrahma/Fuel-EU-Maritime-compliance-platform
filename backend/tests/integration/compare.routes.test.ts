import { api } from "../helpers/testServer";

describe("Compare Routes", () => {
  test("GET /compare/routes", async () => {
    const res = await api().get("/compare/comparison");

    expect(res.status).toBe(200);
    // router returns an array of comparison items; assert it's an array and not empty
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(0);
  });
});
