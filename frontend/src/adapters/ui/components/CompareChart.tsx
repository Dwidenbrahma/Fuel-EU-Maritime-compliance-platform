import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { ComparisonRoute } from "../../../core/ports/routesPort";

// Custom percent label (SAFE — no formatter inside Recharts)
const PercentLabel = (props: any) => {
  const { x, y, width, value } = props;

  if (value == null) return null;

  const color = value > 0 ? "#dc2626" : "#059669"; // red for worse, green for better

  return (
    <text
      x={x + width + 8}
      y={y + 10}
      fill={color}
      fontSize={13}
      fontWeight={600}
      textAnchor="start"
      dominantBaseline="middle">
      {value > 0 ? `+${value.toFixed(1)}%` : `${value.toFixed(1)}%`}
    </text>
  );
};

export default function CompareChart({
  results,
}: {
  results: ComparisonRoute[];
}) {
  if (!results || results.length === 0)
    return <div className="text-slate-500">No data to display</div>;

  // Prepare data
  const data = results.map((r) => {
    const baseline = r.baselineIntensity || 0;
    const current = r.intensityGco2PerMj;

    const percent =
      r.percentChange ??
      (baseline > 0 ? ((current - baseline) / baseline) * 100 : 0);

    return { name: r.id, baseline, current, percent };
  });

  return (
    <div className="w-full h-[420px] md:h-[480px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 30, right: 80, left: 70, bottom: 20 }}>
          {/* Y Axis (Route labels) */}
          <YAxis
            dataKey="name"
            type="category"
            width={90}
            tick={{ fill: "#1e293b", fontSize: 14, fontWeight: 600 }}
          />

          {/* X Axis — force clean 0-to-max domain */}
          <XAxis
            type="number"
            domain={[0, "dataMax + 10"]}
            tick={{ fill: "#475569", fontSize: 12 }}
            axisLine={{ stroke: "#cbd5e1" }}
            tickLine={false}
          />

          {/* Tooltip */}
          <Tooltip
            contentStyle={{
              backgroundColor: "#0f172a",
              color: "#fff",
              borderRadius: 8,
              padding: "10px 14px",
              border: "none",
            }}
            formatter={(val: number, name: string) => [
              val.toFixed(2),
              name === "baseline" ? "Baseline" : "Current",
            ]}
          />

          <Legend />

          {/* BASELINE BAR */}
          <Bar
            dataKey="baseline"
            name="Baseline"
            fill="#cbd5e1"
            barSize={16}
            radius={[4, 4, 4, 4]}
          />

          {/* CURRENT BAR (Gradient + colored) */}
          <Bar
            dataKey="current"
            name="Current"
            barSize={18}
            radius={[6, 6, 6, 6]}
            label={<PercentLabel />}>
            {data.map((entry, idx) => (
              <Cell
                key={idx}
                fill={
                  entry.percent > 0
                    ? "url(#redGradient)"
                    : "url(#greenGradient)"
                }
              />
            ))}
          </Bar>

          {/* Gradient Definitions */}
          <defs>
            <linearGradient id="greenGradient" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>

            <linearGradient id="redGradient" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor="#f87171" />
              <stop offset="100%" stopColor="#dc2626" />
            </linearGradient>
          </defs>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
