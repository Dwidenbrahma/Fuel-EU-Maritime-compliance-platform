import { Routes, Route, Navigate } from "react-router-dom";
import RoutesTab from "../pages/RoutesTab";
import CompareTab from "../pages/CompareTab";
import BankingTab from "../pages/BankingTab";
import PoolingTab from "../pages/PoolingTab";

export default function AppRouter() {
  return (
    <Routes>
      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/routes" replace />} />

      {/* Pages */}
      <Route path="/routes" element={<RoutesTab />} />
      <Route path="/compare" element={<CompareTab />} />
      <Route path="/banking" element={<BankingTab />} />
      <Route path="/pooling" element={<PoolingTab />} />

      {/* 404 fallback */}
      <Route path="*" element={<Navigate to="/routes" replace />} />
    </Routes>
  );
}
