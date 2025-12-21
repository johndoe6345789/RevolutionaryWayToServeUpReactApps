export = ControllerRegistry;

declare class ControllerRegistry {
  register(name: string, controller: unknown, metadata: Record<string, unknown>, requiredServices: string[]): void;
  getController(name: string): unknown | undefined;
  listControllers(): string[];
  getMetadata(name: string): Record<string, unknown> | undefined;
  isRegistered(name: string): boolean;
}