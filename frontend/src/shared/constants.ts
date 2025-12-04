/**
 * Frontend UI and configuration constants
 * Shared across all tabs and pages
 */

// ========================
// API Configuration
// ========================

/**
 * Base backend API URL (empty string uses relative paths for dev proxy)
 * In production, set to actual backend domain
 */
export const API_BASE_URL = "";

/**
 * Default timeout for API calls (milliseconds)
 */
export const API_TIMEOUT_MS = 10000;

// ========================
// Compliance & Regulatory Display
// ========================

/**
 * Target GHG intensity for UI display (gCO2/MJ)
 * Matches backend TARGET_GHG_INTENSITY_2030
 */
export const TARGET_GHG_INTENSITY_2030 = 89.3368;

/**
 * Decimal precision for displaying intensity values
 */
export const INTENSITY_PRECISION = 2;

/**
 * Decimal precision for displaying percentages
 */
export const PERCENTAGE_PRECISION = 1;

// ========================
// UI Pagination & Display
// ========================

/**
 * Default number of routes to display per page (or unlimited if 0)
 */
export const ROUTES_PER_PAGE = 0; // 0 = no limit

/**
 * Default sort field for routes table
 */
export const DEFAULT_SORT_FIELD = "routeId";

/**
 * Default sort direction ("asc" or "desc")
 */
export const DEFAULT_SORT_DIRECTION = "asc";

// ========================
// Color/Status Indicators
// ========================

/**
 * Status badges: map compliance status to color classes
 */
export const STATUS_COLORS = {
  BETTER: "bg-green-100 text-green-700",
  WORSE: "bg-red-100 text-red-700",
  UNKNOWN: "bg-slate-100 text-slate-700",
  COMPLIANT: "bg-green-600 text-white",
  NON_COMPLIANT: "bg-red-600 text-white",
} as const;

/**
 * Intensity thresholds for visual indicators
 * If intensity > HIGH_THRESHOLD, show red; if > MEDIUM, show orange, etc.
 */
export const INTENSITY_THRESHOLDS = {
  LOW: 70,
  MEDIUM: 100,
  HIGH: 150,
} as const;

// ========================
// Notifications & Messages
// ========================

/**
 * Toast/notification display duration (milliseconds)
 */
export const NOTIFICATION_DURATION_MS = 5000;

/**
 * Error message texts (localization entry point)
 */
export const ERROR_MESSAGES = {
  FAILED_TO_FETCH_ROUTES: "Failed to fetch routes",
  FAILED_TO_SET_BASELINE: "Failed to set baseline",
  FAILED_TO_COMPARE_ROUTES: "Failed to compare routes",
  FAILED_TO_LOAD_COMPLIANCE: "Failed to load compliance data",
  FAILED_TO_FETCH_BANKING: "Failed to fetch banking records",
  FAILED_TO_CREATE_POOL: "Failed to create pool",
  ROUTE_NOT_FOUND: "Route not found",
  INVALID_INPUT: "Invalid input provided",
} as const;

/**
 * Success message texts
 */
export const SUCCESS_MESSAGES = {
  BASELINE_SET: "Baseline set successfully",
  POOL_CREATED: "Pool created successfully",
  BANK_APPLIED: "Bank surplus applied successfully",
} as const;

// ========================
// Form Defaults
// ========================

/**
 * Default selected year in filters
 */
export const DEFAULT_FILTER_YEAR = new Date().getFullYear();

/**
 * Available vessel types (for dropdowns)
 */
export const VESSEL_TYPES = [
  "Container",
  "BulkCarrier",
  "Tanker",
  "RoRo",
  "General Cargo",
  "Refrigerated Cargo",
] as const;

/**
 * Available fuel types (for dropdowns)
 */
export const FUEL_TYPES = [
  "HFO",
  "MGO",
  "LNG",
  "LSFO",
  "MeOH",
  "Ammonia",
] as const;

// ========================
// Chart & Visualization
// ========================

/**
 * Chart color palette for route comparison
 */
export const CHART_COLORS = {
  baseline: "#94a3b8", // slate-400
  actual: "#059669", // green-600
  worse: "#dc2626", // red-600
  better: "#059669", // green-600
} as const;

/**
 * SVG row height for bar chart
 */
export const CHART_ROW_HEIGHT = 36;

/**
 * Gap between rows in chart
 */
export const CHART_ROW_GAP = 12;

// ========================
// Version & Metadata
// ========================

/**
 * Frontend version (should match package.json)
 */
export const APP_VERSION = "0.1.0";

/**
 * Environment (dev, staging, production)
 */
export const ENVIRONMENT = (import.meta.env.MODE || "development") as
  | "development"
  | "staging"
  | "production";
