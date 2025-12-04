export function makeMockComplianceRepo() {
  return {
    saveSnapshot: vi.fn(),
    getComplianceBalance: vi.fn(),
    getAppliedBankEntries: vi.fn(),
  };
}
