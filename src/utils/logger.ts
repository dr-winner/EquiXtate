/**
 * Simple logging utility for the application
 * 
 * Provides consistent logging interface across the codebase.
 * In production, this could be extended to send logs to a service.
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  level: LogLevel;
  message: string;
  data?: any;
  timestamp: string;
}

class Logger {
  private isDevelopment = import.meta.env.DEV;

  private formatMessage(level: LogLevel, message: string, data?: any): LogEntry {
    return {
      level,
      message,
      data,
      timestamp: new Date().toISOString(),
    };
  }

  private shouldLog(level: LogLevel): boolean {
    // In production, only log warnings and errors
    if (!this.isDevelopment && (level === 'debug' || level === 'info')) {
      return false;
    }
    return true;
  }

  /**
   * Log informational message
   */
  info(message: string, data?: any): void {
    if (!this.shouldLog('info')) return;
    const entry = this.formatMessage('info', message, data);
    console.log(`[INFO] ${entry.timestamp} - ${message}`, data || '');
  }

  /**
   * Log warning message
   */
  warn(message: string, data?: any): void {
    if (!this.shouldLog('warn')) return;
    const entry = this.formatMessage('warn', message, data);
    console.warn(`[WARN] ${entry.timestamp} - ${message}`, data || '');
  }

  /**
   * Log error message
   */
  error(message: string, error?: any): void {
    if (!this.shouldLog('error')) return;
    const entry = this.formatMessage('error', message, error);
    console.error(`[ERROR] ${entry.timestamp} - ${message}`, error || '');
  }

  /**
   * Log debug message (only in development)
   */
  debug(message: string, data?: any): void {
    if (!this.shouldLog('debug')) return;
    const entry = this.formatMessage('debug', message, data);
    console.debug(`[DEBUG] ${entry.timestamp} - ${message}`, data || '');
  }

  /**
   * Log Web3 transaction
   */
  transaction(action: string, txHash?: string, data?: any): void {
    this.info(`Transaction: ${action}`, { txHash, ...data });
  }

  /**
   * Log wallet event
   */
  wallet(event: string, address?: string, data?: any): void {
    this.info(`Wallet: ${event}`, { address, ...data });
  }
}

// Export singleton instance
export const logger = new Logger();
