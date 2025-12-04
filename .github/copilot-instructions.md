# AI Coding Agent Instructions: Fuel-EU Maritime Compliance Platform

## Project Overview

A full-stack Fuel-EU Maritime Compliance Platform implementing **Hexagonal Architecture (Ports & Adapters pattern)** across both frontend (React + TypeScript + Vite) and backend (Node.js + Express + Prisma + PostgreSQL).

**Goal:** Support compliance calculations, carbon banking (Article 20), pooling (Article 21), and route comparison for maritime vessels under EU regulations.

---

## Architecture Principles

### Hexagonal Architecture Layers

Both frontend and backend follow strict layering:

```
┌─────────────────────────────────────┐
│  UI / Controllers (Adapters In)     │
├─────────────────────────────────────┤
│  Application Layer (Use-Cases)      │
├─────────────────────────────────────┤
│  Domain Layer (Business Logic)      │
├─────────────────────────────────────┤
│  Ports (Interfaces)                 │
├─────────────────────────────────────┤
│  Infrastructure (HTTP, Prisma)      │
│  (Adapters Out)                     │
└─────────────────────────────────────┘
```

**Key Principle:** Dependencies flow INWARD. UI → Use-Cases → Domain/Ports → Infrastructure. Never skip layers.

---

## Frontend Architecture

### File Structure

```
frontend/src/
├── core/
│   ├── domain/              # Pure business logic (no React, no fetch)
│   │   ├── compliance.ts    # ComplianceBalance, CB calculations
│   │   ├── route.ts         # Route, GHG intensity, baseline logic
│   │   ├── bankingEntry.ts  # BankingEntry, surplus validation
│   │   ├── pool.ts          # Pool, PoolMember, pooling rules
│   │   ├── ship.ts          # Ship entity
│   │   └── fuelFactors.ts   # Energy & emission constants & computations
│   ├── ports/               # Port interfaces (what app needs, not how)
│   │   ├── compliancePort.ts
│   │   ├── bankingPort.ts
│   │   ├── routesPort.ts
│   │   └── poolingPort.ts
│   └── application/         # Use-cases (orchestrate domain + ports)
│       ├── useComplianceBalance.ts
│       ├── useBankingOperations.ts
│       ├── useRouteOperations.ts
│       ├── usePoolingOperations.ts
│       └── index.ts         # Re-export all use-cases
├── adapters/
│   ├── infrastructure/      # Implementation of ports (HTTP)
│   │   └── http/
│   │       ├── httpComplianceAdapter.ts
│   │       ├── httpBankingAdapter.ts
│   │       ├── httpRoutesAdapter.ts
│   │       └── httpPoolingAdapter.ts
│   └── ui/                  # React components (view only)
│       ├── pages/
│       │   ├── BankingTab.tsx
│       │   ├── CompareTab.tsx
│       │   ├── PoolingTab.tsx
│       │   └── RoutesTab.tsx
│       └── components/
│           └── NavBar.tsx
├── main/
│   └── compositionRoot.ts   # Dependency Injection & wiring
├── shared/
│   ├── components/          # Reusable UI components
│   ├── hooks/               # Generic React hooks
│   └── utils/               # Pure utility functions
└── index.css, main.tsx      # Entry points
```

---

## Frontend Layer Details

### 1. Domain Layer (`src/core/domain/`)

**RULES:**

- ✅ Pure TypeScript—no React imports
- ✅ No fetch/axios/infrastructure code
- ✅ Encapsulate business rules and constants
- ✅ Export factory functions & validation helpers
- ❌ No side effects
- ❌ No async/Promise code

**Key Models & Logic:**

- **compliance.ts**

  - `ComplianceBalance` interface
  - `calculateAdjustedCB(originalCB, appliedBanked)` — Add applied banked to original CB
  - `getEffectiveCB(balance)` — Returns pooled CB if in pool, else adjusted CB
  - `isCompliant(balance)` — Check if effective CB >= 0
  - `getComplianceStatus(balance)` — Return compliance state & deficit/surplus amount
  - `isValidComplianceBalance(balance)` — Validate data consistency

- **route.ts**

  - `Route` interface with `baselineIntensity` (nullable)
  - `hasBaseline(route)` — Check if baseline is set
  - `calculateBaselineImprovement(current, baseline)` — % change from baseline
  - `isComplianceStatusBetter(current, baseline)` — Is current < baseline?
  - `isValidRoute(route)` — Validate required fields

