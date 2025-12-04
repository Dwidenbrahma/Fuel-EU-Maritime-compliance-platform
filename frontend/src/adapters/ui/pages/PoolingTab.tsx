import { useEffect, useState } from "react";

export default function PoolingTab() {
  const [year, setYear] = useState(2024);
  const [ships, setShips] = useState([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [poolResult, setPoolResult] = useState<any>(null);

  useEffect(() => {
    fetch(`/compliance/adjusted-cb?year=${year}`)
      .then((r) => r.json())
      .then(setShips)
      .catch(() => setError("Failed to load adjusted CB"));
  }, [year]);

  const toggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const createPool = async () => {
    setError("");
    try {
      const res = await fetch("/pools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shipIds: selected, year }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setPoolResult(json);
    } catch (err: any) {
      setError(err.message);
    }
  };

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
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded">{error}</div>
      )}

      {/* Adjusted CB List */}
      <div className="bg-white shadow rounded p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Adjusted CB by Ship</h2>

        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th></th>
              <th>Ship ID</th>
              <th>CB Before</th>
            </tr>
          </thead>
          <tbody>
            {ships.map((s: any) => (
              <tr key={s.shipId} className="border-b">
                <td>
                  <input
                    type="checkbox"
                    checked={selected.includes(s.shipId)}
                    onChange={() => toggle(s.shipId)}
                  />
                </td>
                <td>{s.shipId}</td>
                <td
                  className={`${
                    s.adjustedCB < 0 ? "text-red-600" : "text-green-700"
                  }`}>
                  {s.adjustedCB.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create Pool Button */}
      <button
        onClick={createPool}
        disabled={selected.length < 2}
        className="px-6 py-3 bg-blue-700 text-white rounded font-bold hover:bg-blue-600 disabled:bg-slate-300">
        Create Pool
      </button>

      {/* Pool Output */}
      {poolResult && (
        <div className="mt-8 bg-white shadow p-6 rounded">
          <h3 className="font-semibold text-xl mb-4">Pool Created</h3>
          <p className="text-slate-600 mb-4">Pool ID: {poolResult.poolId}</p>

          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th>Ship</th>
                <th>Before</th>
                <th>After</th>
              </tr>
            </thead>
            <tbody>
              {poolResult.members.map((m: any) => (
                <tr key={m.ship_id} className="border-b">
                  <td>{m.ship_id}</td>
                  <td>{m.cb_before}</td>
                  <td
                    className={
                      m.cb_after < 0 ? "text-red-600" : "text-green-700"
                    }>
                    {m.cb_after}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <p className="mt-4 font-semibold">
            Total Pool CB:{" "}
            <span
              className={
                poolResult.totalCB < 0 ? "text-red-600" : "text-green-700"
              }>
              {poolResult.totalCB}
            </span>
          </p>
        </div>
      )}
    </div>
  );
}
