"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeCreatePool = makeCreatePool;
function makeCreatePool(poolRepo) {
    return async function createPool(year, members) {
        // validate sum >= 0
        const sum = members.reduce((s, m) => s + m.cb_before, 0);
        if (sum < 0)
            throw new Error("Sum of CB must be >= 0");
        // greedy allocate: sort desc
        const sorted = [...members].sort((a, b) => b.cb_before - a.cb_before);
        // naive greedy: transfer surplus -> deficits until done
        // produce cb_after values (simple algorithm)
        let surplusPool = sorted
            .filter((m) => m.cb_before > 0)
            .map((m) => ({ ...m, remaining: m.cb_before }));
        const deficits = sorted
            .filter((m) => m.cb_before < 0)
            .map((m) => ({ ...m, need: -m.cb_before }));
        const afterMap = {};
        for (const d of deficits) {
            let need = d.need;
            for (const s of surplusPool) {
                if (need <= 0)
                    break;
                const give = Math.min(s.remaining, need);
                s.remaining -= give;
                need -= give;
            }
            afterMap[d.shipId] = -need; // final after (may be negative)
        }
        // finalize surplus after
        for (const s of surplusPool)
            afterMap[s.shipId] = s.remaining;
        const membersWithAfter = members.map((m) => ({
            shipId: m.shipId,
            cb_before: m.cb_before,
            cb_after: afterMap[m.shipId] ?? m.cb_before,
        }));
        // persist via repo
        const pool = await poolRepo.createPool(year, membersWithAfter);
        return pool;
    };
}
