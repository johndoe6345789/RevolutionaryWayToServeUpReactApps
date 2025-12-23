export interface LogContext {
  component?: string;
  operation?: string;
  userId?: string;
  requestId?: string;
  correlationId?: string;
  [key: string]: any;
}
