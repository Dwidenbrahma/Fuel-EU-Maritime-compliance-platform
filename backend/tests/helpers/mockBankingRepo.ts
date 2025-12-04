export function makeMockBankingRepo() {
  return {
    createBankEntry: vi.fn(),
    listBankEntries: vi.fn(),
    getAvailableBanked: vi.fn(),
    applyBankedAmount: vi.fn(),
  };
}
