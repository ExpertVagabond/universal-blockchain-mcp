/**
 * Shell execution utilities — mirrors nemoclaw-mcp-rs/src/shell.rs.
 * Timeout-wrapped command execution with structured output.
 */

import { execFile } from "node:child_process";
import { PsmMcpError } from "./error.js";

/** Structured output from a shell command. */
export interface ShellOutput {
  stdout: string;
  stderr: string;
  code: number;
}

/** Default command timeout (30 seconds). */
export const DEFAULT_TIMEOUT_MS = 30_000;

/**
 * Run a command with timeout and structured output.
 */
export function runCommand(
  program: string,
  args: string[],
  timeoutMs: number = DEFAULT_TIMEOUT_MS
): Promise<ShellOutput> {
  return new Promise((resolve, reject) => {
    const proc = execFile(
      program,
      args,
      {
        timeout: timeoutMs,
        maxBuffer: 10 * 1024 * 1024, // 10MB
        encoding: "utf-8",
      },
      (error, stdout, stderr) => {
        if (error && "killed" in error && error.killed) {
          reject(PsmMcpError.timeout(timeoutMs));
          return;
        }
        resolve({
          stdout: stdout ?? "",
          stderr: stderr ?? "",
          code: typeof error?.code === "number" ? error.code : (error ? 1 : 0),
        });
      }
    );

    // Ensure process is killed on timeout.
    proc.on("error", (err) => {
      reject(PsmMcpError.shellExec(err.message));
    });
  });
}

/**
 * Run a command and throw if exit code is non-zero.
 */
export async function runCommandChecked(
  program: string,
  args: string[],
  timeoutMs: number = DEFAULT_TIMEOUT_MS
): Promise<ShellOutput> {
  const output = await runCommand(program, args, timeoutMs);
  if (output.code !== 0) {
    throw PsmMcpError.shellExec(
      `${program} exited with code ${output.code}: ${output.stderr.trim()}`
    );
  }
  return output;
}

/** Strip ANSI escape codes from a string. */
export function stripAnsi(text: string): string {
  // eslint-disable-next-line no-control-regex
  return text.replace(/\x1b\[[0-9;]*m/g, "");
}

/**
 * Escape a string for safe use in shell single-quotes.
 * Matches nemoclaw-mcp's shell escape pattern.
 */
export function shellEscape(s: string): string {
  return `'${s.replace(/'/g, "'\\''")}'`;
}
