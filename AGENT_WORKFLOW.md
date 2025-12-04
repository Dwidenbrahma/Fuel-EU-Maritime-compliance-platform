# AI Agent Workflow Documentation

This document summarizes how AI agents (ChatGPT, Copilot, Cursor, Claude Code) were used to build and debug the Varuna Maritime FuelEU Dashboard project, including backend hexagonal architecture, Prisma ORM, banking/compliance logic, pooling logic, and advanced frontend visualizations with Recharts.

It provides a transparent workflow log showing prompts, outputs, validations, corrections, and best practices followed during the development process.

---

## 1. Agents Used

| Agent                 | Purpose                                                                                  |
| --------------------- | ---------------------------------------------------------------------------------------- |
| **ChatGPT (GPT-5.1)** | Core logic design, debugging, architecture planning, Recharts enhancements, Prisma fixes |
| **GitHub Copilot**    | Auto-generation of boilerplate TypeScript/React code, inline suggestions                 |
| **Cursor Agent**      | File-aware refactoring, enforcing hexagonal architecture, reorganizing project folders   |
| **Claude Code**       | Reviewing logic, optimizing repository patterns, improving clarity/documentation         |

---

## 2. Prompts & Outputs

### 2.1 Prisma Client Fixes

**Prompt:**  
Module '@prisma/client' has no exported member PrismaClient — fix this.

**Generated Output:**

- Checked node_modules corruption
- Suggested replacing import with:

```ts
import { PrismaClient } from "@prisma/client";
```

### Refinement: Added deduplication config in build setup:

`resolve: { dedupe: ["react", "react-dom"] }`

### 2.2 Hexagonal Architecture Backend Design

**_Prompt:_**

- Convert backend into proper hexagonal architecture.

**output:**
`core/
            domain/
            application/
            ports/
          adapters/
            inbound/http/
            outbound/postgres/
          infrastructure/
            prisma/
            server/`
**Refinement:** Mapped existing code into this structure and rewired imports using Cursor to move files physically.

### 2.3 Banking Logic (Article 20)

**_Prompt:_**

- Give full banking controller with bank/apply/list logic.

  **Output:**

- makeBankSurplus logic

- makeApplyBank logic

- FIFO banking implementation

- Prisma repository adapters

- Express router setup

**Refinement:** Added validation for CB ≤ 0 and missing snapshots.

### 2.4 Compliance Logic

**_Prompt:_**

- Is compliance fully implemented?

**_Output:_**

- CB Snapshot calculator

- Adjusted CB calculator

- Repository ports

**\*Refinement:** Ensured adjusted CB uses applied banking records correctly.

### 2.5 Pooling Logic (Article 21)

**\*Prompt:**

- What is left in pooling?
  **\*Output:** Remaining tasks identified:

      - Load adjusted CB

      - Create pool

      - Save pool with members

      - GET list of pools

### 2.6 Compare Tab – Chart & Table

**\*Prompt:**

- Create visually appealing Recharts chart + table.

**Output:**

- Recharts gradient chart

- Custom Tooltip component

- Responsive Tailwind layout

**_Refinement:_** Fixed LabelList formatting and improved tooltip css.

### 2.7 Table Alignment Fix

**_Prompt:_**

- Table not aligned with heading — fix.

- Output: Fixed column widths and applied consistent padding across headers and rows.

### 2.8 Recharts Invalid Hook Call Fix

**_Prompt:_**

- Invalid hook call in Recharts.

**_Output:_** Suggested dependency resolution fix:

- TypeScript

- resolve: { dedupe: ["react", "react-dom"] }
  **Refinement:** Reinstalled dependencies to ensure version matching.

### 2.9 UI Generation Example — Claude Haiku 4.5

**\*Prompt:**

**Help me to build a visually appealing Navigation bar. Requirements: Background color #4A70A9, font color #fff. Layout: Logo in right side, all navigation routes should take some margin, adjust the size. Use React, TypeScript, TailwindCSS, and React Router NavLink.**

**\*Output:**

- TypeScript

- import React from "react";
- import { NavLink } from "react-router-dom";

- type Tab = "Banking" | "Compare" | "Pooling" | "Routes";

- const tabs: { label: Tab; to: string }[] = [
- { label: "Banking", to: "/banking" },
- { label: "Compare", to: "/compare" },
- { label: "Pooling", to: "/pooling" },
- { label: "Routes", to: "/routes" },
- ];

- const NavBar: React.FC = () => {
- return (

- <nav className="w-full py-3" style={{ backgroundColor: "#4A70A9" }}>
- <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">

  -      {/* Navigation Routes (Centered) */}
  -     <div className="flex-1 flex justify-center">
  -      <div className="inline-flex items-center gap-3">
  -       {tabs.map(({ label, to }) => (
    -       <NavLink
  -          key={label}

    -        to={to}
    -       className={({ isActive }) =>
    -        `px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
    -         isActive
    -          ? "bg-white text-blue-700 shadow-md"
    -         : "text-white hover:bg-white/20"
    - }`
    - }
    - >
    - {label}
    - </NavLink>
    - ))}
    - </div>
    - </div>

  - </div>
  - </nav>

- )
- }
- export default NavBar;

## 3. Validation / Corrections

- Prisma Validation

- Verified client generation.

- Correct import usage ensured.

### Backend Testing Validated the following endpoints:

- GET /compliance/adjusted-cb

- POST /banking/apply

- GET /banking/records

- GET /compare/routes

- POST /pooling/create

### UI Validation

- Responsive charts.

- Correct percent difference math.

T- able alignment fixed.

### 4. Observations

- Strengths Across Agents
- Fast boilerplate generation (Copilot).

- Efficient code refactoring (Cursor).

- Deep logic analysis (ChatGPT).

- UI refinement (Claude).

- Folder-wide transformations (Cursor).

**\*⚠ Weaknesses / Failures**

- Recharts formatter hallucinations (ChatGPT).

- Prisma import mismatches.

- Incorrect initial assumptions about architecture.

- Occasional JSX errors from Claude.

**_🔥 Combined Agent Strategy_**

- Cursor → Structure refactors & file moves.

- Copilot → Inline UI scaffolding.

- ChatGPT → Backend logic + architecture design.

- Claude → Visual/UI refinements & documentation.

### 5. Best Practices Followed

- Architecture
- Strict Hexagonal Architecture: Clear separation between domain, ports, and adapters.

- Separation of Concerns: No business logic inside controllers.

- ORM Isolation: Prisma is isolated in outbound adapters, not leaked to the domain.

## Frontend

- Modular Components: Recharts components are isolated.

- Tailwind: Used for all responsiveness.

- Consistent UI Spacing: Global styles applied.

### Workflow

**_Copilot:_** Used only for boilerplate.

**_Cursor tasks:_** Used tasks.md for planning.

**_ChatGPT & Claude:_** Used for logic and refinement.

### 6. Final Summary

- The combination of ChatGPT, Copilot, Cursor, and Claude enabled:

- Full backend implementation: Banking, Compliance, Pooling, Comparison logic.

- Clean hexagonal architecture: Strict separation of concerns.

- Visualization-ready frontend: Responsive charts, clean tables, intuitive UI.

- AI-supported debugging: Solved complex issues in Prisma, React, Recharts, and TypeScript.
