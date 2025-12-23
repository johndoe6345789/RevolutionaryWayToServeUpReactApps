import type { LogContext } from './log-context';
import type { LogEntry } from './log-entry';
import { LogLevel } from './log-level';

/**
 * Centralized logging system with configurable levels and structured output
 * Supports different log levels, context tracking, and performance monitoring
 */
export class Logger {
  private static instance: Logger;
  private currentLevel: LogLevel = LogLevel.INFO;
  private readonly contextStack: LogContext[] = [];

  private constructor() {}

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  setLevel(level: LogLevel): void {
    this.currentLevel = level;
  }

  pushContext(context: LogContext): void {
    this.contextStack.push(context);
  }

  popContext(): void {
    this.contextStack.pop();
  }

  private getCurrentContext(): LogContext | undefined {
    return this.contextStack.length > 0 ? Object.assign({}, ...this.contextStack) : undefined;
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.currentLevel;
  }

  private formatMessage(entry: LogEntry): string {
    const levelStr = LogLevel[entry.level],
      timestamp = entry.timestamp.toISOString(),
      contextStr = entry.context ? ` ${JSON.stringify(entry.context)}` : '',
      durationStr = entry.duration ? ` (${entry.duration}ms)` : '',
      errorStr = entry.error ? ` Error: ${entry.error.message}` : '';

    return `[${timestamp}] ${levelStr}: ${entry.message}${contextStr}${durationStr}${errorStr}`;
  }

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

  debug(message: string, context?: LogContext): void {
    this.log({
      level: LogLevel.DEBUG,
      message,
      timestamp: new Date(),
      context: { ...this.getCurrentContext(), ...context },
    });
  }

  info(message: string, context?: LogContext): void {
    this.log({
      level: LogLevel.INFO,
      message,
      timestamp: new Date(),
      context: { ...this.getCurrentContext(), ...context },
    });
  }

  warn(message: string, context?: LogContext): void {
    this.log({
      level: LogLevel.WARN,
      message,
      timestamp: new Date(),
      context: { ...this.getCurrentContext(), ...context },
    });
  }

  error(message: string, error?: Error, context?: LogContext): void {
    this.log({
      level: LogLevel.ERROR,
      message,
      timestamp: new Date(),
      error,
      context: { ...this.getCurrentContext(), ...context },
    });
  }

  fatal(message: string, error?: Error, context?: LogContext): void {
    this.log({
      level: LogLevel.FATAL,
      message,
      timestamp: new Date(),
      error,
      context: { ...this.getCurrentContext(), ...context },
    });
  }

  startTimer(operation: string, context?: LogContext): () => void {
    const startTime = Date.now(),
      timerContext = { ...this.getCurrentContext(), ...context, operation };

    this.debug(`Starting operation: ${operation}`, timerContext);

    return () => {
      const duration = Date.now() - startTime;
      this.info(`Completed operation: ${operation}`, { ...timerContext, duration });
    };
  }

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
