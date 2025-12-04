import { Route } from "../domain/route";

export interface RouteRepository {
  findAll(): Promise<Route[]>;
  findById(id: number): Promise<Route | null>;
  findByRouteId(routeId: string): Promise<Route | null>;
  setBaseline(routeId: string): Promise<void>;
  findBaselineByYear(year: number): Promise<Route | null>;
  findComparison(year?: number): Promise<Route[]>; // can be tailored
}
