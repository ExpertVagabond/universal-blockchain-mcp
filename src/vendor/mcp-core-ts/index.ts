/**
 * @psm/mcp-core-ts — Shared MCP server infrastructure.
 * TypeScript mirror of psm-mcp-core (Rust).
 *
 * Modules:
 *   error    — PsmMcpError, sanitizeError()
 *   input    — validateName(), validateNoInjection(), requireString()
 *   tool     — ToolHandler, McpAction, textResult(), errorResult()
 *   filter   — OutputFilter (9 secrets, 4 PII patterns)
 *   health   — HealthCheck, healthy(), degraded(), unhealthy()
 *   audit    — AuditLogger (in-memory FIFO)
 *   rate     — RateLimiter (sliding window, per-key)
 *   policy   — PolicyEnforcer, defaultPolicies() (5 rules)
 *   shell    — runCommand(), shellEscape(), stripAnsi()
 */

// Error
export {
  PsmMcpError,
  sanitizeError,
  type PsmMcpErrorKind,
} from "./error.js";

// Input validation
export {
  MAX_INPUT_BYTES,
  validateNoInjection,
  validateName,
  validateSandboxName,
  validatePresetName,
  validateInputSize,
  requireString,
  optionalString,
  optionalNumber,
  requireBoolean,
  optionalBoolean,
} from "./input.js";

// Tool types
export {
  type ToolDefinition,
  type ToolResult,
  type TextContent,
  type ToolHandler,
  type McpAction,
  textResult,
  jsonResult,
  errorResult,
  toAction,
} from "./tool.js";

// Output filter
export {
  OutputFilter,
  defaultFilter,
  type FilterResult,
  type Redaction,
} from "./filter.js";

// Health
export {
  type HealthStatus,
  type HealthCheck,
  type Healthable,
  healthy,
  degraded,
  unhealthy,
  withLatency,
} from "./health.js";

// Audit
export {
  AuditLogger,
  MAX_AUDIT_ENTRIES,
  type AuditEntry,
  type AuditStats,
} from "./audit.js";

// Rate limiting
export { RateLimiter } from "./rate-limit.js";

// Policy
export {
  PolicyEnforcer,
  defaultPolicies,
  createPolicy,
  type Policy,
  type PolicyAction,
  type PolicyViolation,
  type PolicyResult,
} from "./policy.js";

// Shell
export {
  runCommand,
  runCommandChecked,
  stripAnsi,
  shellEscape,
  DEFAULT_TIMEOUT_MS,
  type ShellOutput,
} from "./shell.js";
