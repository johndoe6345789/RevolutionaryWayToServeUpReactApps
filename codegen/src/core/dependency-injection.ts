/**
 * DependencyInjection - AGENTS.md compliant DI container
 * Strict OO constraints: ≤3 public methods, ≤10 lines per function
 * Constructor injection with no global state
 */

import type { IDependencyInjectionContainer } from './interfaces/index';

/**
 *
 */
export class DependencyInjectionContainer implements IDependencyInjectionContainer {
  private readonly registry = new Map<string | symbol, new (...args: never[]) => unknown>();

  /**
   * Register implementation for token (≤10 lines)
   * @param token - Registration token
   * @param implementation - Constructor function
   */
  public register<T>(token: string | symbol, implementation: new (...args: never[]) => T): void {
    this.registry.set(token, implementation as new (...args: never[]) => unknown);
  }

  /**
   * Resolve implementation for token (≤10 lines)
   * @param token - Resolution token
   * @returns Resolved instance
   */
  public resolve<T>(token: string | symbol): T {
    const Implementation = this.registry.get(token);
    if (!Implementation) {
      throw new Error(`No registration found for token: ${String(token)}`);
    }
    return new Implementation() as T;
  }

  /**
   * Check if token is registered (≤10 lines)
   * @param token - Token to check
   * @returns True if registered
   */
  public has(token: string | symbol): boolean {
    return this.registry.has(token);
  }
}
