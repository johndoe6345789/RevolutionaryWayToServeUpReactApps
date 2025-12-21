import { createRequire, makeNamespace } from "../../../bootstrap";

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

  it("keeps extra namespace properties when wrapping globals", () => {
    const fakeComponent = () => null;
    (fakeComponent as any).metadata = "render-target";

    const registry: Record<string, unknown> = {
      "@mui/material/Stack": makeNamespace(fakeComponent)
    };
    const requireFn = createRequire(registry, {});
    const namespace = requireFn("@mui/material/Stack") as typeof fakeComponent & {
      metadata: string;
    };

    expect(namespace.default).toBe(fakeComponent);
    expect(namespace.metadata).toBe("render-target");
  });

  it("caches modules loaded through the async loader", async () => {
    const registry: Record<string, unknown> = {};
    const dynamicModule = { name: "icons/test" };
    const dynamicLoader = jest.fn(async (name: string, _config, reg: Record<string, unknown>) => {
      reg[name] = dynamicModule;
      return dynamicModule;
    });
    const requireFn = createRequire(
      registry,
      { dynamicModules: [{ prefix: "icons/" }] },
      "",
      undefined,
      dynamicLoader
    );

    await expect(requireFn._async!("icons/test")).resolves.toBe(dynamicModule);
    await expect(requireFn._async!("icons/test")).resolves.toBe(dynamicModule);
    expect(dynamicLoader).toHaveBeenCalledTimes(1);
    expect(requireFn("icons/test")).toBe(dynamicModule);
  });
});
