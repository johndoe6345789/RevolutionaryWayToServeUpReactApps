import { IRegistry } from "../interfaces/IRegistry";

export = ServiceRegistry;

declare class ServiceRegistry implements IRegistry {
  register(name: string, service: unknown, metadata: Record<string, unknown>, requiredServices: string[]): void;
  get(name: string): unknown;
  getService(name: string): unknown | undefined;
  has(name: string): boolean;
  unregister(name: string): boolean;
  getAllNames(): string[];
  clear(): void;
  getMetadata(name: string): Record<string, unknown> | undefined;
  getRequiredDependencies(name: string): string[] | undefined;
  listServices(): string[];
  isRegistered(name: string): boolean;
  reset(): void;
}
