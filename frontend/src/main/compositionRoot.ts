// src/main/compositionRoot.ts
// This file is the Inversion of Control container that wires all dependencies

import { useCallback, useState } from "react";

// Infrastructure adapters (HTTP implementations)
import { HttpComplianceAdapter } from "../adapters/infrastructure/http/httpComplianceAdapter";
import { HttpBankingAdapter } from "../adapters/infrastructure/http/httpBankingAdapter";
import { HttpRoutesAdapter } from "../adapters/infrastructure/http/httpRoutesAdapter";
import { HttpPoolingAdapter } from "../adapters/infrastructure/http/httpPoolingAdapter";

// Ports
import type { CompliancePort } from "../core/ports/compliancePort";
import type { BankingPort } from "../core/ports/bankingPort";
import type { RoutesPort } from "../core/ports/routesPort";
import type { PoolingPort } from "../core/ports/poolingPort";

// Application use-cases
import {
  makeUseGetComplianceBalance,
  makeUseListRoutes,
  makeUseSetBaseline,
  makeUseCompareRoutes,
  makeUseGetBankingRecords,
  makeUseBankSurplus,
  makeUseApplyBank,
  makeUseCreatePool,
  makeUseGetPoolMembers,
  makeUseGetPoolForShip,
} from "../core/application/index";

// ============================================
// Singleton instances of adapters
// ============================================
const compliancePort: CompliancePort = new HttpComplianceAdapter();
const bankingPort: BankingPort = new HttpBankingAdapter();
const routesPort: RoutesPort = new HttpRoutesAdapter();
const poolingPort: PoolingPort = new HttpPoolingAdapter();

// ============================================
// Exported hooks for React components
// ============================================

export const useComplianceBalance = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getComplianceBalance = useCallback(
    (shipId: string, year: number) =>
      makeUseGetComplianceBalance(compliancePort, poolingPort)(shipId, year),
    []
  );

  return {
    getComplianceBalance,
    loading,
    setLoading,
    error,
    setError,
  };
};

export const useBanking = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getBankingRecords = useCallback(
    (shipId: string, year: number) =>
      makeUseGetBankingRecords(bankingPort)(shipId, year),
    []
  );

  const bankSurplus = useCallback(
    (shipId: string, year: number, amount: number) =>
      makeUseBankSurplus(bankingPort)(shipId, year, amount),
    []
  );

  const applyBank = useCallback(
    (shipId: string, year: number, amount: number) =>
      makeUseApplyBank(bankingPort)(shipId, year, amount),
    []
  );

  return {
    getBankingRecords,
    bankSurplus,
    applyBank,
    loading,
    setLoading,
    error,
    setError,
  };
};

export const useRoutes = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const listRoutes = useCallback(
    (filters?: object) => makeUseListRoutes(routesPort)(filters),
    []
  );

  const setBaseline = useCallback(
    (routeId: string, intensity: number) =>
      makeUseSetBaseline(routesPort)(routeId, intensity),
    []
  );

  const compareRoutes = useCallback(
    (filters?: object) => makeUseCompareRoutes(routesPort)(filters),
    []
  );

  return {
    listRoutes,
    setBaseline,
    compareRoutes,
    loading,
    setLoading,
    error,
    setError,
  };
};

export const usePooling = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPool = useCallback(
    (shipIds: string[], year: number) =>
      makeUseCreatePool(poolingPort)(shipIds, year),
    []
  );

  const getPoolMembers = useCallback(
    (poolId: string) => makeUseGetPoolMembers(poolingPort)(poolId),
    []
  );

  const getPoolForShip = useCallback(
    (shipId: string, year: number) =>
      makeUseGetPoolForShip(poolingPort)(shipId, year),
    []
  );

  return {
    createPool,
    getPoolMembers,
    getPoolForShip,
    loading,
    setLoading,
    error,
    setError,
  };
};
