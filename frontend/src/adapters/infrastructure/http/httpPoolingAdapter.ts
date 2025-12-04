// src/adapters/infrastructure/http/httpPoolingAdapter.ts

import type {
  PoolingPort,
  CreatePoolResponse,
} from "../../../core/ports/poolingPort";
import type { Pool, PoolMember } from "../../../core/domain/pool";

export class HttpPoolingAdapter implements PoolingPort {
  async createPool(
    shipIds: string[],
    year: number
  ): Promise<CreatePoolResponse> {
    const res = await fetch("/pooling/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shipIds, year }),
    });
    if (!res.ok) throw new Error("Failed to create pool");

    const data = await res.json();
    return {
      poolId: (data.poolId as string) ?? (data.pool_id as string) ?? "",
      year: (data.year as number) ?? year,
      pooledCB: (data.pooledCB as number) ?? (data.pooled_cb as number) ?? 0,
      ships: ((data.ships as Array<Record<string, unknown>>) ?? []).map(
        (s: Record<string, unknown>) => ({
          shipId: (s.shipId as string) ?? (s.ship_id as string) ?? "",
          adjustedCB:
            (s.adjustedCB as number) ?? (s.adjusted_cb as number) ?? 0,
        })
      ),
    };
  }

  async getPoolMembers(poolId: string): Promise<PoolMember[]> {
    const res = await fetch(`/pooling/members?poolId=${poolId}`);
    if (!res.ok) throw new Error("Failed to fetch pool members");

    const data = await res.json();
    const members = (data.members as Array<Record<string, unknown>>) ?? [];
    return members.map((m: Record<string, unknown>) => ({
      shipId: (m.shipId as string) ?? (m.ship_id as string) ?? "",
      adjustedCB: (m.adjustedCB as number) ?? (m.adjusted_cb as number) ?? 0,
    }));
  }

  async getPoolForShip(shipId: string, year: number): Promise<Pool | null> {
    const res = await fetch(`/pooling/ship?shipId=${shipId}&year=${year}`);
    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error("Failed to fetch pool for ship");
    }

    const data = await res.json();
    if (!data) return null;

    return {
      id: data.id ?? data.pool_id ?? "",
      year: data.year ?? year,
      pooledCB: data.pooledCB ?? data.pooled_cb ?? 0,
      createdAt: data.created_at ?? data.createdAt,
    };
  }
}
