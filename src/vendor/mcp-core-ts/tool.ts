/**
 * MCP tool types — mirrors psm-mcp-core/src/tool.rs 1:1.
 */

import type { PsmMcpError } from "./error.js";

/** Definition of an MCP tool, sent in response to `tools/list`. */
export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
}

/** Content block within a tool result. */
export interface TextContent {
  type: "text";
  text: string;
}

/** Result returned by a tool handler, sent in `tools/call` response. */
export interface ToolResult {
  content: TextContent[];
  isError?: boolean;
}

/**
 * Interface that all MCP tool handlers must implement.
 * Mirrors the Rust ToolHandler trait.
 */
export interface ToolHandler {
  definition(): ToolDefinition;
  handle(args: Record<string, unknown>): Promise<ToolResult>;
}

/**
 * McpAction — combines a tool definition with its handler.
 * Matches the pattern from nemoclaw-mcp's types.ts.
 */
export interface McpAction {
  tool: ToolDefinition;
  handler: (args: Record<string, unknown>) => Promise<ToolResult>;
}

/** Create a successful text result. */
export function textResult(text: string): ToolResult {
  return {
    content: [{ type: "text", text }],
  };
}

/** Create a successful JSON result. */
export function jsonResult(value: unknown): ToolResult {
  return {
    content: [{ type: "text", text: JSON.stringify(value, null, 2) }],
  };
}

/** Create an error result. */
export function errorResult(msg: string): ToolResult {
  return {
    content: [{ type: "text", text: msg }],
    isError: true,
  };
}

/**
 * Convert a ToolHandler to an McpAction.
 * Convenience for servers that prefer the action pattern.
 */
export function toAction(handler: ToolHandler): McpAction {
  return {
    tool: handler.definition(),
    handler: (args) => handler.handle(args),
  };
}
