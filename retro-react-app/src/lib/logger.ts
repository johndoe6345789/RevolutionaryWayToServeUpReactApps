/* eslint-disable no-console */

export function logLifecycleError(message: string, error?: unknown): void {
  if (error instanceof Error) {
    console.error(`[Lifecycle] ${message}:`, error.message, error.stack);
    return;
  }

  console.error(`[Lifecycle] ${message}:`, error);
}
