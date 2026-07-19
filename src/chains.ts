/**
 * Chain registry — the single source of truth for every network this server can reach.
 *
 * Two consumers, one dataset:
 *   - The Foundry tools (`cast_*` / `forge_*`) need a plain RPC URL string.
 *   - EVM clients (viem) need a structured `Chain` object.
 *
 * `toViemChain()` derives the second from the first. It emits viem's `Chain` shape
 * as plain data rather than importing viem — viem's `defineChain` is effectively an
 * identity function whose job is const type inference, so a structurally identical
 * object is accepted by `createPublicClient({ chain })` and friends. That keeps this
 * package free of an EVM-library dependency while still letting a viem-based consumer
 * (e.g. an x402 facilitator) share these definitions instead of redeclaring them.
 */

export interface ChainConfig {
  /** Registry key, also the value accepted by tool `network` params. */
  key: string;
  /** Human-readable name. */
  name: string;
  /** EIP-155 chain ID. */
  chainId: number;
  /** Default JSON-RPC endpoint. Overridable via env — see `resolveRpcUrl`. */
  rpcUrl: string;
  /** Block explorer base URL, if the chain has one. */
  explorerUrl?: string;
  /** Explorer display name, used by viem consumers. */
  explorerName?: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  testnet: boolean;
  /** Aliases accepted in place of `key` (backwards compatibility). */
  aliases?: string[];
}

// Robinhood Chain is deliberately absent: it has its own dedicated server
// (robinhood-chain-mcp) and its own facilitator (x402-facilitator-evm), each
// carrying its own definitions. This package is a ZetaChain client; the registry
// exists to remove hardcoded ternaries, not to become a universal chain list.
export const CHAINS: Record<string, ChainConfig> = {
  "zetachain-mainnet": {
    key: "zetachain-mainnet",
    name: "ZetaChain Mainnet",
    chainId: 7000,
    rpcUrl: "https://zetachain-evm.blockpi.network/v1/rpc/public",
    explorerUrl: "https://explorer.zetachain.com",
    explorerName: "ZetaScan",
    nativeCurrency: { name: "Zeta", symbol: "ZETA", decimals: 18 },
    testnet: false,
    // "mainnet" was the pre-registry value of the get_network_info enum.
    aliases: ["mainnet", "zeta_mainnet", "zetachain"],
  },
  "zetachain-testnet": {
    key: "zetachain-testnet",
    name: "ZetaChain Athens Testnet",
    chainId: 7001,
    rpcUrl: "https://zetachain-athens-evm.blockpi.network/v1/rpc/public",
    explorerUrl: "https://athens3.explorer.zetachain.com",
    explorerName: "ZetaScan Athens",
    nativeCurrency: { name: "Zeta", symbol: "aZETA", decimals: 18 },
    testnet: true,
    aliases: ["testnet", "zeta_testnet", "athens"],
  },
  "base-sepolia": {
    key: "base-sepolia",
    name: "Base Sepolia",
    chainId: 84532,
    rpcUrl: "https://sepolia.base.org",
    explorerUrl: "https://sepolia.basescan.org",
    explorerName: "Basescan",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    testnet: true,
  },
};

/** Every accepted `network` value, for tool input schema enums. */
export const CHAIN_KEYS: string[] = Object.keys(CHAINS);

/** Keys plus aliases — what `resolveChain` will actually accept. */
export const ACCEPTED_NETWORK_VALUES: string[] = Object.values(CHAINS).flatMap(
  (c) => [c.key, ...(c.aliases ?? [])],
);

/** The chain used when a caller supplies nothing. Preserves prior default behaviour. */
export const DEFAULT_CHAIN_KEY = "zetachain-testnet";

/**
 * Resolve a user-supplied network string to a chain, accepting keys and aliases.
 * Returns undefined rather than throwing so callers can produce their own error
 * listing the valid values.
 */
export function resolveChain(network?: string): ChainConfig | undefined {
  const needle = (network ?? DEFAULT_CHAIN_KEY).trim().toLowerCase();
  return Object.values(CHAINS).find(
    (c) =>
      c.key === needle ||
      (c.aliases ?? []).includes(needle) ||
      String(c.chainId) === needle,
  );
}

/**
 * RPC endpoint for a chain, honouring env overrides in precedence order:
 *   1. RPC_URL_<KEY>  (e.g. RPC_URL_ROBINHOOD) — per-chain
 *   2. RPC_URL                                 — global default
 *   3. the registry default
 *
 * `RPC_URL` was documented in .env.example but never read by the server; this is
 * the first place it takes effect.
 */
export function resolveRpcUrl(chain: ChainConfig): string {
  const envKey = `RPC_URL_${chain.key.toUpperCase().replace(/-/g, "_")}`;
  return process.env[envKey] || process.env.RPC_URL || chain.rpcUrl;
}

/** viem's `Chain` shape, structurally. Kept local so viem stays an optional dep. */
export interface ViemChainShape {
  id: number;
  name: string;
  nativeCurrency: { name: string; symbol: string; decimals: number };
  rpcUrls: { default: { http: string[] } };
  blockExplorers?: { default: { name: string; url: string } };
  testnet: boolean;
}

/**
 * Derive a viem-compatible `Chain` from a registry entry. Accepts a chain or any
 * string `resolveChain` understands; throws on an unknown network so a viem consumer
 * fails loudly at construction rather than silently talking to the wrong chain.
 */
export function toViemChain(chainOrKey: ChainConfig | string): ViemChainShape {
  const chain =
    typeof chainOrKey === "string" ? resolveChain(chainOrKey) : chainOrKey;
  if (!chain) {
    throw new Error(
      `Unknown network "${chainOrKey}". Valid values: ${ACCEPTED_NETWORK_VALUES.join(", ")}`,
    );
  }
  return {
    id: chain.chainId,
    name: chain.name,
    nativeCurrency: { ...chain.nativeCurrency },
    rpcUrls: { default: { http: [resolveRpcUrl(chain)] } },
    ...(chain.explorerUrl
      ? {
          blockExplorers: {
            default: {
              name: chain.explorerName ?? "Explorer",
              url: chain.explorerUrl,
            },
          },
        }
      : {}),
    testnet: chain.testnet,
  };
}
