import type { ComparisonRoute } from "../../../core/ports/routesPort";

export default function CompareTable({
  results,
}: {
  results: ComparisonRoute[];
}) {
  if (!results || results.length === 0)
    return <div className="text-slate-500 p-4">No data available</div>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full table-fixed border-collapse rounded-lg overflow-hidden">
        <thead>
          <tr className="bg-slate-100 border-b border-slate-300">
            <th className="p-3 text-sm font-semibold text-left w-[15%]">
              Route ID
            </th>
            <th className="p-3 text-sm font-semibold text-left w-[10%]">
              Year
            </th>
            <th className="p-3 text-sm font-semibold text-center w-[20%]">
              Baseline GHG
            </th>
            <th className="p-3 text-sm font-semibold text-center w-[20%]">
              Current GHG
            </th>
            <th className="p-3 text-sm font-semibold text-center w-[15%]">
              Diff (%)
            </th>
            <th className="p-3 text-sm font-semibold text-center w-[20%]">
              Status
            </th>
          </tr>
        </thead>

        <tbody>
          {results.map((r) => {
            const percent = r.percentChange ?? 0;
            const isBetter = percent < 0;

            return (
              <tr
                key={r.id}
                className="border-b border-slate-200 hover:bg-slate-50 transition">
                {/* Route ID */}
                <td className="p-3 font-semibold text-blue-700 w-[15%] whitespace-nowrap text-left">
                  {r.id}
                </td>

                {/* Year */}
                <td className="p-3 w-[10%] text-left">{r.year}</td>

                {/* Baseline */}
                <td className="p-3 w-[20%] text-center">
                  {(r.baselineIntensity || 0).toFixed(2)}
                </td>

                {/* Current */}
                <td className="p-3 w-[20%] text-center">
                  {r.intensityGco2PerMj.toFixed(2)}
                </td>

                {/* Percent Change */}
                <td
                  className={`p-3 w-[15%] text-center font-bold ${
                    isBetter ? "text-green-600" : "text-red-600"
                  }`}>
                  {percent.toFixed(1)}%
                </td>

                {/* Status Badge */}
                <td className="p-3 w-[20%] text-center">
                  {isBetter ? (
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
    </div>
  );
}
