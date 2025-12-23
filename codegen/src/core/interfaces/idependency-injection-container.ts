/**
 * Dependency injection container interface
 * AGENTS.md compliant: constructor injection with token-based resolution
 */
export interface IDependencyInjectionContainer {
  register<T>(token: string | symbol, implementation: new (...args: never[]) => T): void;
  resolve<T>(token: string | symbol): T;
  has(token: string | symbol): boolean;
}
