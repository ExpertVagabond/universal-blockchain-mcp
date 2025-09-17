export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  error?: Error;
}

class Logger {
  private logLevel: LogLevel = LogLevel.INFO;
  private logs: LogEntry[] = [];
  private maxLogs: number = 1000;

  setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.logLevel;
  }

  private createLogEntry(level: LogLevel, message: string, context?: Record<string, any>, error?: Error): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      error
    };
  }

  private writeLog(entry: LogEntry): void {
    // Store in memory (with rotation)
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Output to console
    const levelName = LogLevel[entry.level];
    const contextStr = entry.context ? ` ${JSON.stringify(entry.context)}` : '';
    const errorStr = entry.error ? ` Error: ${entry.error.message}` : '';
    
    const logMessage = `[${entry.timestamp}] ${levelName}: ${entry.message}${contextStr}${errorStr}`;
    
    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(logMessage);
        break;
      case LogLevel.INFO:
        console.log(logMessage);
        break;
      case LogLevel.WARN:
        console.warn(logMessage);
        break;
      case LogLevel.ERROR:
        console.error(logMessage);
        break;
    }
  }

  debug(message: string, context?: Record<string, any>): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      this.writeLog(this.createLogEntry(LogLevel.DEBUG, message, context));
    }
  }

  info(message: string, context?: Record<string, any>): void {
    if (this.shouldLog(LogLevel.INFO)) {
      this.writeLog(this.createLogEntry(LogLevel.INFO, message, context));
    }
  }

  warn(message: string, context?: Record<string, any>, error?: Error): void {
    if (this.shouldLog(LogLevel.WARN)) {
      this.writeLog(this.createLogEntry(LogLevel.WARN, message, context, error));
    }
  }

  error(message: string, context?: Record<string, any>, error?: Error): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      this.writeLog(this.createLogEntry(LogLevel.ERROR, message, context, error));
    }
  }

  // Get recent logs for health monitoring
  getRecentLogs(count: number = 100): LogEntry[] {
    return this.logs.slice(-count);
  }

  // Get logs by level
  getLogsByLevel(level: LogLevel, count: number = 50): LogEntry[] {
    return this.logs
      .filter(log => log.level === level)
      .slice(-count);
  }

  // Get error statistics
  getErrorStats(): { total: number; recent: number; lastError?: LogEntry } {
    const errorLogs = this.logs.filter(log => log.level === LogLevel.ERROR);
    const recentErrors = errorLogs.filter(log => 
      Date.now() - new Date(log.timestamp).getTime() < 3600000 // Last hour
    );

    return {
      total: errorLogs.length,
      recent: recentErrors.length,
      lastError: errorLogs[errorLogs.length - 1]
    };
  }

  // Clear old logs
  clearOldLogs(olderThanHours: number = 24): void {
    const cutoff = Date.now() - (olderThanHours * 3600000);
    this.logs = this.logs.filter(log => 
      new Date(log.timestamp).getTime() > cutoff
    );
  }
}

// Create singleton logger instance
export const logger = new Logger();

// Set log level from environment
const envLogLevel = process.env.LOG_LEVEL?.toUpperCase();
if (envLogLevel && envLogLevel in LogLevel) {
  logger.setLogLevel(LogLevel[envLogLevel as keyof typeof LogLevel]);
}