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
` Module '@prisma/client' has no exported member PrismaClient — fix this.`

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

`Refactor backend into proper Hexagonal Architecture with clear domain, application, ports, and adapters layers. Provide folder structure and migration guidance.`

**output:**
`            core/
            domain/
            application/
            ports/
          adapters/
            inbound/http/
            outbound/postgres/
          infrastructure/
            prisma/
            server/`
**Refinement:** - Mapped legacy code into new structure - Cursor auto-moved files + fixed import paths.

### 2.3 Banking Logic (Article 20)

**_Prompt:_**
`Generate full Banking controller (Article 20) using Hexagonal Architecture. Include surplus banking, FIFO application, validation, and repository` injection.

**Output:**

- makeBankSurpluslogic
- makeApplyBank logic
- FIFO banking implementation
- Prisma repository adapters
- Express router setup

**Refinement:** : - Added strict validation: - CB must be > 0 - Snapshot must exist

Corrected domain exceptions

### 2.4 Compliance Logic

**_Prompt:_**
`Evaluate the current Compliance module implementation. Identify which components are complete and what remains. Provide formulas for Compliance Balance (CB), Adjusted CB, and years-based rules. Ensure logic aligns with FuelEU Maritime Regulation and fits within Hexagonal Architecture?`

**_Output:_**

            - CB Snapshot calculator
            - Adjusted CB calculator
            - Repository ports

**\*Refinement:** - Ensured banking adjustments affect final CB correctly - Prevented CB misalignment across years

### 2.5 Pooling Logic (Article 21)

**\*Prompt:**
`“List remaining steps for implementing Article 21 pooling feature.”`
**\*Output:**
`Remaining tasks identified:` - Load adjusted CB - Create pool - Save pool with members - GET list of pools

**\*Refinement:**
`Enforced rule: “No ship becomes worse by pooling”`

### 2.6 Compare Tab – Chart & Table

**\*Prompt:**
`Build visually appealing Compare Tab using Recharts + Tailwind. Include gradient bars, tooltips, and percent-difference calculation.`

**Output:**

- Gradient bar chart
- Custom tooltip
- Responsive table layout

**_Refinement:_**

- Fixed LabelList formatter
- Improved tooltip styling
- Ensured mobile-responsive design

### 2.7 Table Alignment Fix

**_Prompt:_**
`The table in the Compare Tab is not aligned properly.The column headers and row values are misaligned, and spacing is inconsistent across different screen sizes.Fix the table layout using TailwindCSS so that:All columns have consistent width Headers line up perfectly with row cellsSpacing, padding, and text alignment remain responsive The layout adapts correctly in both desktop and mobile viewsProvide an updated table component using React + TailwindCSS, focusing on clean spacing and predictable alignment.`

**Output:**

- Applied fixed-width utility classes (e.g., w-24, w-3 min-w-\*)
- Added consistent padding (px-4 py-2)
- Ensured left-alignment with text-left
- Corrected flex/table-column structure

### 2.8 Recharts Invalid Hook Call Fix

**_Prompt:_**
`Recharts is throwing an ‘Invalid hook call’ error when rendering the Compare chart`

**_Output:_**

- Identified that the project had duplicate React copies due to Vite and dependency structure
- Recommended adding:
  `resolve: { dedupe: ["react", "react-dom"] }`

**Refinement:**

- Removed conflicting node_modules
- Reinstalled dependencies cleanly
- Verified all Recharts components rendered without hook errors

### 2.9 Navigation bar — Claude Haiku 4.5

**\*Prompt:**

`Help me to build a visually appealing Navigation bar. Requirements: Background color #4A70A9, font color #fff. Layout: Logo in right side, all navigation routes should take some margin, adjust the size. Use React, TypeScript, TailwindCSS, and React Router NavLink.`

**Output:**

  - Generated a responsive navigation bar layout
  - Added evenly spaced NavLink components
  - Applied TailwindCSS styling (padding, margin, hover states)
  - Added active-state styles
  - Provided structure for placing the logo on the right side
  - Delivered a visually balanced and accessible design

**Refinement:**

- Improved center alignment of tabs
- Enhanced spacing using gap-\* utilities
- Added smoother hover transitions
- Ensured the design stays consistent across screen sizes

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

**_Combined Agent Strategy_**

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

### 6.Summary

- The combination of ChatGPT, Copilot, Cursor, and Claude enabled:
- Full backend implementation: Banking, Compliance, Pooling, Comparison logic.
- Clean hexagonal architecture: Strict separation of concerns.
- Visualization-ready frontend: Responsive charts, clean tables, intuitive UI.
- AI-supported debugging: Solved complex issues in Prisma, React, Recharts, and TypeScript.
