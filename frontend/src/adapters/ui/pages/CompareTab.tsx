import { useEffect, useState, useCallback } from "react";
import { useRoutes } from "../../../main/compositionRoot";

import CompareChart from "../../ui/components/CompareChart";
import CompareTable from "../../ui/components/CompareTable";
import type { ComparisonRoute } from "../../../core/ports/routesPort";

export default function CompareTab() {
  const { compareRoutes } = useRoutes();

  const [results, setResults] = useState<ComparisonRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<"table" | "chart">("chart");

  const fetchComparison = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await compareRoutes();
      setResults(data.routes || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [compareRoutes]);

  useEffect(() => {
    fetchComparison();
  }, [fetchComparison]);

  if (loading)
    return (
      <div className="p-10 text-center text-slate-600 font-semibold">
        Loading…
      </div>
    );

  if (error)
    return (
      <div className="p-10 text-center text-red-600 font-semibold">{error}</div>
    );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-blue-800 mb-6">
        Compare Routes (GHG Intensity)
      </h1>

      <div className="flex gap-3 mb-4">
        <button
          onClick={() => setView("chart")}
          className={`px-4 py-2 rounded ${
            view === "chart" ? "bg-slate-700 text-white" : "bg-slate-100"
          }`}>
          Chart View
        </button>

        <button
          onClick={() => setView("table")}
          className={`px-4 py-2 rounded ${
            view === "table" ? "bg-slate-700 text-white" : "bg-slate-100"
          }`}>
          Table View
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg shadow p-6">
        {view === "chart" ? (
          <CompareChart results={results} />
        ) : (
          <CompareTable results={results} />
        )}
      </div>
    </div>
  );
}
