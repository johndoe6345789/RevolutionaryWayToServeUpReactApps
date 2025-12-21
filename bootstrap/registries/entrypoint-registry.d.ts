export = EntrypointRegistry;

declare class EntrypointRegistry {
  register(name: string, entrypoint: unknown, metadata: Record<string, unknown>, requiredServices: string[]): void;
  getEntrypoint(name: string): unknown | undefined;
  listEntrypoints(): string[];
  getMetadata(name: string): Record<string, unknown> | undefined;
  isRegistered(name: string): boolean;
}