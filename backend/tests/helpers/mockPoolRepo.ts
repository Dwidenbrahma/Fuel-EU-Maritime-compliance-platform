export function makeMockPoolRepo() {
  return {
    createPool: vi.fn(),
    addMember: vi.fn(),
    listPools: vi.fn(),
  };
}
