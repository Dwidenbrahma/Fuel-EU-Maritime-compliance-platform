// src/adapters/ui/pages/BankingTab.tsx
import { useEffect, useState } from "react";

type BankEntry = {
  id?: number;
  ship_id: string;
  year: number;
  amount_gco2eq: number;
  applied: boolean;
  created_at?: string;
};

export default function BankingTab() {
  const [routeId, setRouteId] = useState("R001");
  const [year, setYear] = useState<number>(2024);
  const [loading, setLoading] = useState(false);
  const [cbBefore, setCbBefore] = useState<number | null>(null);
  const [available, setAvailable] = useState<number>(0);
  const [entries, setEntries] = useState<BankEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [applyAmount, setApplyAmount] = useState<number>(0);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchRecords();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchRecords = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/banking/records?routeId=${routeId}&year=${year}`
      );
      if (!res.ok) throw new Error(await res.text());
      const json = await res.json();
      setCbBefore(json.cb_before ?? 0);
      setAvailable(json.available ?? 0);
      setEntries(json.entries ?? []);
    } catch (err: any) {
      setError(err.message || "Failed to load banking records");
    } finally {
      setLoading(false);
    }
  };

  const handleBank = async () => {
    setActionLoading(true);
    setError(null);
    try {
      const res = await fetch("/banking/bank", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ routeId, year }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Banking failed");
      // update UI
      await fetchRecords();
      alert("Banked surplus successfully");
    } catch (err: any) {
      setError(err.message || "Banking failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleApply = async () => {
    setActionLoading(true);
    setError(null);
    try {
      const res = await fetch("/banking/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ routeId, year, amount: applyAmount }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Apply failed");
      await fetchRecords();
      alert(`Applied ${json.applied} (gCO2e). CB after: ${json.cb_after}`);
    } catch (err: any) {
      setError(err.message || "Apply failed");
    } finally {
      setActionLoading(false);
    }
  };

  const canBank = cbBefore !== null && cbBefore > 0;
  const canApply = available > 0 && applyAmount > 0 && applyAmount <= available;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold text-blue-800 mb-6">
        Banking (Article 20)
      </h1>

      <div className="bg-white p-4 rounded shadow mb-6">
        <div className="flex gap-4 items-center">
          <input
            className="p-2 border rounded"
            value={routeId}
            onChange={(e) => setRouteId(e.target.value)}
          />
          <input
            type="number"
            className="p-2 border rounded w-28"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
          />
          <button
            className="px-4 py-2 bg-slate-600 text-white rounded"
            onClick={fetchRecords}
            disabled={loading}>
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>
      )}

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded shadow">
          <p className="text-sm text-slate-500">CB Before</p>
          <p className="text-xl font-bold">
            {cbBefore !== null ? cbBefore.toLocaleString() : "-"}
          </p>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <p className="text-sm text-slate-500">Available Banked</p>
          <p className="text-xl font-bold">{available.toLocaleString()}</p>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <p className="text-sm text-slate-500">Applied</p>
          <p className="text-xl font-bold">0</p>
          <p className="text-xs text-slate-400">(use Apply action to change)</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded shadow mb-6">
        <h3 className="font-semibold mb-3">Bank Actions</h3>
        <div className="flex gap-3 items-center">
          <button
            onClick={handleBank}
            disabled={!canBank || actionLoading}
            className={`px-4 py-2 rounded text-white font-semibold ${
              canBank
                ? "bg-blue-700 hover:bg-blue-600"
                : "bg-slate-300 cursor-not-allowed"
            }`}>
            Bank CB
          </button>

          <div className="flex items-center gap-2">
            <input
              type="number"
              value={applyAmount}
              onChange={(e) => setApplyAmount(Number(e.target.value))}
              className="p-2 border rounded w-40"
              placeholder="Amount to apply"
            />
            <button
              onClick={handleApply}
              disabled={!canApply || actionLoading}
              className={`px-4 py-2 rounded text-white font-semibold ${
                canApply
                  ? "bg-green-600 hover:bg-green-500"
                  : "bg-slate-300 cursor-not-allowed"
              }`}>
              Apply Bank
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded shadow">
        <h3 className="font-semibold mb-3">Bank Entries</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="text-sm text-slate-600 border-b">
              <tr>
                <th className="py-2">ID</th>
                <th className="py-2">Amount</th>
                <th className="py-2">Applied</th>
                <th className="py-2">Created</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => (
                <tr key={e.id} className="border-b">
                  <td className="py-3">{e.id}</td>
                  <td className="py-3">{e.amount_gco2eq.toLocaleString()}</td>
                  <td className="py-3">{e.applied ? "Yes" : "No"}</td>
                  <td className="py-3">
                    {e.created_at
                      ? new Date(e.created_at).toLocaleString()
                      : "-"}
                  </td>
                </tr>
              ))}
              {entries.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-slate-400">
                    No bank entries
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
