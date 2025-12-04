import { makeCreatePool } from "../../src/core/application/pooling/createPool";
import { makeMockPoolRepo } from "../helpers/mockPoolRepo";

describe("Create Pool", () => {
  test("throws when fewer than 2 ships", async () => {
    const repo = makeMockPoolRepo();
    const createPool = makeCreatePool(repo as any);

    await expect(createPool(["R001"])).rejects.toThrow();
  });
});
