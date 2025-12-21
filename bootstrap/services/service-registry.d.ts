export = ServiceRegistry;

declare class ServiceRegistry {
  register(name: string, service: unknown, metadata: Record<string, unknown>, requiredServices: string[]): void;
  getService(name: string): unknown | undefined;
  listServices(): string[];
  getMetadata(name: string): Record<string, unknown> | undefined;
  isRegistered(name: string): boolean;
}
