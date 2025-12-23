/**
 * Centralized logging system with configurable levels and structured output
 * Supports different log levels, context tracking, and performance monitoring
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4,
}

/**
 *
 */
export interface LogContext {
  component?: string;
  operation?: string;
  userId?: string;
  requestId?: string;
  correlationId?: string;
  [key: string]: any;
}

/**
 *
 */
export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  context?: LogContext;
  error?: Error | undefined;
  duration?: number;
}

/**
 *
 */
export class Logger {
  private static instance: Logger;
  private currentLevel: LogLevel = LogLevel.INFO;
  private readonly contextStack: LogContext[] = [];

  private constructor() {}

  /**
   *
   */
  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  /**
   *
   * @param level
   */
  setLevel(level: LogLevel): void {
    this.currentLevel = level;
  }

  /**
   *
   * @param context
   */
  pushContext(context: LogContext): void {
    this.contextStack.push(context);
  }

  /**
   *
   */
  popContext(): void {
    this.contextStack.pop();
  }

  /**
   *
   */
  private getCurrentContext(): LogContext | undefined {
    return this.contextStack.length > 0 ? Object.assign({}, ...this.contextStack) : undefined;
  }

  /**
   *
   * @param level
   */
  private shouldLog(level: LogLevel): boolean {
    return level >= this.currentLevel;
  }

  /**
   *
   * @param entry
   */
  private formatMessage(entry: LogEntry): string {
    const levelStr = LogLevel[entry.level],
      timestamp = entry.timestamp.toISOString(),
      contextStr = entry.context ? ` ${JSON.stringify(entry.context)}` : '',
      durationStr = entry.duration ? ` (${entry.duration}ms)` : '',
      errorStr = entry.error ? ` Error: ${entry.error.message}` : '';

    return `[${timestamp}] ${levelStr}: ${entry.message}${contextStr}${durationStr}${errorStr}`;
  }

  /**
   *
   * @param entry
   */
  private log(entry: LogEntry): void {
    if (!this.shouldLog(entry.level)) {
      return;
    }

    const formatted = this.formatMessage(entry);

    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(formatted);
        break;
      case LogLevel.INFO:
        console.info(formatted);
        break;
      case LogLevel.WARN:
        console.warn(formatted);
        break;
      case LogLevel.ERROR:
      case LogLevel.FATAL:
        console.error(formatted);
        if (entry.error?.stack) {
          console.error(entry.error.stack);
        }
        break;
    }
  }

  /**
   *
   * @param message
   * @param context
   */
  debug(message: string, context?: LogContext): void {
    this.log({
      level: LogLevel.DEBUG,
      message,
      timestamp: new Date(),
      context: { ...this.getCurrentContext(), ...context },
    });
  }

  /**
   *
   * @param message
   * @param context
   */
  info(message: string, context?: LogContext): void {
    this.log({
      level: LogLevel.INFO,
      message,
      timestamp: new Date(),
      context: { ...this.getCurrentContext(), ...context },
    });
  }

  /**
   *
   * @param message
   * @param context
   */
  warn(message: string, context?: LogContext): void {
    this.log({
      level: LogLevel.WARN,
      message,
      timestamp: new Date(),
      context: { ...this.getCurrentContext(), ...context },
    });
  }

  /**
   *
   * @param message
   * @param error
   * @param context
   */
  error(message: string, error?: Error, context?: LogContext): void {
    this.log({
      level: LogLevel.ERROR,
      message,
      timestamp: new Date(),
      error,
      context: { ...this.getCurrentContext(), ...context },
    });
  }

  /**
   *
   * @param message
   * @param error
   * @param context
   */
  fatal(message: string, error?: Error, context?: LogContext): void {
    this.log({
      level: LogLevel.FATAL,
      message,
      timestamp: new Date(),
      error,
      context: { ...this.getCurrentContext(), ...context },
    });
  }

  /**
   * Creates a performance timer that logs execution duration
   * @param operation
   * @param context
   */
  startTimer(operation: string, context?: LogContext): () => void {
    const startTime = Date.now(),
      timerContext = { ...this.getCurrentContext(), ...context, operation };

    this.debug(`Starting operation: ${operation}`, timerContext);

    return () => {
      const duration = Date.now() - startTime;
      this.info(`Completed operation: ${operation}`, { ...timerContext, duration });
    };
  }

  /**
   * Logs with structured data for better analysis
   * @param level
   * @param message
   * @param data
   * @param context
   */
  structured(
    level: LogLevel,
    message: string,
    data: Record<string, any>,
    context?: LogContext,
  ): void {
    this.log({
      level,
      message: `${message} ${JSON.stringify(data)}`,
      timestamp: new Date(),
      context: { ...this.getCurrentContext(), ...context },
    });
  }
}

// Global logger instance
export const logger = Logger.getInstance();

// Convenience functions for direct use
export const log = {
  debug: (message: string, context?: LogContext) => {
    logger.debug(message, context);
  },
  info: (message: string, context?: LogContext) => {
    logger.info(message, context);
  },
  warn: (message: string, context?: LogContext) => {
    logger.warn(message, context);
  },
  error: (message: string, error?: Error, context?: LogContext) => {
    logger.error(message, error, context);
  },
  fatal: (message: string, error?: Error, context?: LogContext) => {
    logger.fatal(message, error, context);
  },
  timer: (operation: string, context?: LogContext) => logger.startTimer(operation, context),
  structured: (
    level: LogLevel,
    message: string,
    data: Record<string, any>,
    context?: LogContext,
  ) => {
    logger.structured(level, message, data, context);
  },
};
