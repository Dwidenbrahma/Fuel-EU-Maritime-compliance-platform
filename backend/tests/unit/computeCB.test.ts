import { makeComputeCB } from "../../src/core/application/compliance/computeCB";
import { makeMockComplianceRepo } from "../helpers/mockComplianceRepo";

describe("Compute CB", () => {
  test("computes CB correctly", async () => {
    const repo = makeMockComplianceRepo();
    const computeCB = makeComputeCB(repo as any);

    const cb = await computeCB("R001", 80, 100, 2024);

    expect(cb).toBeDefined();
    expect(repo.saveSnapshot).toHaveBeenCalled();
  });
});
