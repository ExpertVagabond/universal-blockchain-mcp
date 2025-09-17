import { logger } from './logger.js';

export interface PerformanceMetrics {
  toolCalls: {
    total: number;
    successful: number;
    failed: number;
    averageResponseTime: number;
    slowestCall: { tool: string; duration: number; timestamp: string } | null;
  };
  cache: {
    hits: number;
    misses: number;
    hitRate: number;
  };
  memory: {
    heapUsed: number;
    heapTotal: number;
    external: number;
    rss: number;
  };
  uptime: number;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

interface CallMetric {
  tool: string;
  duration: number;
  timestamp: string;
  success: boolean;
}

class PerformanceMonitor {
  private callMetrics: CallMetric[] = [];
  private cache = new Map<string, CacheEntry<any>>();
  private cacheHits = 0;
  private cacheMisses = 0;
  private startTime = Date.now();
  private maxMetrics = 1000;

  // Cache operations
  setCacheItem<T>(key: string, data: T, ttlMs: number = 300000): void { // 5 min default TTL
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs
    });
    
    logger.debug('Cache item set', { key, ttl: ttlMs });
  }

  getCacheItem<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.cacheMisses++;
      logger.debug('Cache miss', { key });
      return null;
    }

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.cacheMisses++;
      logger.debug('Cache expired', { key });
      return null;
    }

    this.cacheHits++;
    logger.debug('Cache hit', { key });
    return entry.data as T;
  }

  clearCache(): void {
    const size = this.cache.size;
    this.cache.clear();
    logger.info('Cache cleared', { previousSize: size });
  }

  // Performance tracking
  startTimer(): () => number {
    const startTime = process.hrtime.bigint();
    
    return (): number => {
      const endTime = process.hrtime.bigint();
      return Number(endTime - startTime) / 1000000; // Convert to milliseconds
    };
  }

  recordToolCall(tool: string, duration: number, success: boolean): void {
    const metric: CallMetric = {
      tool,
      duration,
      timestamp: new Date().toISOString(),
      success
    };

    this.callMetrics.push(metric);
    
    // Rotate metrics to prevent memory bloat
    if (this.callMetrics.length > this.maxMetrics) {
      this.callMetrics = this.callMetrics.slice(-this.maxMetrics);
    }

    // Log slow calls
    if (duration > 5000) { // 5 seconds
      logger.warn('Slow tool call detected', { tool, duration, success });
    }

    logger.debug('Tool call recorded', { tool, duration, success });
  }

  getMetrics(): PerformanceMetrics {
    const successful = this.callMetrics.filter(m => m.success).length;
    const failed = this.callMetrics.filter(m => !m.success).length;
    const total = this.callMetrics.length;
    
    const totalDuration = this.callMetrics.reduce((sum, m) => sum + m.duration, 0);
    const averageResponseTime = total > 0 ? totalDuration / total : 0;
    
    const slowestCall = this.callMetrics.reduce((slowest, current) => {
      if (!slowest || current.duration > slowest.duration) {
        return { tool: current.tool, duration: current.duration, timestamp: current.timestamp };
      }
      return slowest;
    }, null as { tool: string; duration: number; timestamp: string } | null);

    const totalCacheRequests = this.cacheHits + this.cacheMisses;
    const hitRate = totalCacheRequests > 0 ? (this.cacheHits / totalCacheRequests) * 100 : 0;

    return {
      toolCalls: {
        total,
        successful,
        failed,
        averageResponseTime: Math.round(averageResponseTime),
        slowestCall
      },
      cache: {
        hits: this.cacheHits,
        misses: this.cacheMisses,
        hitRate: Math.round(hitRate * 100) / 100
      },
      memory: process.memoryUsage(),
      uptime: Date.now() - this.startTime
    };
  }

  // Get recent performance data
  getRecentCalls(minutes: number = 10): CallMetric[] {
    const cutoff = Date.now() - (minutes * 60 * 1000);
    return this.callMetrics.filter(metric => 
      new Date(metric.timestamp).getTime() > cutoff
    );
  }

  // Clean up old metrics
  cleanupOldMetrics(olderThanHours: number = 24): void {
    const cutoff = Date.now() - (olderThanHours * 3600000);
    this.callMetrics = this.callMetrics.filter(metric => 
      new Date(metric.timestamp).getTime() > cutoff
    );
    
    logger.info('Old metrics cleaned up', { cutoffHours: olderThanHours });
  }

  // Cache cleanup
  cleanupExpiredCache(): void {
    const now = Date.now();
    let cleaned = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      logger.info('Expired cache entries cleaned', { count: cleaned });
    }
  }
}

// Wrapper function for timing operations
export function withTiming<T>(operation: () => Promise<T>): Promise<{ result: T; duration: number }> {
  const timer = performanceMonitor.startTimer();
  
  return operation().then(result => ({
    result,
    duration: timer()
  }));
}

// Create singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Schedule periodic cleanup
setInterval(() => {
  performanceMonitor.cleanupExpiredCache();
  performanceMonitor.cleanupOldMetrics();
}, 3600000); // Every hour