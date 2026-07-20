/**
 * Input validation — mirrors psm-mcp-core/src/input.rs 1:1.
 * Same regex patterns, same max lengths, same error messages.
 */

import { PsmMcpError } from "./error.js";

/** Maximum input size (512KB, matching guardrails-mcp). */
export const MAX_INPUT_BYTES = 512_000;

// Injection patterns — reject inputs containing these.
// Identical to Rust INJECTION_RE.
const INJECTION_PATTERNS: Array<[string, RegExp]> = [
  ["shell_meta", /[;|&`]/],
  ["path_traversal", /\.\.[\\/]/],
  ["null_byte", /\x00/],
  ["newline_inject", /[\r\n]/],
];

// Name pattern: alphanumeric, hyphens, underscores.
const NAME_RE = /^[a-zA-Z0-9_-]+$/;

/**
 * Validate a string contains no shell injection characters.
 */
export function validateNoInjection(value: string, label: string): string {
  for (const [category, re] of INJECTION_PATTERNS) {
    if (re.test(value)) {
      throw PsmMcpError.inputValidation(
        `${label} contains forbidden characters (${category})`
      );
    }
  }
  return value;
}

/**
 * Validate a name field (alphanumeric + hyphen + underscore, bounded length).
 */
export function validateName(value: string, label: string, maxLen: number): string {
  if (!value) {
    throw PsmMcpError.inputValidation(`${label} cannot be empty`);
  }
  if (value.length > maxLen) {
    throw PsmMcpError.inputValidation(
      `${label} exceeds max length of ${maxLen}`
    );
  }
  if (!NAME_RE.test(value)) {
    throw PsmMcpError.inputValidation(
      `${label} must be alphanumeric with hyphens/underscores only`
    );
  }
  return value;
}

/**
 * Validate a sandbox name (alphanumeric + hyphen + underscore, max 64 chars).
 */
export function validateSandboxName(name: string): string {
  return validateName(name, "sandbox name", 64);
}

/**
 * Validate a policy preset name.
 */
export function validatePresetName(name: string): string {
  return validateName(name, "preset name", 128);
}

/**
 * Validate input byte size doesn't exceed limit.
 */
export function validateInputSize(
  input: string,
  maxBytes: number = MAX_INPUT_BYTES
): void {
  const size = Buffer.byteLength(input, "utf-8");
  if (size > maxBytes) {
    throw PsmMcpError.inputValidation(
      `input size ${size}B exceeds maximum ${maxBytes}B`
    );
  }
}

/**
 * Validate and extract a required string field from JSON arguments.
 */
export function requireString(
  args: Record<string, unknown>,
  field: string
): string {
  const val = args[field];
  if (typeof val !== "string" || !val) {
    throw PsmMcpError.inputValidation(`missing required field: ${field}`);
  }
  return val;
}

/**
 * Extract an optional string field from JSON arguments.
 */
export function optionalString(
  args: Record<string, unknown>,
  field: string
): string | undefined {
  const val = args[field];
  return typeof val === "string" ? val : undefined;
}

/**
 * Extract an optional number field from JSON arguments.
 */
export function optionalNumber(
  args: Record<string, unknown>,
  field: string
): number | undefined {
  const val = args[field];
  return typeof val === "number" ? val : undefined;
}

/**
 * Extract a required boolean field from JSON arguments.
 */
export function requireBoolean(
  args: Record<string, unknown>,
  field: string
): boolean {
  const val = args[field];
  if (typeof val !== "boolean") {
    throw PsmMcpError.inputValidation(`missing required boolean field: ${field}`);
  }
  return val;
}

/**
 * Extract an optional boolean field from JSON arguments.
 */
export function optionalBoolean(
  args: Record<string, unknown>,
  field: string
): boolean | undefined {
  const val = args[field];
  return typeof val === "boolean" ? val : undefined;
}
