import "@testing-library/jest-dom";

// Prevent the bootstrap script from executing when imported inside jsdom.
(globalThis as { __RWTRA_BOOTSTRAP_TEST_MODE__?: boolean }).__RWTRA_BOOTSTRAP_TEST_MODE__ = true;
if (typeof window !== "undefined") {
  (window as typeof window & { __RWTRA_BOOTSTRAP_TEST_MODE__?: boolean }).__RWTRA_BOOTSTRAP_TEST_MODE__ = true;
}
