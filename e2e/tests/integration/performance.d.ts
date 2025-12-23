/**
 * Performance - Extends the browser Performance interface for heap tracking in tests.
 */
declare global {
  interface Performance {
    memory?: {
      usedJSHeapSize: number;
    };
  }
}

export {};
