import { z } from 'zod';

// Parameter schema for command definitions
export const ParameterSchema = z.object({
  type: z.enum(['string', 'number', 'boolean', 'array', 'object']),
  description: z.string(),
  required: z.boolean(),
  enum: z.array(z.string()).optional(),
  sensitive: z.boolean().optional(), // For private keys, etc.
});

// Command definition schema
export const CommandSchema = z.object({
  name: z.string(),
  description: z.string(), 
  category: z.string(),
  cliCommand: z.string(),
  parameters: z.record(ParameterSchema),
  examples: z.array(z.string()),
});

// Full commands file schema
export const ZetaChainCommandsSchema = z.object({
  version: z.string(),
  generated: z.string(),
  source: z.literal('zetachain-cli'),
  commands: z.array(CommandSchema),
  categories: z.record(z.string()),
  metadata: z.object({
    cli_version: z.string(),
    mcp_version: z.string(),
    supported_networks: z.array(z.string()),
    supported_chains: z.array(z.object({
      name: z.string(),
      chainId: z.string(), 
      rpc: z.string(),
    })),
  }),
});

export type ZetaChainCommands = z.infer<typeof ZetaChainCommandsSchema>;
export type CommandDefinition = z.infer<typeof CommandSchema>;
export type ParameterDefinition = z.infer<typeof ParameterSchema>;

// Validation function
export function validateCommandsFile(data: unknown): ZetaChainCommands {
  return ZetaChainCommandsSchema.parse(data);
}

// Helper to convert command definition to MCP tool schema
export function commandToMCPTool(command: CommandDefinition) {
  const inputSchema: any = {
    type: 'object',
    properties: {},
    required: [],
  };

  // Convert parameters to JSON Schema
  for (const [paramName, param] of Object.entries(command.parameters)) {
    inputSchema.properties[paramName] = {
      type: param.type,
      description: param.description,
    };

    if (param.enum) {
      inputSchema.properties[paramName].enum = param.enum;
    }

    if (param.required) {
      inputSchema.required.push(paramName);
    }
  }

  return {
    name: command.name,
    description: command.description,
    inputSchema,
    category: command.category,
    cliCommand: command.cliCommand,
    examples: command.examples,
  };
}