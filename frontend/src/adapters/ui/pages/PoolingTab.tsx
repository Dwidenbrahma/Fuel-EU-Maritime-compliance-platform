import { useEffect, useState } from "react";
import {
  useComplianceBalance,
  usePooling,
} from "../../../main/compositionRoot";
import type { CreatePoolResponse } from "../../../core/ports/poolingPort";

interface ShipComplianceData {
  shipId: string;
  adjustedCB: number;
}

interface PoolSimulation {
  valid: boolean;
  reason?: string;
  members: Array<{ shipId: string; adjustedCB: number }>;
  total: number;
}

export default function PoolingTab() {
  const { getComplianceBalance } = useComplianceBalance();
  const { createPool } = usePooling();

  const [year, setYear] = useState(2024);
  const [ships, setShips] = useState<ShipComplianceData[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [poolResult, setPoolResult] = useState<CreatePoolResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchAdjustedCB = async (y = year) => {
    setError("");
    setLoading(true);
    try {
      // Fetch compliance data for the given year
      // In a real scenario, you'd have a use-case to fetch all ships' adjusted CB
      // For now, we'll use the compliance balance API
      const data = await getComplianceBalance("SHIP001", y);
      if (data) {
        // This is a simplified version - in production, fetch all ships
        setShips([
          {
            shipId: "SHIP001",
            adjustedCB: data.adjustedCB,
          },
        ]);
      }
    } catch (err: unknown) {
      const error =
        err instanceof Error ? err.message : "Failed to load adjusted CB";
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdjustedCB(year);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year]);

  const toggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleCreatePool = async () => {
    setError("");
    try {
      const result = await createPool(selected, year);
      setPoolResult(result);
    } catch (err: unknown) {
      const error =
        err instanceof Error ? err.message : "Failed to create pool";
      setError(error);
    }
  };

  // Simulate pool allocation locally to validate before sending request
  const simulatePool = (shipIds: string[]): PoolSimulation => {
    const members = shipIds
      .map((id) => {
        const s = ships.find((x) => x.shipId === id);
        if (!s) return null;
        return {
          shipId: id,
          adjustedCB: s.adjustedCB,
        };
      })
      .filter(Boolean) as ShipComplianceData[];

    const total = members.reduce((acc, m) => acc + m.adjustedCB, 0);

    if (members.length < 2)
      return { valid: false, reason: "Need at least 2 ships", members, total };

    if (total < 0)
      return {
        valid: false,
        reason: "Total CB must be >= 0",
        members,
        total,
      };

    return { valid: true, members, total };
  };

  const simulation = simulatePool(selected);

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold text-blue-800 mb-6">
        Pooling (Article 21)
      </h1>

      <div className="flex gap-4 mb-6">
        <input
          type="number"
          className="p-2 border rounded w-32"
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
        />
        <button
          onClick={() => fetchAdjustedCB()}
          disabled={loading}
          className="px-4 py-2 bg-slate-600 text-white rounded disabled:bg-slate-400">
          {loading ? "Loading..." : "Load Adjusted CB"}
        </button>
        <button
          onClick={() => setSelected(ships.map((s) => s.shipId))}
          className="px-4 py-2 bg-slate-200 rounded">
          Select All
        </button>
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded">{error}</div>
      )}

      {/* Adjusted CB List */}
      <div className="bg-white shadow rounded p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Adjusted CB by Ship</h2>

        {ships.length === 0 ? (
          <p className="text-slate-500">
            No ships loaded. Click "Load Adjusted CB" to fetch data.
          </p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Select</th>
                <th className="text-left p-2">Ship ID</th>
                <th className="text-right p-2">CB Value</th>
              </tr>
            </thead>
            <tbody>
              {ships.map((s) => (
                <tr key={s.shipId} className="border-b hover:bg-slate-50">
                  <td className="p-2">
                    <input
                      type="checkbox"
                      checked={selected.includes(s.shipId)}
                      onChange={() => toggle(s.shipId)}
                    />
                  </td>
                  <td className="p-2 font-semibold">{s.shipId}</td>
                  <td
                    className={`p-2 text-right font-semibold ${
                      s.adjustedCB < 0 ? "text-red-600" : "text-green-700"
                    }`}>
                    {s.adjustedCB.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Simulation Preview */}
      {selected.length > 0 && (
        <div className="bg-white p-6 rounded shadow mb-6">
          <h3 className="font-semibold text-lg mb-3">Simulated Pool Preview</h3>

          {!simulation.valid && (
            <div className="bg-red-100 text-red-700 p-3 rounded mb-3">
              ⚠ {simulation.reason || "Selection is invalid"}
            </div>
          )}

          {simulation.valid && (
            <div className="bg-green-100 text-green-700 p-3 rounded mb-3">
              ✓ Pool configuration is valid
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-slate-600 border-b bg-slate-50">
                <tr>
                  <th className="p-3">Ship ID</th>
                  <th className="p-3 text-right">Adjusted CB</th>
                </tr>
              </thead>
              <tbody>
                {simulation.members.map((m) => (
                  <tr key={m.shipId} className="border-b hover:bg-slate-50">
                    <td className="p-3 font-semibold">{m.shipId}</td>
                    <td
                      className={`p-3 text-right font-semibold ${
                        m.adjustedCB < 0 ? "text-red-600" : "text-green-700"
                      }`}>
                      {m.adjustedCB.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-4 text-lg font-semibold">
            Total Pool CB:{" "}
            <span
              className={
                simulation.total < 0 ? "text-red-600" : "text-green-700"
              }>
              {simulation.total.toLocaleString()}
            </span>
          </p>
        </div>
      )}

      {/* Create Pool Button */}
      <button
        onClick={handleCreatePool}
        disabled={selected.length < 2 || !simulatePool(selected).valid}
        className="px-6 py-3 bg-blue-700 text-white rounded font-bold hover:bg-blue-600 disabled:bg-slate-300 disabled:cursor-not-allowed">
        Create Pool
      </button>

      {/* Pool Result */}
      {poolResult && (
        <div className="mt-8 bg-white shadow p-6 rounded">
          <h3 className="font-semibold text-xl mb-4">
            ✓ Pool Created Successfully
          </h3>
          <p className="text-slate-600 mb-4">
            <strong>Pool ID:</strong> {poolResult.poolId}
          </p>
          <p className="text-slate-600 mb-6">
            <strong>Year:</strong> {poolResult.year}
          </p>

          <h4 className="font-semibold mb-3">Pool Members:</h4>
          <table className="w-full text-sm">
            <thead className="bg-slate-100 border-b">
              <tr>
                <th className="text-left p-3">Ship ID</th>
                <th className="text-right p-3">Adjusted CB</th>
              </tr>
            </thead>
            <tbody>
              {poolResult.ships?.map((m: Record<string, unknown>) => {
                const shipId = (m.shipId as string) ?? "";
                const adjustedCB = (m.adjustedCB as number) ?? 0;
                return (
                  <tr key={shipId} className="border-b hover:bg-slate-50">
                    <td className="p-3">{shipId}</td>
                    <td
                      className={`p-3 text-right font-semibold ${
                        adjustedCB < 0 ? "text-red-600" : "text-green-700"
                      }`}>
                      {adjustedCB.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <p className="mt-6 text-lg font-semibold">
            Total Pooled CB:{" "}
            <span
              className={
                poolResult.pooledCB < 0 ? "text-red-600" : "text-green-700"
              }>
              {poolResult.pooledCB?.toLocaleString() || "0"}
            </span>
          </p>
        </div>
      )}
    </div>
  );
}
