import { useState, useEffect } from "react";
import { useRoutes } from "../../../main/compositionRoot";
import type { RouteMetrics } from "../../../core/ports/routesPort";

export default function RoutesTab() {
  const { listRoutes, setBaseline } = useRoutes();

  const [routes, setRoutes] = useState<RouteMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [settingBaseline, setSettingBaseline] = useState<string | null>(null);

  // Filter states
  const [vesselTypeFilter, setVesselTypeFilter] = useState("");
  const [fuelTypeFilter, setFuelTypeFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");

  // Fetch routes on mount
  useEffect(() => {
    fetchRoutes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchRoutes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await listRoutes();
      setRoutes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load routes");
    } finally {
      setLoading(false);
    }
  };

  const handleSetBaseline = async (routeId: string) => {
    try {
      setSettingBaseline(routeId);
      const route = routes.find((r) => r.id === routeId);
      if (!route) throw new Error("Route not found");

      // Toggle: if baseline exists, unset it (set to 0 or null)
      // If no baseline, set it to current intensity
      const isCurrentlyBaseline = hasBaseline(route);

      if (isCurrentlyBaseline) {
        console.log(`Unsetting baseline for ${routeId}`);
        // Set to 0 or null to clear baseline (backend will unset it)
        await setBaseline(routeId, 0);
        console.log(`Baseline unset for ${routeId}`);
      } else {
        console.log(
          `Setting baseline for ${routeId} to ${route.intensityGco2PerMj}`
        );
        await setBaseline(routeId, route.intensityGco2PerMj);
        console.log(`Baseline set successfully for ${routeId}`);
      }

      // Refresh routes to reflect the update
      setError(null);
      await fetchRoutes();
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to toggle baseline";
      console.error(`Error toggling baseline for ${routeId}:`, err);
      setError(msg);
    } finally {
      setSettingBaseline(null);
    }
  };

  // Get unique filter options
  const vesselTypes = Array.from(
    new Set(routes.map((r) => r.vesselType))
  ).sort();
  const fuelTypes = Array.from(new Set(routes.map((r) => r.fuelType))).sort();
  const years = Array.from(new Set(routes.map((r) => r.year))).sort(
    (a, b) => b - a
  );

  // Filter routes
  const filteredRoutes = routes.filter((route) => {
    const vesselMatch =
      !vesselTypeFilter || route.vesselType === vesselTypeFilter;
    const fuelMatch = !fuelTypeFilter || route.fuelType === fuelTypeFilter;
    const yearMatch = !yearFilter || route.year === parseInt(yearFilter);
    return vesselMatch && fuelMatch && yearMatch;
  });

  const hasBaseline = (route: RouteMetrics) =>
    route.baselineIntensity !== null && route.baselineIntensity > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with Visual Hierarchy */}
        <div className="mb-10">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-1.5 h-8 bg-blue-800 rounded-full"></div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-800 to-sky-600 bg-clip-text text-transparent">
                  Routes Management
                </h1>
              </div>
              <p className="text-slate-500 text-lg ml-6">
                View and manage maritime routes with baseline settings
              </p>
            </div>
            <div className="text-right text-sm">
              <p className="text-slate-500">
                Total Routes:{" "}
                <span className="font-bold text-blue-800">{routes.length}</span>
              </p>
              <p className="text-slate-500 mt-1">
                Baselines:{" "}
                <span className="font-bold text-green-600">
                  {routes.filter((r) => hasBaseline(r)).length}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 p-5 bg-gradient-to-r from-red-50 to-red-50 border-l-4 border-red-600 rounded-lg shadow-md">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-red-900 font-semibold text-sm mb-1">
                  ⚠ Error Loading Routes
                </p>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
              <button
                onClick={fetchRoutes}
                className="ml-4 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 transition-colors whitespace-nowrap">
                Retry Now
              </button>
            </div>
          </div>
        )}

        {/* Filters Section */}
        <div className="mb-8 bg-white rounded-lg border border-slate-200 p-8 shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-6 bg-sky-600 rounded-full"></div>
            <h2 className="text-xl font-bold text-slate-900">
              Advanced Filters
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Vessel Type Filter */}
            <div className="flex flex-col">
              <label className="block text-sm font-semibold text-slate-900 mb-3">
                🚢 Vessel Type
              </label>
              <select
                value={vesselTypeFilter}
                onChange={(e) => setVesselTypeFilter(e.target.value)}
                className="px-4 py-3 border-2 border-slate-200 rounded-lg text-slate-700 bg-white hover:border-sky-600 focus:outline-none focus:ring-2 focus:ring-blue-800 focus:border-transparent transition-colors font-medium">
                <option value="">All Vessels</option>
                {vesselTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Fuel Type Filter */}
            <div className="flex flex-col">
              <label className="block text-sm font-semibold text-slate-900 mb-3">
                ⛽ Fuel Type
              </label>
              <select
                value={fuelTypeFilter}
                onChange={(e) => setFuelTypeFilter(e.target.value)}
                className="px-4 py-3 border-2 border-slate-200 rounded-lg text-slate-700 bg-white hover:border-sky-600 focus:outline-none focus:ring-2 focus:ring-blue-800 focus:border-transparent transition-colors font-medium">
                <option value="">All Fuels</option>
                {fuelTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Year Filter */}
            <div className="flex flex-col">
              <label className="block text-sm font-semibold text-slate-900 mb-3">
                📅 Year
              </label>
              <select
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                className="px-4 py-3 border-2 border-slate-200 rounded-lg text-slate-700 bg-white hover:border-sky-600 focus:outline-none focus:ring-2 focus:ring-blue-800 focus:border-transparent transition-colors font-medium">
                <option value="">All Years</option>
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {(vesselTypeFilter || fuelTypeFilter || yearFilter) && (
            <div className="mt-5 flex items-center gap-2">
              <div className="flex-1 h-1 bg-gradient-to-r from-sky-600 to-transparent rounded-full"></div>
              <button
                onClick={() => {
                  setVesselTypeFilter("");
                  setFuelTypeFilter("");
                  setYearFilter("");
                }}
                className="text-sm text-sky-600 hover:text-sky-700 font-semibold underline">
                Clear All Filters
              </button>
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-blue-800 mb-6"></div>
              <p className="text-slate-600 font-semibold text-lg">
                Loading routes…
              </p>
              <p className="text-slate-400 text-sm mt-2">
                Fetching data from maritime database
              </p>
            </div>
          </div>
        )}

        {/* Table Section */}
        {!loading && (
          <div className="bg-white rounded-lg border border-slate-200 shadow-xl overflow-hidden">
            {filteredRoutes.length === 0 ? (
              <div className="p-16 text-center">
                <p className="text-3xl mb-2">📊</p>
                <p className="text-lg font-bold text-slate-700 mb-2">
                  No routes found
                </p>
                <p className="text-slate-500">
                  {vesselTypeFilter || fuelTypeFilter || yearFilter
                    ? "Try adjusting your filters to see available routes"
                    : "No routes are currently available"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  {/* Table Header */}
                  <thead>
                    <tr className="bg-gradient-to-r from-blue-800 to-sky-600 border-b-2 border-blue-700">
                      <th className="px-6 py-4 text-left text-sm font-bold text-white">
                        Route ID
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-white">
                        Vessel Type
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-white">
                        Fuel Type
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-white">
                        Year
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-white">
                        GHG Intensity
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-white">
                        Emissions (gCO2)
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-white">
                        Distance (nm)
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-white">
                        Energy (MJ)
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-white">
                        Action
                      </th>
                    </tr>
                  </thead>

                  {/* Table Body */}
                  <tbody>
                    {filteredRoutes.map((route, index) => (
                      <tr
                        key={route.id}
                        className={`border-b border-slate-200 transition-all duration-200 ${
                          hasBaseline(route)
                            ? "bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-l-green-600 hover:shadow-md"
                            : index % 2 === 0
                            ? "bg-white hover:bg-slate-50"
                            : "bg-slate-50 hover:bg-slate-100"
                        }`}>
                        <td className="px-6 py-4 text-sm font-bold text-blue-800">
                          {route.id}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-700 font-medium">
                          {route.vesselType}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {route.fuelType}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 font-semibold">
                          {route.year}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className="px-3 py-1 bg-sky-50 text-sky-700 rounded-full font-semibold">
                            {route.intensityGco2PerMj.toFixed(4)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className="text-slate-700 font-medium">
                            {route.emissionsGco2eq.toLocaleString()}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className="text-slate-700 font-medium">
                            {route.distanceNm.toFixed(0)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span
                            className={`px-3 py-1 rounded-full font-semibold ${
                              route.energyMj > 200000000
                                ? "bg-red-50 text-red-700"
                                : "bg-orange-50 text-orange-700"
                            }`}>
                            {route.energyMj.toLocaleString()}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <button
                            onClick={() => handleSetBaseline(route.id)}
                            disabled={settingBaseline === route.id}
                            className={`px-4 py-2 font-bold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg text-white ${
                              settingBaseline === route.id
                                ? "bg-slate-400 cursor-not-allowed"
                                : hasBaseline(route)
                                ? "bg-green-600 hover:bg-green-700 active:scale-95"
                                : "bg-blue-800 hover:bg-blue-700 active:scale-95"
                            }`}>
                            {settingBaseline === route.id
                              ? "⏳ Processing..."
                              : hasBaseline(route)
                              ? "✓ Baseline (click to unset)"
                              : "+ Set Baseline"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {/* Footer Stats */}
            {filteredRoutes.length > 0 && (
              <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex justify-between items-center">
                <p className="text-sm text-slate-600">
                  Showing{" "}
                  <span className="font-bold text-slate-900">
                    {filteredRoutes.length}
                  </span>{" "}
                  of{" "}
                  <span className="font-bold text-slate-900">
                    {routes.length}
                  </span>{" "}
                  routes
                </p>
                <div className="flex gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                    <span className="text-slate-600">
                      Baseline:{" "}
                      <span className="font-bold">
                        {filteredRoutes.filter((r) => hasBaseline(r)).length}
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
