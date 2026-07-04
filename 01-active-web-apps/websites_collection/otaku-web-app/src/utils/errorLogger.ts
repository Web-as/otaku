// Centralized Error Logging Utility

export interface ErrorLog {
  message: string;
  stack?: string;
  context?: Record<string, any>;
  timestamp: string;
  level: 'error' | 'warn' | 'info';
  userId?: string;
}

class ErrorLogger {
  private logs: ErrorLog[] = [];
  private maxLogs = 100;

  /**
   * Log an error
   */
  error(message: string, error?: Error, context?: Record<string, any>) {
    const log: ErrorLog = {
      message,
      stack: error?.stack,
      context,
      timestamp: new Date().toISOString(),
      level: 'error',
    };

    this.addLog(log);
    console.error('[ERROR]', message, error, context);

    // Send to external service in production
    if (import.meta.env.PROD) {
      this.sendToExternalService(log);
    }
  }

  /**
   * Log a warning
   */
  warn(message: string, context?: Record<string, any>) {
    const log: ErrorLog = {
      message,
      context,
      timestamp: new Date().toISOString(),
      level: 'warn',
    };

    this.addLog(log);
    console.warn('[WARN]', message, context);
  }

  /**
   * Log info
   */
  info(message: string, context?: Record<string, any>) {
    const log: ErrorLog = {
      message,
      context,
      timestamp: new Date().toISOString(),
      level: 'info',
    };

    this.addLog(log);
    console.info('[INFO]', message, context);
  }

  /**
   * Add log to internal storage
   */
  private addLog(log: ErrorLog) {
    this.logs.push(log);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift(); // Remove oldest log
    }
  }

  /**
   * Get all logs
   */
  getLogs(): ErrorLog[] {
    return [...this.logs];
  }

  /**
   * Clear all logs
   */
  clearLogs() {
    this.logs = [];
  }

  /**
   * Export logs as JSON
   */
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  /**
   * Send to external logging service (Sentry, LogRocket, etc.)
   */
  private sendToExternalService(log: ErrorLog) {
    // TODO: Implement external service integration
    // Example: Sentry.captureException(log);
    
    // For now, just store in sessionStorage for debugging
    try {
      const existingLogs = sessionStorage.getItem('error_logs');
      const logs = existingLogs ? JSON.parse(existingLogs) : [];
      logs.push(log);
      sessionStorage.setItem('error_logs', JSON.stringify(logs.slice(-50))); // Keep last 50
    } catch (e) {
      console.error('Failed to store error log:', e);
    }
  }

  /**
   * Set user context for error tracking
   */
  setUserContext(userId: string) {
    this.logs.forEach(log => {
      log.userId = userId;
    });
  }
}

// Export singleton instance
export const errorLogger = new ErrorLogger();

// Global error handler
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    errorLogger.error('Uncaught error', event.error, {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    errorLogger.error('Unhandled promise rejection', undefined, {
      reason: event.reason,
    });
  });
}

export default errorLogger;
