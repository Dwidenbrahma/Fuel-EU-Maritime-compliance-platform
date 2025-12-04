import { makeBankSurplus } from "../../src/core/application/banking/bankSurplus";
import { makeMockComplianceRepo } from "../helpers/mockComplianceRepo";
import { makeMockBankingRepo } from "../helpers/mockBankingRepo";

describe("Bank Surplus", () => {
  test("creates bank entry when CB positive", async () => {
    const compliance = makeMockComplianceRepo();
    compliance.getComplianceBalance.mockResolvedValue({ cb_gco2eq: 500 });

    const banking = makeMockBankingRepo();
    banking.createBankEntry.mockResolvedValue({ id: "B001" });

    const bank = makeBankSurplus(banking as any, compliance as any);

    const result = await bank("R001", 2024);

    expect(result.cb_before).toBe(500);
    expect(banking.createBankEntry).toHaveBeenCalled();
  });

  test("throws on non-positive CB", async () => {
    const compliance = makeMockComplianceRepo();
    compliance.getComplianceBalance.mockResolvedValue({ cb_gco2eq: -20 });

    const banking = makeMockBankingRepo();
    const bank = makeBankSurplus(banking as any, compliance as any);

    await expect(bank("R001", 2024)).rejects.toThrow();
  });
});
