/**
 * PluginSpecLoader - Loads and validates plugin specifications
 * AGENTS.md compliant: ≤3 public methods, ≤10 lines per function
 * Single responsibility: spec loading and validation
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import type { ISpec } from './interfaces/index';

/**
 *
 */
export class PluginSpecLoader {
  private readonly basePath: string;

  /**
   * Constructor with base path (single param)
   * @param basePath - Base directory for plugin files
   */
  constructor(basePath: string) {
    this.basePath = basePath;
  }

  /**
   * Load spec from spec.json (≤10 lines)
   * @returns Promise<ISpec> Loaded specification
   */
  public async loadSpec(): Promise<ISpec> {
    const specPath = join(this.basePath, 'spec.json');
    if (!existsSync(specPath)) {
      throw new Error('Plugin spec.json not found');
    }
    const content = readFileSync(specPath, 'utf8');
    return JSON.parse(content) as ISpec;
  }

  /**
   * Validate loaded spec (≤10 lines)
   * @param spec - Specification to validate
   * @returns True if valid
   */
  public validateSpec(spec: ISpec): boolean {
    return !!(spec.uuid && spec.id && spec.search && spec.type);
  }
}
