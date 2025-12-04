// src/adapters/infrastructure/http/httpRoutesAdapter.ts

import type {
  RoutesPort,
  RouteMetrics,
  RouteFilters,
  ComparisonResponse,
} from "../../../core/ports/routesPort";
import type { Route, VesselType, FuelType } from "../../../core/domain/route";

export class HttpRoutesAdapter implements RoutesPort {
  async listRoutes(filters?: RouteFilters): Promise<RouteMetrics[]> {
    const params = new URLSearchParams();
    if (filters?.shipId) params.append("shipId", filters.shipId);
    if (filters?.year) params.append("year", filters.year.toString());
    if (filters?.vesselType) params.append("vesselType", filters.vesselType);
    if (filters?.fuelType) params.append("fuelType", filters.fuelType);

    const res = await fetch(`/routes?${params.toString()}`);
    if (!res.ok) throw new Error("Failed to fetch routes");

    const raw = await res.json();
    const items = Array.isArray(raw) ? raw : raw.routes ?? [];

    return items.map((r: Record<string, unknown>) => {
      const vesselType =
        (r.vessel_type as string) ?? (r.vesselType as string) ?? "other";
      const fuelType =
        (r.fuel_type as string) ?? (r.fuelType as string) ?? "HFO";
      const createdAtRaw =
        (r.created_at as string | Date) ?? (r.createdAt as string | Date);
      const createdAtStr =
        typeof createdAtRaw === "string"
          ? createdAtRaw
          : createdAtRaw instanceof Date
          ? createdAtRaw.toISOString()
          : new Date().toISOString();

      return {
        id: (r.id as string) ?? (r.route_id as string) ?? "",
        shipId: (r.ship_id as string) ?? (r.shipId as string) ?? "",
        routeName: (r.route_name as string) ?? (r.routeName as string) ?? "",
        vesselType: vesselType as VesselType,
        fuelType: fuelType as FuelType,
        year: Number(r.year ?? 0),
        fuelTons: Number(r.fuel_tons ?? r.fuelTons ?? 0),
        distanceNm: Number(r.distance_nm ?? r.distanceNm ?? r.distance ?? 0),
        energyMj: Number(r.energy_mj ?? r.energyMj ?? 0),
        emissionsGco2eq: Number(r.emissions_gco2eq ?? r.emissionsGco2eq ?? 0),
        intensityGco2PerMj: Number(
          (r.intensity_gco2_per_mj as number) ??
            (r.intensityGco2PerMj as number) ??
            0
        ),
        baselineIntensity:
          (r.baseline_intensity as number | null) ??
          (r.baselineIntensity as number | null) ??
          null,
        createdAt: createdAtStr,
      };
    });
  }

  async getRoute(routeId: string): Promise<Route> {
    const res = await fetch(`/routes/${routeId}`);
    if (!res.ok) throw new Error("Failed to fetch route");
    const r = await res.json();

    const vesselType = ((r.vessel_type as string) ??
      (r.vesselType as string) ??
      "other") as VesselType;
    const fuelType = ((r.fuel_type as string) ??
      (r.fuelType as string) ??
      "HFO") as FuelType;
    const createdAtRaw =
      (r.created_at as string | Date) ?? (r.createdAt as string | Date);
    const createdAtStr =
      typeof createdAtRaw === "string"
        ? createdAtRaw
        : createdAtRaw instanceof Date
        ? createdAtRaw.toISOString()
        : undefined;

    return {
      id: (r.id as string) ?? (r.route_id as string) ?? "",
      shipId: (r.ship_id as string) ?? (r.shipId as string) ?? "",
      routeName: (r.route_name as string) ?? (r.routeName as string) ?? "",
      vesselType,
      fuelType,
      year: Number(r.year ?? 0),
      fuelTons: Number(r.fuel_tons ?? r.fuelTons ?? 0),
      distanceNm: Number(r.distance_nm ?? r.distanceNm ?? r.distance ?? 0),
      energyMj: Number(r.energy_mj ?? r.energyMj ?? 0),
      emissionsGco2eq: Number(r.emissions_gco2eq ?? r.emissionsGco2eq ?? 0),
      intensityGco2PerMj: Number(
        (r.intensity_gco2_per_mj as number) ??
          (r.intensityGco2PerMj as number) ??
          0
      ),
      baselineIntensity:
        (r.baseline_intensity as number | null) ??
        (r.baselineIntensity as number | null) ??
        undefined,
      createdAt: createdAtStr,
    };
  }

  async setBaseline(routeId: string, intensity: number): Promise<void> {
    const res = await fetch("/routes/set-baseline", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ routeId, intensity }),
    });
    if (!res.ok) throw new Error("Failed to set baseline");
  }

  async compareRoutes(filters?: RouteFilters): Promise<ComparisonResponse> {
    const params = new URLSearchParams();
    if (filters?.shipId) params.append("shipId", filters.shipId);
    if (filters?.year) params.append("year", filters.year.toString());
    if (filters?.vesselType) params.append("vesselType", filters.vesselType);
    if (filters?.fuelType) params.append("fuelType", filters.fuelType);

    const res = await fetch(`/routes/compare?${params.toString()}`);
    if (!res.ok) throw new Error("Failed to compare routes");

    const data = await res.json();
    const routes = ((data.routes as Array<Record<string, unknown>>) ?? []).map(
      (r: Record<string, unknown>) => {
        const vesselType =
          (r.vessel_type as string) ?? (r.vesselType as string) ?? "other";
        const fuelType =
          (r.fuel_type as string) ?? (r.fuelType as string) ?? "HFO";
        const statusStr = (r.status as string) ?? "UNKNOWN";
        const validStatus: "BETTER" | "WORSE" | "UNKNOWN" = [
          "BETTER",
          "WORSE",
          "UNKNOWN",
        ].includes(statusStr)
          ? (statusStr as "BETTER" | "WORSE" | "UNKNOWN")
          : "UNKNOWN";

        return {
          id:
            (r.id as string) ??
            (r.route_id as string) ??
            (r.routeId as string) ??
            "",
          shipId: (r.ship_id as string) ?? (r.shipId as string) ?? "",
          routeName: (r.route_name as string) ?? (r.routeName as string) ?? "",
          vesselType: vesselType as VesselType,
          fuelType: fuelType as FuelType,
          year: Number(r.year ?? 0),
          fuelTons: Number(r.fuel_tons ?? r.fuelTons ?? 0),
          distanceNm: Number(r.distance_nm ?? r.distanceNm ?? r.distance ?? 0),
          energyMj: Number(r.energy_mj ?? r.energyMj ?? 0),
          emissionsGco2eq: Number(
            (r.emissions_gco2eq as number) ?? (r.emissionsGco2eq as number) ?? 0
          ),
          intensityGco2PerMj: Number(
            (r.intensity_gco2_per_mj as number) ??
              (r.intensityGco2PerMj as number) ??
              (r.actualIntensity as number) ??
              0
          ),
          baselineIntensity:
            (r.baseline_intensity as number | null) ??
            (r.baselineIntensity as number | null) ??
            (r.baselineIntensity as number | null) ??
            null,
          createdAt:
            (r.created_at as string) ??
            (r.createdAt as string) ??
            new Date().toISOString(),
          percentChange:
            (r.percentChange as number) ??
            (r.percent_change as number) ??
            (r.percent_change as number) ??
            undefined,
          status: validStatus,
        };
      }
    );

    return {
      routes,
      chartData: data.chartData ?? data.chart_data ?? data.chart,
    };
  }
}
