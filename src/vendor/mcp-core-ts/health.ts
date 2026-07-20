/**
 * Health checks — mirrors psm-mcp-core/src/health.rs 1:1.
 */

export type HealthStatus = "healthy" | "degraded" | "unhealthy";

export interface HealthCheck {
  status: HealthStatus;
  component: string;
  message?: string;
  latencyMs?: number;
}

/** Interface for components that can report their health. */
export interface Healthable {
  healthCheck(): Promise<HealthCheck>;
}

export function healthy(component: string): HealthCheck {
  return { status: "healthy", component };
}

export function degraded(component: string, message: string): HealthCheck {
  return { status: "degraded", component, message };
}

export function unhealthy(component: string, message: string): HealthCheck {
  return { status: "unhealthy", component, message };
}

export function withLatency(check: HealthCheck, ms: number): HealthCheck {
  return { ...check, latencyMs: ms };
}
