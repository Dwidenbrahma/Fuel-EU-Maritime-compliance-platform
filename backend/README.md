# Fuel-EU Maritime Compliance Platform - Backend

A Node.js/TypeScript backend for the Fuel-EU Maritime compliance platform, implementing Hexagonal Architecture principles with clean separation of concerns between application logic, domain models, and infrastructure.

## Architecture Overview

This backend follows **Hexagonal Architecture** (Ports & Adapters), ensuring that business logic is independent from framework and infrastructure details.

### Project Structure

```
src/
├── core/
│   ├── application/           # Use-cases (business logic)
│   │   ├── banking/           # Bank surplus and apply bank use-cases
│   │   ├── compliance/        # Compute CB and get adjusted CB use-cases
│   │   ├── pooling/           # Pool creation use-cases
│   │   └── routes/            # Fetch routes, set baseline, get comparison use-cases
│   ├── domain/                # Domain models (entities, types)
│   │   ├── compliance.ts
│   │   └── route.ts
│   └── ports/                 # Port interfaces (boundaries)
│       ├── bankingRepository.ts
│       ├── complianceRepository.ts
│       ├── poolingRepository.ts
│       └── routeRepository.ts
├── adapters/
│   ├── inbound/               # HTTP controllers (entry points)
│   │   └── http/
│   │       ├── bankingController.ts
│   │       ├── complianceController.ts
│   │       ├── poolingController.ts
│   │       └── routeController.ts
│   └── outbound/              # Repository implementations (Prisma)
│       └── postgres/
│           ├── bankingRepositoryPrisma.ts
│           ├── complianceRepositoryPrisma.ts
│           ├── poolRepositoryPrisma.ts
│           ├── routeRepositoryPrisma.ts
│           └── prismaClient.ts
└── infrastructure/
    └── server/
        ├── app.ts             # Express app composition & DI
        └── server.ts          # Server entry point
```

## Recent Changes & Improvements

### 1. **Hexagonal Architecture Refactoring** ✅

**Goal**: Ensure `app.ts` only performs dependency injection and composition without business logic.

**Changes Made**:

- Removed all use-case instantiation logic from `app.ts`
- Moved use-case creation responsibility to HTTP controllers
- Simplified `app.ts` to only:
  - Create Express app
  - Register middleware
  - Instantiate repository adapters (Prisma)
  - Inject repositories into HTTP routers
  - Export `createApp()` function

**Before**:

```typescript
// app.ts contained use-case creation
const getAllRoutes = makeFetchRoutes(routeRepo);
const setBaseline = makeSetBaseline(routeRepo);
app.use(
  "/routes",
  makeRoutesRouter({ getAllRoutes, setBaseline, compareRoutes })
);
```

**After**:

```typescript
// app.ts only passes repositories
app.use("/routes", makeRoutesRouter(routeRepo));
// Controllers create their own use-cases
```

### 2. **Compliance Repository Configuration** ✅

**Issue**: `ComplianceRepository` port required methods not implemented in the Prisma adapter.

**Missing Methods**:

- `getComplianceBalance(shipId, year)` — retrieve stored CB snapshot
- `getAppliedBankEntries(shipId, year)` — retrieve deducted bank entries

**Solution Implemented**:
Added implementations to `complianceRepositoryPrisma.ts`:

```typescript
async getComplianceBalance(shipId: string, year: number) {
  const row = await prisma.shipCompliance.findFirst({
    where: { ship_id: shipId, year },
    select: { cb_gco2eq: true },
  });
  return (row as unknown) as { cb_gco2eq: number } | null;
}

async getAppliedBankEntries(shipId: string, year: number) {
  const rows = await prisma.bankEntry.findMany({
    where: { ship_id: shipId, year, amount_gco2eq: { lt: 0 } },
    select: { amount_gco2eq: true },
  });
  return rows as { amount_gco2eq: number }[];
}
```

### 3. **Development Environment & Build Issues** ✅

**Problems Encountered**:

| Issue                     | Root Cause                                                  | Solution                                            |
| ------------------------- | ----------------------------------------------------------- | --------------------------------------------------- |
| Module resolution error   | TypeScript compiled to ESNext but ts-node expected CommonJS | Changed `tsconfig.json` to `"module": "commonjs"`   |
| Prisma v7 incompatibility | Prisma v7 requires adapter pattern not available            | Downgraded to Prisma v6.19.0                        |
| DATABASE_URL not loaded   | .env not loaded before Prisma initialization                | Added `import "dotenv/config"` to `prismaClient.ts` |
| Missing schema URL        | Prisma v6 requires `url = env("DATABASE_URL")` in schema    | Updated `prisma/schema.prisma`                      |

**Configuration Changes**:

**tsconfig.json**:

```json
{
  "compilerOptions": {
    "module": "commonjs",
    "target": "ES2020",
    "moduleResolution": "node"
  }
}
```

**package.json scripts**:

```json
{
  "scripts": {
    "dev": "ts-node-dev --transpile-only src/infrastructure/server/server.ts",
    "build": "tsc -p tsconfig.json",
    "start": "node dist/infrastructure/server/server.js"
  }
}
```

**prismaClient.ts**:

```typescript
import "dotenv/config";
import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();
```

**prisma/schema.prisma**:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

## API Endpoints

### Routes

