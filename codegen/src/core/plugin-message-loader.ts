/**
 * PluginMessageLoader - Loads and validates plugin message catalogs
 * AGENTS.md compliant: ≤3 public methods, ≤10 lines per function
 * Single responsibility: message loading and validation
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

/**
 *
 */
export class PluginMessageLoader {
  private readonly basePath: string;

  /**
   * Constructor with base path (single param)
   * @param basePath - Base directory for plugin files
   */
  constructor(basePath: string) {
    this.basePath = basePath;
  }

  /**
   * Load messages from messages.json (≤10 lines)
   * @returns Promise<Record<string, Record<string, string>>> Loaded messages
   */
  public async loadMessages(): Promise<Record<string, Record<string, string>>> {
    const messagesPath = join(this.basePath, 'messages.json');
    if (!existsSync(messagesPath)) {
      return {}; // Return empty messages if file doesn't exist
    }
    const content = readFileSync(messagesPath, 'utf8');
    return JSON.parse(content) as Record<string, Record<string, string>>;
  }

  /**
   * Validate loaded messages (≤10 lines)
   * @param messages - Messages to validate
   * @returns True if valid
   */
  public validateMessages(messages: Record<string, Record<string, string>>): boolean {
    if (typeof messages !== 'object' || messages === null) {
      return false;
    }
    // Check that all values are objects with string values
    return Object.values(messages).every(
      (localeMessages) =>
        typeof localeMessages === 'object' &&
        localeMessages !== null &&
        Object.values(localeMessages).every((msg) => typeof msg === 'string')
    );
  }
}
