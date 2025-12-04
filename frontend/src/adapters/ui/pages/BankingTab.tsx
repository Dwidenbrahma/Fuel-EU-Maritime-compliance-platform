// src/adapters/ui/pages/BankingTab.tsx
import { useEffect, useState } from "react";
import { useBanking } from "../../../main/compositionRoot";
import type { BankingEntry } from "../../../core/domain/bankingEntry";

export default function BankingTab() {
  const { getBankingRecords, bankSurplus, applyBank } = useBanking();

  const [shipId, setShipId] = useState("SHIP001");
  const [year, setYear] = useState<number>(2024);
  const [loading, setLoading] = useState(false);
  const [cbBefore, setCbBefore] = useState<number | null>(null);
  const [available, setAvailable] = useState<number>(0);
  const [entries, setEntries] = useState<BankingEntry[]>([]);
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
      const records = await getBankingRecords(shipId, year);
      setCbBefore(records.cbBefore);
      setAvailable(records.available);
      setEntries(records.entries);
    } catch (err: unknown) {
      const error =
        err instanceof Error ? err.message : "Failed to load banking records";
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleBank = async () => {
    setActionLoading(true);
    setError(null);
    try {
      await bankSurplus(shipId, year, cbBefore ?? 0);
      await fetchRecords();
      alert("Banked surplus successfully");
    } catch (err: unknown) {
      const error = err instanceof Error ? err.message : "Banking failed";
      setError(error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleApply = async () => {
    setActionLoading(true);
    setError(null);
    try {
      await applyBank(shipId, year, applyAmount);
      await fetchRecords();
      alert(`Applied ${applyAmount} gCO2e successfully`);
      setApplyAmount(0);
    } catch (err: unknown) {
      const error = err instanceof Error ? err.message : "Apply failed";
      setError(error);
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
            placeholder="Ship ID"
            value={shipId}
            onChange={(e) => setShipId(e.target.value)}
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
                  <td className="py-3">{e.amountGco2eq.toLocaleString()}</td>
                  <td className="py-3">{e.applied ? "Yes" : "No"}</td>
                  <td className="py-3">
                    {e.createdAt ? new Date(e.createdAt).toLocaleString() : "-"}
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
