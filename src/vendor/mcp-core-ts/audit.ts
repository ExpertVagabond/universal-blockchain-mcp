/**
 * Audit logging — mirrors psm-mcp-core/src/audit.rs 1:1.
 */

import { randomUUID } from "node:crypto";

/** Maximum audit log entries before FIFO eviction. */
export const MAX_AUDIT_ENTRIES = 50_000;

/** A single audit log entry. */
export interface AuditEntry {
  id: string;
  eventType: string;
  timestamp: string;
  details: string;
  userId: string;
}

/** Audit statistics. */
export interface AuditStats {
  totalRequests: number;
  blockedRequests: number;
  filteredRequests: number;
  entriesCount: number;
}

/** In-memory audit logger with bounded capacity. */
export class AuditLogger {
  private entries: AuditEntry[] = [];
  private readonly maxEntries: number;
  private totalRequests = 0;
  private blockedRequests = 0;
  private filteredRequests = 0;

  constructor(maxEntries: number = MAX_AUDIT_ENTRIES) {
    this.maxEntries = maxEntries;
  }

  /** Log an event. */
  log(eventType: string, details: string, userId: string): void {
    this.totalRequests++;

    if (eventType.includes("BLOCK") || eventType.includes("VIOLATION")) {
      this.blockedRequests++;
    }
    if (eventType.includes("FILTER")) {
      this.filteredRequests++;
    }

    const entry: AuditEntry = {
      id: `psm_${randomUUID()}`,
      eventType,
      timestamp: new Date().toISOString(),
      details,
      userId,
    };

    if (this.entries.length >= this.maxEntries) {
      this.entries.shift();
    }
    this.entries.push(entry);
  }

  /** Get recent entries (newest first). */
  recent(limit: number): AuditEntry[] {
    return this.entries.slice(-limit).reverse();
  }

  /** Get audit statistics. */
  stats(): AuditStats {
    return {
      totalRequests: this.totalRequests,
      blockedRequests: this.blockedRequests,
      filteredRequests: this.filteredRequests,
      entriesCount: this.entries.length,
    };
  }

  /** Clear all entries (keeps stats). */
  clear(): void {
    this.entries = [];
  }
}
