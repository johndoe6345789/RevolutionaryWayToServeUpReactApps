import { createRequire, makeNamespace } from "../../bootstrap";

// Reproduces the runtime failure where React gets an object instead of a component
// when using default imports against the loader's registry entries.
describe("bootstrap createRequire default interop", () => {
  it("returns the component itself when consumed via __importDefault semantics", () => {
    const fakeComponent = () => null;
    const registry: Record<string, unknown> = {
      "@mui/material/Stack": makeNamespace(fakeComponent)
    };
    const requireFn = createRequire(registry, {});

    // Matches the helper TypeScript emits for default imports
    const __importDefault = (mod: any) =>
      mod && mod.__esModule ? mod : { default: mod };

    const imported = __importDefault(requireFn("@mui/material/Stack")).default;

    expect(imported).toBe(fakeComponent);
  });
});