- **GET** `/routes` — Fetch all routes
- **POST** `/routes/:routeId/baseline` — Set baseline for a route
- **GET** `/routes/comparison` — Get route comparison data

### Compliance

- **GET** `/compliance/cb` — Compute carbon balance
  - Query params: `shipId`, `year`, `actualIntensity`, `fuel`
- **GET** `/compliance/adjusted-cb` — Get adjusted CB by year
  - Query params: `year`

### Banking

- **GET** `/banking/records` — Get banked amount
  - Query params: `shipId`, `year`
- **POST** `/banking/bank` — Bank surplus
  - Body: `{ shipId, year, amount }`
- **POST** `/banking/apply` — Apply banked surplus
  - Body: `{ shipId, year, amount }`

### Pooling

- **POST** `/pools` — Create a new pool
  - Body: `{ year, members: [{ shipId, cb_before }] }`

### Health

- **GET** `/` — Health check endpoint

## Setup & Installation

### Prerequisites

- Node.js 20+
- npm or yarn
- PostgreSQL database

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
# Create .env file with DATABASE_URL
echo 'DATABASE_URL="postgresql://user:password@localhost:5432/fueleu"' > .env

# Generate Prisma client
npx prisma generate

# (Optional) Run migrations
npx prisma migrate dev
```

## Development

### Start Dev Server

```bash
npm run dev
```

Server runs at `http://localhost:3000`

### Build for Production

```bash
npm run build
npm start
```

### Run Prisma Commands

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name migration_name

# Reset database
npx prisma migrate reset

# Open Prisma Studio
npx prisma studio
```

## Technology Stack

| Layer          | Technology           |
| -------------- | -------------------- |
| **Runtime**    | Node.js + TypeScript |
| **Framework**  | Express.js           |
| **Database**   | PostgreSQL           |
| **ORM**        | Prisma v6            |
| **Dev Server** | ts-node-dev          |
| **Build**      | TypeScript Compiler  |

## Database Schema

### Models

- **Route** — Maritime routes with fuel consumption and emissions data
- **ShipCompliance** — Ship compliance records (carbon balance)
- **BankEntry** — Banking records (surplus/deductions)
- **Pool** — Pooling data with members
- **PoolMember** — Individual pool members with carbon balance tracking

See `prisma/schema.prisma` for full schema details.

## Domain Logic

### Compliance Calculation

- **Target Intensity**: 89.3368 gCO2eq/MJ (FuelEU baseline)
- **Energy Calculation**: fuel (tons) × 41,000 MJ/ton
- **Carbon Balance**: (Target - Actual) × Energy

### Banking Model

- Ships can bank excess carbon credits (positive CB)
- Banked credits can be applied to reduce compliance obligations
- Deducted entries are stored as negative bank amounts

### Pooling

- Multiple ships can form a compliance pool
- Individual carbon balances are tracked before and after pooling

## Error Handling

The backend implements consistent error handling:

- **400 Bad Request** — Invalid input or insufficient resources
- **404 Not Found** — Resource not found
- **500 Internal Server Error** — Server-side failures

All errors include descriptive messages for debugging.

## Dependency Injection Pattern

This backend uses constructor-based dependency injection through factory functions:

```typescript
// Use-case factory (core/application)
export function makeGetAdjustedCB(complianceRepo: ComplianceRepository) {
  return async function getAdjustedCB(shipId: string, year: number) {
    // implementation
  };
}

// HTTP controller injection
export default function makeComplianceRouter(
  complianceRepo: ComplianceRepository
) {
  const router = express.Router();
  const getAdjustedCB = makeGetAdjustedCB(complianceRepo);
  // routes
}

// App-level composition (infrastructure/server/app.ts)
const complianceRepo = new ComplianceRepositoryPrisma();
app.use("/compliance", makeComplianceRouter(complianceRepo));
```

## Ports & Adapters

### Ports (Interfaces)

- `bankingRepository.ts` — Banking operations interface
- `complianceRepository.ts` — Compliance data interface
- `poolingRepository.ts` — Pool management interface
- `routeRepository.ts` — Route data interface

### Adapters (Implementations)

- **Inbound** (HTTP Controllers) — Convert HTTP requests to use-case calls
- **Outbound** (Prisma Repositories) — Convert use-case calls to database queries

## Future Improvements

- [ ] Add request validation middleware
- [ ] Implement authentication & authorization
- [ ] Add comprehensive error logging
- [ ] Add rate limiting
- [ ] Upgrade to Prisma v7 with proper engine configuration
- [ ] Add integration tests
- [ ] Add API documentation (OpenAPI/Swagger)
- [ ] Implement caching layer (Redis)

## Troubleshooting

### Issue: `DATABASE_URL not set`

**Solution**: Ensure `.env` file exists in project root with valid PostgreSQL connection string.

### Issue: Prisma client generation fails

**Solution**: Run `npx prisma generate` explicitly after changing schema.

### Issue: Port 3000 already in use

**Solution**: Change PORT environment variable: `PORT=3001 npm run dev`

### Issue: Module not found errors

**Solution**: Ensure TypeScript is compiled: `npm run build`

## Contributing

When making changes:

1. Follow the Hexagonal Architecture principles
2. Keep business logic in `core/application`
3. Keep infrastructure details in `adapters` and `infrastructure`
4. Ensure all imports use correct relative paths
5. Test changes with `npm run dev` before committing

## License

This project is part of the Fuel-EU Maritime compliance platform.
