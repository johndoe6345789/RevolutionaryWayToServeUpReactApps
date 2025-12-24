import type { LogContext } from './log-context';
import type { LogLevel } from './log-level';

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
