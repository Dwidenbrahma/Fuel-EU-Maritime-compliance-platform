// src/core/domain/ship.ts

export interface Ship {
  id: string;
  name?: string;
  imoNumber?: string;
  shipType?: string;
  grt?: number;
}

export const createShip = (id: string, overrides?: Partial<Ship>): Ship => ({
  id,
  ...overrides,
});
