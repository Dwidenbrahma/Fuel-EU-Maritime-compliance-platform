// src/core/application/pooling/createPool.ts

import { ComplianceRepository } from "../../ports/complianceRepository";
import { PoolingRepository } from "../../ports/poolingRepository";

export function makeCreatePool(
  complianceRepo: ComplianceRepository,
  poolingRepo: PoolingRepository
) {
  return async function createPool(shipIds: string[], year: number) {
    // 1. Fetch adjusted CB for all ships
    const members = [];
    for (const shipId of shipIds) {
      const cb = await complianceRepo.getAdjustedCB(shipId, year);
      if (!cb) throw new Error(`Missing adjusted CB for ship ${shipId}`);

      members.push({
        ship_id: shipId,
        cb_before: cb.adjustedCB,
        cb_after: cb.adjustedCB, // will be modified
      });
    }

    // 2. Validate rule: sum(adjustedCB) >= 0
    const sum = members.reduce((s, m) => s + m.cb_before, 0);
    if (sum < 0) throw new Error("Pool invalid: total CB must be >= 0");

    // 3. Apply greedy allocation
    const surplus = members.filter((m) => m.cb_before > 0);
    const deficit = members.filter((m) => m.cb_before < 0);

    surplus.sort((a, b) => b.cb_before - a.cb_before);
    deficit.sort((a, b) => a.cb_before - b.cb_before);

    for (const d of deficit) {
      let needed = -d.cb_after;
      for (const s of surplus) {
        if (s.cb_after <= 0) continue;
        if (needed <= 0) break;

        const give = Math.min(s.cb_after, needed);
        s.cb_after -= give;
        d.cb_after += give;
        needed -= give;
      }
    }

    // 4. Final validation rules
    if (members.some((m) => m.cb_after < 0))
      throw new Error("Surplus ship ended negative → invalid pool");
    if (members.some((m) => m.cb_after < m.cb_before))
      throw new Error("Deficit ship exits worse → invalid pool");

    // 5. Store pool + members
    const poolId = await poolingRepo.createPool(year);
    await poolingRepo.addPoolMembers(poolId, members);

    return {
      poolId,
      members,
      totalCB: sum,
    };
  };
}
