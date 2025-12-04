import { useEffect, useState, useCallback } from "react";
import { useRoutes } from "../../../main/compositionRoot";
import type { ComparisonRoute } from "../../../core/ports/routesPort";

export default function CompareTab() {
  const { compareRoutes } = useRoutes();

  const [results, setResults] = useState<ComparisonRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<"table" | "chart">("chart");
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    text: string;
  } | null>(null);

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
          <div>
            <Chart
              results={results}
              tooltip={tooltip}
              setTooltip={setTooltip}
            />
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200">
                <th className="text-left p-3 text-sm font-semibold">
                  Route ID
                </th>
                <th className="text-left p-3 text-sm font-semibold">Year</th>
                <th className="p-3 text-sm font-semibold">Baseline GHG</th>
                <th className="p-3 text-sm font-semibold">Current GHG</th>
                <th className="p-3 text-sm font-semibold">Diff (%)</th>
                <th className="p-3 text-sm font-semibold">Status</th>
              </tr>
            </thead>

            <tbody>
              {results.map((r) => {
                const percentDiff = r.percentChange ?? 0;
                const isBetter = percentDiff < 0;
                const status = r.status || (isBetter ? "BETTER" : "WORSE");

                return (
                  <tr
                    key={r.id}
                    className="border-b border-slate-200 hover:bg-slate-50">
                    <td className="p-3 font-semibold text-blue-700">{r.id}</td>
                    <td className="p-3">{r.year}</td>
                    <td className="p-3">
                      {(r.baselineIntensity || 0).toFixed(2)}
                    </td>
                    <td className="p-3">{r.intensityGco2PerMj.toFixed(2)}</td>

                    <td
                      className={`p-3 font-bold ${
                        isBetter ? "text-green-600" : "text-red-600"
                      }`}>
                      {percentDiff.toFixed(1)}%
                    </td>

                    <td>
                      {status === "BETTER" || isBetter ? (
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full font-semibold text-xs">
                          ✓ Better
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full font-semibold text-xs">
                          ✗ Worse
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

interface CompareChartResult {
  id: string;
  baselineIntensity: number | null;
  intensityGco2PerMj: number;
  percentChange?: number;
}

function Chart({
  results,
  tooltip,
  setTooltip,
}: {
  results: CompareChartResult[];
  tooltip: { x: number; y: number; text: string } | null;
  setTooltip: (t: { x: number; y: number; text: string } | null) => void;
}) {
  if (!results || results.length === 0)
    return <div className="text-slate-500">No data to chart</div>;

  // compute max for scaling
  const maxVal = Math.max(
    ...results.map((r) =>
      Math.max(r.baselineIntensity || 0, r.intensityGco2PerMj)
    ),
    1
  );

  const rowHeight = 36;
  const gap = 12;
  const width = 720;

  const showTooltip = (
    e: React.MouseEvent<SVGRectElement, MouseEvent>,
    text: string
  ) => {
    const svg = e.currentTarget.ownerSVGElement as SVGSVGElement | null;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    setTooltip({
      x: e.clientX - rect.left + 8,
      y: e.clientY - rect.top + 8,
      text,
    });
  };

  const hideTooltip = () => setTooltip(null);

  return (
    <div className="overflow-x-auto relative">
      <svg width={width} height={(rowHeight + gap) * results.length}>
        {results.map((r, i) => {
          const y = i * (rowHeight + gap);
          const baselineW =
            ((r.baselineIntensity || 0) / maxVal) * (width * 0.6);
          const compW = (r.intensityGco2PerMj / maxVal) * (width * 0.6);
          const xLabel = 8;
          const barsX = 140;
          const percent = r.percentChange ?? 0;
          const compColor = percent > 0 ? "#dc2626" : "#059669";

          return (
            <g key={r.id} transform={`translate(0, ${y})`}>
              <text x={xLabel} y={20} className="text-sm" fill="#0f172a">
                {r.id}
              </text>

              <rect
                x={barsX}
                y={6}
                width={baselineW}
                height={12}
                fill="#94a3b8"
                rx={3}
                onMouseMove={(e) =>
                  showTooltip(
                    e,
                    `Baseline: ${(r.baselineIntensity || 0).toFixed(2)}`
                  )
                }
                onMouseLeave={hideTooltip}
              />
              <rect
                x={barsX}
                y={22}
                width={compW}
                height={12}
                fill={compColor}
                rx={3}
                onMouseMove={(e) =>
                  showTooltip(
                    e,
                    `Current: ${r.intensityGco2PerMj.toFixed(
                      2
                    )} (${percent.toFixed(1)}%)`
                  )
                }
                onMouseLeave={hideTooltip}
              />

              <text
                x={barsX + Math.max(baselineW, compW) + 8}
                y={18}
                fontSize={12}
                fill="#0f172a">
                {(r.baselineIntensity || 0).toFixed(1)} /{" "}
                {r.intensityGco2PerMj.toFixed(1)}
              </text>

              <text
                x={barsX + Math.max(baselineW, compW) + 8}
                y={34}
                fontSize={11}
                fill={percent > 0 ? "#dc2626" : "#059669"}>
                {percent.toFixed(1)}%
              </text>
            </g>
          );
        })}
      </svg>

      {tooltip && (
        <div
          style={{ left: `${tooltip.x}px`, top: `${tooltip.y}px` }}
          className="absolute pointer-events-none bg-slate-800 text-white text-sm px-2 py-1 rounded">
          {tooltip.text}
        </div>
      )}
    </div>
  );
}