- **bankingEntry.ts**

  - `BankingEntry` interface
  - `calculateBankedAmount(entries)` — Sum of unapplied entries
  - `canApplyAmount(available, toApply)` — Validate application
  - `calculateRemainingBanked(entries, applied)` — Remaining after application
  - `canCreateBankEntry(shipId, year, amount)` — Validate creation

- **pool.ts**

  - `Pool`, `PoolMember` interfaces
  - `isValidPoolCreation(shipIds, year)` — Min 2 ships, positive year
  - `calculatePooledCB(members)` — Sum of members' CB
  - `isEligibleForPool(adjustedCB)` — Must be positive
  - `calculateAverageAdjustedCB(members)` — Pool average
  - `calculateCompliantMembers(members)` — Count with CB >= 0
  - `calculateDeficitMembers(members)` — Count with CB < 0

- **fuelFactors.ts**
  - Constants: `ENERGY_DENSITY`, `EMISSION_FACTORS` by fuel type
  - `computeEnergy(fuelTons, fuelType)` — MJ from fuel
  - `computeEmissions(fuelTons, fuelType)` — gCO2 from fuel
  - `computeIntensity(emissions, energy)` — gCO2/MJ

**Pattern:** Export pure functions for testing. No mutable state.

---

### 2. Ports Layer (`src/core/ports/`)

**RULES:**

- ✅ Define interfaces (WHAT the app needs)
- ✅ Use domain types in signatures
- ❌ Never include implementation
- ❌ Never mention HTTP/fetch/URLs
- ❌ Never mention React

**Key Ports:**

```typescript
// compliancePort.ts
export interface CompliancePort {
  getComplianceBalance(shipId, year): Promise<ComplianceBalance>;
  getAdjustedCB(shipId, year): Promise<number>;
}

// bankingPort.ts
export interface BankingPort {
  getBankingRecords(shipId, year): Promise<BankingRecordsResponse>;
  bankSurplus(shipId, year, amount): Promise<void>;
  applyBank(shipId, year, amount): Promise<void>;
}

// routesPort.ts
export interface RoutesPort {
  listRoutes(filters?): Promise<RouteMetrics[]>;
  setBaseline(routeId, intensity): Promise<void>;
  compareRoutes(filters?): Promise<ComparisonResponse>;
}

// poolingPort.ts
export interface PoolingPort {
  createPool(shipIds, year): Promise<CreatePoolResponse>;
  getPoolMembers(poolId): Promise<PoolMember[]>;
  getPoolForShip(shipId, year): Promise<Pool | null>;
}
```

---

### 3. Application Layer (`src/core/application/`)

**RULES:**

- ✅ Orchestrate domain logic + port calls
- ✅ Implement use-cases as `makeUse*` functions
- ✅ Take ports as constructor parameters (dependency injection)
- ❌ No React imports
- ❌ No fetch/HTTP code
- ❌ No UI state management

**Pattern:**

```typescript
// useComplianceBalance.ts
export const makeUseGetComplianceBalance = (
  compliancePort: CompliancePort,
  bankingPort: BankingPort,
  poolingPort: PoolingPort
) => {
  return async (shipId: string, year: number): Promise<ComplianceBalance> => {
    const balance = await compliancePort.getComplianceBalance(shipId, year);
    const pool = await poolingPort.getPoolForShip(shipId, year);
    return {
      ...balance,
      inPool: !!pool,
      pooledCB: pool?.pooledCB,
    };
  };
};
```

**Key Use-Cases:**

- **Compliance:** `makeUseGetComplianceBalance` — Fetch CB + pool status
- **Banking:** `makeUseGetBankingRecords`, `makeUseBankSurplus`, `makeUseApplyBank`
- **Routes:** `makeUseListRoutes`, `makeUseSetBaseline`, `makeUseCompareRoutes`
- **Pooling:** `makeUseCreatePool`, `makeUseGetPoolMembers`, `makeUseGetPoolForShip`

---

### 4. Infrastructure Adapters (`src/adapters/infrastructure/http/`)

**RULES:**

- ✅ Implement ports using fetch()
- ✅ Handle camelCase ↔ snake_case conversion
- ✅ Map API responses to domain types
- ✅ Handle HTTP errors gracefully
- ❌ No React imports
- ❌ No business logic (just wiring)

**Pattern:**

```typescript
// httpBankingAdapter.ts
export class HttpBankingAdapter implements BankingPort {
  async getBankingRecords(shipId: string, year: number) {
    const res = await fetch(`/banking/records?shipId=${shipId}&year=${year}`);
    if (!res.ok) throw new Error("Failed to fetch banking records");
    const data = await res.json();
    return {
      cbBefore: data.cb_before ?? 0,
      available: data.available ?? 0,
      entries: data.entries.map((e) => ({
        /* map fields */
      })),
    };
  }
}
```

