export = HelperRegistry;

declare class HelperRegistry {
  register(name: string, helper: unknown, metadata: Record<string, unknown>, requiredServices: string[]): void;
  getHelper(name: string): unknown | undefined;
  listHelpers(): string[];
  getMetadata(name: string): Record<string, unknown> | undefined;
  isRegistered(name: string): boolean;
}
