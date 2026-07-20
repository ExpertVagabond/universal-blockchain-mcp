/**
 * Policy enforcement — mirrors psm-mcp-policy/src/policy.rs 1:1.
 * Same 5 default policies, same action types.
 */

export type PolicyAction = "block" | "warn" | "redact";

/** A single policy rule with a compiled regex pattern. */
export interface Policy {
  name: string;
  description: string;
  action: PolicyAction;
  patternStr: string;
  pattern: RegExp;
}

/** Create a policy with compiled regex. */
export function createPolicy(
  name: string,
  description: string,
  action: PolicyAction,
  patternStr: string
): Policy {
  return {
    name,
    description,
    action,
    patternStr,
    pattern: new RegExp(patternStr, "i"),
  };
}

/** A violation found by policy evaluation. */
export interface PolicyViolation {
  policyName: string;
  description: string;
  action: PolicyAction;
  matchedText?: string;
}

/** Result of evaluating all policies against input. */
export interface PolicyResult {
  allowed: boolean;
  violations: PolicyViolation[];
  warnings: PolicyViolation[];
}

/**
 * Default 5 policies — identical to Rust default_policies().
 */
export function defaultPolicies(): Policy[] {
  return [
    createPolicy(
      "no_secrets_in_output",
      "Block output containing secrets",
      "redact",
      String.raw`(password|secret)\s*[=:]\s*\S+`
    ),
    createPolicy(
      "no_sql_injection",
      "Block SQL injection patterns",
      "block",
      String.raw`(union\s+select|;\s*drop\s+table)`
    ),
    createPolicy(
      "no_path_traversal",
      "Block path traversal attempts",
      "block",
      String.raw`\.\.[/\\]\.\.[/\\]\.\.`
    ),
    createPolicy(
      "no_xxe",
      "Block XXE injection",
      "block",
      String.raw`(<!ENTITY|<!DOCTYPE\s+\w+\s+SYSTEM)`
    ),
    createPolicy(
      "no_command_injection",
      "Block command injection in output",
      "block",
      String.raw`;\s*\b(cat|ls|whoami|id|uname|curl|wget)\b`
    ),
  ];
}

/** Maximum number of policies (safety limit). */
const MAX_POLICIES = 1000;

/** Policy enforcer — evaluates text against a set of policies. */
export class PolicyEnforcer {
  private readonly policies: Policy[];

  constructor(policies?: Policy[]) {
    this.policies = policies ?? defaultPolicies();
    if (this.policies.length > MAX_POLICIES) {
      throw new Error(`Too many policies: ${this.policies.length} > ${MAX_POLICIES}`);
    }
  }

  /** Evaluate text against all policies. */
  evaluate(text: string): PolicyResult {
    const violations: PolicyViolation[] = [];
    const warnings: PolicyViolation[] = [];

    for (const policy of this.policies) {
      const match = policy.pattern.exec(text);
      if (match) {
        const violation: PolicyViolation = {
          policyName: policy.name,
          description: policy.description,
          action: policy.action,
          matchedText: match[0],
        };

        if (policy.action === "warn") {
          warnings.push(violation);
        } else {
          violations.push(violation);
        }
      }
    }

    return {
      allowed: violations.length === 0,
      violations,
      warnings,
    };
  }

  /** Add a policy at runtime. */
  addPolicy(policy: Policy): void {
    if (this.policies.length >= MAX_POLICIES) {
      throw new Error("Maximum policy count reached");
    }
    this.policies.push(policy);
  }

  /** Get current policy count. */
  get count(): number {
    return this.policies.length;
  }
}