---

### 5. UI Adapters (`src/adapters/ui/pages/`, `components/`)

**RULES:**

- ✅ Import only from `compositionRoot` & `core/domain`
- ✅ Call use-cases via custom hooks (from compositionRoot)
- ✅ Manage local UI state (loading, error, form input)
- ✅ Display domain models
- ❌ No direct fetch/axios
- ❌ No infrastructure adapter imports
- ❌ No port interfaces in components

**Pattern:**

```typescript
// BankingTab.tsx
import { useBanking } from "../../../main/compositionRoot";
import { BankingEntry } from "../../../core/domain/bankingEntry";

export default function BankingTab() {
  const { getBankingRecords, bankSurplus, applyBank } = useBanking();
  const [shipId, setShipId] = useState("SHIP001");
  const [available, setAvailable] = useState(0);

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      const records = await getBankingRecords(shipId, year);
      setAvailable(records.available);
    } catch (err) {
      // Handle error
    }
  };

  return ( /* JSX */ );
}
```

---

### 6. Composition Root (`src/main/compositionRoot.ts`)

**PURPOSE:** Single point of dependency injection. Wires adapters → ports → use-cases → custom hooks.

**RULES:**

- ✅ Instantiate all adapters once (singletons)
- ✅ Pass adapters to use-cases
- ✅ Export custom React hooks
- ✅ UI components import ONLY from here
- ❌ No business logic
- ❌ No UI rendering

**Pattern:**

```typescript
// compositionRoot.ts
const compliancePort = new HttpComplianceAdapter();
const bankingPort = new HttpBankingAdapter();

export const useBanking = () => {
  const getBankingRecords = useCallback(
    makeUseGetBankingRecords(bankingPort),
    []
  );
  const bankSurplus = useCallback(makeUseBankSurplus(bankingPort), []);

  return { getBankingRecords, bankSurplus, loading, error, setError };
};
```

---

## Backend Architecture

### File Structure

```
backend/src/
├── core/
│   ├── domain/           # Domain entities & rules
│   │   ├── compliance.ts
│   │   ├── route.ts
│   │   └── fuelFactors.ts
│   ├── ports/            # Port interfaces
│   │   ├── bankingRepository.ts
│   │   ├── complianceRepository.ts
│   │   ├── poolingRepository.ts
│   │   └── routeRepository.ts
│   └── application/      # Use-cases
│       ├── banking/
│       ├── compliance/
│       ├── pooling/
│       └── routes/
├── adapters/
│   ├── inbound/          # HTTP controllers
│   │   └── http/
│   └── outbound/         # Database adapters (Prisma)
│       └── postgres/
├── infrastructure/
│   ├── prisma/
│   │   ├── prismaClient.ts
│   │   └── schema.prisma
│   └── server/
│       ├── app.ts        # Express + DI
│       └── server.ts     # Entry point
└── shared/
    ├── errors.ts
    └── utils.ts
```

### Key Backend Patterns

**app.ts** does ONLY composition:

```typescript
// ✅ CORRECT: DI setup, no logic
const routeRepo = new RouteRepositoryPrisma();
app.use("/routes", makeRoutesRouter(routeRepo));

// ❌ WRONG: Use-case creation in app.ts
const getAllRoutes = makeFetchRoutes(routeRepo);
```

**Controllers create use-cases:**

```typescript
router.get("/", async (req, res) => {
  const useCase = makeFetchRoutes(routeRepo);
  const result = await useCase();
  res.json(result);
});
```

---

## Data Models & Contracts

### Compliance Balance Flow

1. **Compute CB** → `computeCB(shipId, intensity, fuelTons, year)` stored in `ShipCompliance`
2. **Bank Surplus** → Create entry in `BankEntry` with `applied: false`
3. **Apply Bank** → Mark entries `applied: true` and update `ShipCompliance`
4. **Get Adjusted CB** → `originalCB + sum(applied entries)`
5. **Get Effective CB** → If in pool, return `pooledCB`; else `adjustedCB`

### Route Comparison

1. **Set Baseline** → Store `baseline_intensity` for route
2. **Compare Routes** → For each route, calculate `(actual - baseline) / baseline * 100%`
3. **Compliance Status** → actual < baseline = BETTER; actual > baseline = WORSE

### Pooling Rules

- **Eligibility:** Ship must have `adjustedCB >= 0` to form pool with others
- **Pool Creation:** Min 2 ships, year > 0
- **Total CB:** Sum of all members' `adjustedCB`
- **Status:** Pool is compliant if total >= 0

