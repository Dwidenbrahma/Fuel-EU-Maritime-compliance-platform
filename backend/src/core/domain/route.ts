export type Route = {
  id: string;
  ship_id: string;
  route_name?: string;
  vessel_type?: string;
  fuel_type?: string;
  fuel_tons: number;
  distance_nm?: number;
  year: number;
  emissions_gco2eq?: number | null;
  energy_mj?: number | null;
  intensity_gco2_per_mj?: number | null;
  baseline_intensity?: number | null;
  created_at: Date;
};
