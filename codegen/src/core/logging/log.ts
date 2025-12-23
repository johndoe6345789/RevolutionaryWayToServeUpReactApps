import type { LogContext } from './log-context';
import type { LogLevel } from './log-level';
import { logger } from './logger-instance';

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
