import { api } from "../helpers/testServer";

describe("Pooling Routes", () => {
  test("POST /pooling/create fails for 1 ship", async () => {
    const res = await api()
      .post("/pools/create")
      .send({ shipIds: ["R001"], year: 2024 });

    expect(res.status).toBe(400);
  });
});
