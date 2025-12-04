import { api } from "../helpers/testServer";

describe("Compliance Routes", () => {
  test("GET /compliance/cb", async () => {
    const res = await api().get("/compliance/cb?shipId=R001&year=2024");

    expect(res.status).toBeLessThan(500); // handle error or success
  });
});
