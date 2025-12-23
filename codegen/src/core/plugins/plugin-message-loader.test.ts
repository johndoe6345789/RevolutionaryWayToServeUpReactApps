/**
 * PluginMessageLoader Test Suite
 * Tests for the PluginMessageLoader class
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PluginMessageLoader } from './plugin-message-loader';
import * as fs from 'fs';

// Mock fs module
vi.mock('fs');

describe('PluginMessageLoader', () => {
  let loader: PluginMessageLoader, mockBasePath: string;

  beforeEach(() => {
    mockBasePath = '/test/path';
    loader = new PluginMessageLoader(mockBasePath);
  });

  describe('constructor', () => {
    it('should initialize with base path', () => {
      expect(loader).toBeDefined();
    });
  });

  describe('loadMessages', () => {
    it('should load and parse messages file successfully', async () => {
      const mockMessages = {
        en: { hello: 'Hello', goodbye: 'Goodbye' },
        es: { hello: 'Hola', goodbye: 'Adiós' },
      };

      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(mockMessages));

      const result = await loader.loadMessages();

      expect(result).toEqual(mockMessages);
      expect(fs.readFileSync).toHaveBeenCalledWith(
        expect.stringContaining('messages.json'),
        'utf8',
      );
    });

    it('should return empty object when messages file does not exist', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);

      const result = await loader.loadMessages();
      expect(result).toEqual({});
    });

    it('should throw error for invalid JSON', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue('invalid json');

      await expect(loader.loadMessages()).rejects.toThrow();
    });
  });

  describe('validateMessages', () => {
    it('should validate valid message structure', () => {
      const validMessages = {
        en: { hello: 'Hello', goodbye: 'Goodbye' },
        es: { hello: 'Hola', goodbye: 'Adiós' },
      };

      expect(loader.validateMessages(validMessages)).toBe(true);
    });

    it('should reject null messages', () => {
      expect(
        loader.validateMessages(null as unknown as Record<string, Record<string, string>>),
      ).toBe(false);
    });

    it('should reject non-object messages', () => {
      expect(
        loader.validateMessages('string' as unknown as Record<string, Record<string, string>>),
      ).toBe(false);
    });

    it('should reject invalid locale structure', () => {
      const invalidMessages = {
        en: { hello: 'Hello', goodbye: 123 }, // Number instead of string
      };

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      expect(loader.validateMessages(invalidMessages as any)).toBe(false);
    });

    it('should reject non-object locale values', () => {
      const invalidMessages = {
        en: 'not an object',
      };

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      expect(loader.validateMessages(invalidMessages as any)).toBe(false);
    });
  });
});
