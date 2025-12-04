import { useEffect, useState } from "react";

interface CompareResult {
  year: number;
  routeId: string;
  vesselType: string;
  fuelType: string;
  baselineGHG: number;
  comparisonGHG: number;
  percentDiff: number;
  compliant: boolean;
}

export default function CompareTab() {
  const [results, setResults] = useState<CompareResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchComparison();
  }, []);

  const fetchComparison = async () => {
    try {
      const res = await fetch("/routes/comparison");
      if (!res.ok) throw new Error("Failed to load comparison data");
      const data = await res.json();
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="p-10 text-center text-slate-600 font-semibold">
        Loading comparison…
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

      <div className="bg-white border border-slate-200 rounded-lg shadow p-6">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-200">
              <th className="text-left p-3 text-sm font-semibold">Route ID</th>
              <th className="text-left p-3 text-sm font-semibold">Year</th>
              <th className="p-3 text-sm font-semibold">Baseline GHG</th>
              <th className="p-3 text-sm font-semibold">Comparison GHG</th>
              <th className="p-3 text-sm font-semibold">Diff (%)</th>
              <th className="p-3 text-sm font-semibold">Status</th>
            </tr>
          </thead>

          <tbody>
            {results.map((r) => (
              <tr
                key={r.routeId}
                className="border-b border-slate-200 hover:bg-slate-50">
                <td className="p-3 font-semibold text-blue-700">{r.routeId}</td>
                <td className="p-3">{r.year}</td>
                <td className="p-3">{r.baselineGHG.toFixed(2)}</td>
                <td className="p-3">{r.comparisonGHG.toFixed(2)}</td>

                <td
                  className={`p-3 font-bold ${
                    r.percentDiff > 0 ? "text-red-600" : "text-green-600"
                  }`}>
                  {r.percentDiff}%
                </td>

                <td>
                  {r.compliant ? (
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full font-semibold">
                      ✓ Compliant
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full font-semibold">
                      ✗ Non-Compliant
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
