import { makeApplyBank } from "../../src/core/application/banking/applyBank";
import { makeMockComplianceRepo } from "../helpers/mockComplianceRepo";
import { makeMockBankingRepo } from "../helpers/mockBankingRepo";

describe("Apply Bank", () => {
  test("applies banked amount FIFO", async () => {
    const compliance = makeMockComplianceRepo();
    compliance.getComplianceBalance.mockResolvedValue({ cb_gco2eq: -100 });

    const banking = makeMockBankingRepo();
    banking.getAvailableBanked.mockResolvedValue(200);
    banking.applyBankedAmount.mockResolvedValue(150);

    const apply = makeApplyBank(banking as any, compliance as any);

    const result = await apply("R001", 2024, 150);

    expect(result.applied).toBe(150);
    expect(result.cb_after).toBe(50);
  });

  test("rejects over-apply", async () => {
    const compliance = makeMockComplianceRepo();
    const banking = makeMockBankingRepo();

    banking.getAvailableBanked.mockResolvedValue(50);

    const apply = makeApplyBank(banking as any, compliance as any);

    await expect(apply("R001", 2024, 100)).rejects.toThrow();
  });
});