---

## Common Workflows

### Adding a New Feature

1. **Define domain model** in `domain/`
2. **Add port interface** in `ports/` (what we need, not how)
3. **Implement use-case** in `application/` (calls domain + ports)
4. **Implement port** in `infrastructure/http/` (fetch implementation)
5. **Wire in compositionRoot** → Export custom hook
6. **Update UI page** → Call hook, display domain types

### Debugging Data Flow

Trace: `UI Component` → `Custom Hook` → `Use-Case` → `Port` → `HTTP Adapter` → `Backend API` → `Database`

Each layer must be testable in isolation.

### Adding Domain Logic

Put it in `domain/` as pure functions. Examples:

- `isCompliant(balance)` — Check compliance status
- `calculateAdjustedCB(original, applied)` — Calculate totals
- `canApplyAmount(available, toApply)` — Validate business rule

These are **never async** and **never call ports**.

---

## Type Safety Rules

- Use **explicit types** for all API responses (no `any`)
- **Domain types** are source of truth (UI maps to these)
- **Port signatures** define contracts (implement fully in adapters)
- **HTTP adapters** handle snake_case → camelCase conversion

---

## Testing Strategy

- **Domain:** Pure function tests (no mocks)
- **Use-Cases:** Mock ports, test orchestration
- **Adapters:** Mock fetch, test response mapping
- **UI:** Mock hooks, test rendering & interactions

---

## Key Files to Reference

| Purpose          | File                                   | Key Exports                                            |
| ---------------- | -------------------------------------- | ------------------------------------------------------ |
| Compliance logic | `src/core/domain/compliance.ts`        | `calculateAdjustedCB`, `getEffectiveCB`, `isCompliant` |
| Route logic      | `src/core/domain/route.ts`             | `hasBaseline`, `calculateBaselineImprovement`          |
| Banking logic    | `src/core/domain/bankingEntry.ts`      | `canApplyAmount`, `calculateBankedAmount`              |
| Pool logic       | `src/core/domain/pool.ts`              | `isValidPoolCreation`, `calculatePooledCB`             |
| Fuel data        | `src/core/domain/fuelFactors.ts`       | `ENERGY_DENSITY`, `computeIntensity`                   |
| Compliance port  | `src/core/ports/compliancePort.ts`     | `CompliancePort` interface                             |
| Composition      | `src/main/compositionRoot.ts`          | `useBanking()`, `useRoutes()`, etc.                    |
| Banking tab      | `src/adapters/ui/pages/BankingTab.tsx` | Example UI using hooks                                 |

---

## Important Commands

**Frontend:**

```bash
npm run dev      # Vite dev server (port 5173)
npm run build    # TypeScript build
npm run lint     # ESLint check
```

**Backend:**

```bash
npm run dev      # ts-node dev server (port 3000)
npm run build    # TypeScript compile to dist/
npx prisma migrate dev --name <migration-name>  # Create migration
npx prisma studio  # Prisma UI
```

---

## Common Pitfalls

| ❌ WRONG                                | ✅ CORRECT                                    |
| --------------------------------------- | --------------------------------------------- |
| Direct fetch in UI component            | Import hook from `compositionRoot`            |
| Business logic in controllers           | Business logic in `domain/` or `application/` |
| Importing infrastructure adapters in UI | Import only from `compositionRoot`            |
| Creating repositories in app.ts         | Pass repos to controllers                     |
| Async code in domain models             | Domain is sync; use-cases are async           |
| Mixing camelCase/snake_case             | HTTP adapters handle conversion               |
| Logic in ports                          | Ports are interfaces only                     |

---

## Architecture Checklist

- [ ] New files created in correct layer (domain/ports/application/adapters)
- [ ] No upward dependencies (UI → App → Domain, never reverse)
- [ ] No direct fetch in UI (use compositionRoot hooks)
- [ ] Domain logic is pure functions, never async
- [ ] Use-cases call ports, not direct HTTP
- [ ] HTTP adapters implement ports, handle response mapping
- [ ] Composition Root is only place adapters are instantiated
- [ ] All domain types exported consistently
- [ ] No circular dependencies

---

## Questions? Reference

- **Domain Logic:** See `domain/*.ts` for examples of pure business rules
- **Port Usage:** See `application/*.ts` for dependency injection patterns
- **UI Integration:** See `adapters/ui/pages/BankingTab.tsx` for hook usage
- **HTTP Mapping:** See `adapters/infrastructure/http/*.ts` for request/response handling
