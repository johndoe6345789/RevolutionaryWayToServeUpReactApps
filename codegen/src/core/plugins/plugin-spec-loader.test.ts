/**
 * PluginSpecLoader Test Suite
 * Tests for the PluginSpecLoader class
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PluginSpecLoader } from './plugin-spec-loader';
import * as fs from 'fs';
import type { ISpec } from './interfaces/index';

// Mock fs module
vi.mock('fs');

describe('PluginSpecLoader', () => {
  let loader: PluginSpecLoader;
  let mockBasePath: string;

  beforeEach(() => {
    mockBasePath = '/test/path';
    loader = new PluginSpecLoader(mockBasePath);
  });

  describe('constructor', () => {
    it('should initialize with base path', () => {
      expect(loader).toBeDefined();
    });
  });

  describe('loadSpec', () => {
    it('should load and parse spec file successfully', async () => {
      const mockSpecContent = JSON.stringify({
        uuid: 'test-uuid-123',
        id: 'test-plugin',
        type: 'plugin',
        search: {
          title: 'Test Plugin',
          summary: 'Test plugin',
          keywords: ['test'],
          domain: 'test',
          capabilities: ['testing'],
        },
      });

      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue(mockSpecContent);

      const result = await loader.loadSpec();

      expect(result).toEqual(JSON.parse(mockSpecContent));
      expect(fs.readFileSync).toHaveBeenCalledWith(expect.stringContaining('spec.json'), 'utf8');
    });

    it('should throw error when spec file does not exist', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);

      await expect(loader.loadSpec()).rejects.toThrow('Plugin spec.json not found');
    });

    it('should throw error for invalid JSON', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue('invalid json');

      await expect(loader.loadSpec()).rejects.toThrow();
    });
  });

  describe('validateSpec', () => {
    it('should validate complete spec', () => {
      const validSpec: ISpec = {
        uuid: 'test-uuid-123',
        id: 'test-plugin',
        type: 'plugin',
        search: {
          title: 'Test Plugin',
          summary: 'Test plugin',
          keywords: ['test'],
          domain: 'test',
          capabilities: ['testing'],
        },
      };

      expect(loader.validateSpec(validSpec)).toBe(true);
    });

    it('should reject spec without uuid', () => {
      const invalidSpec = {
        id: 'test-plugin',
        type: 'plugin',
        search: { title: 'Test' },
      };

      expect(loader.validateSpec(invalidSpec as any)).toBe(false);
    });

    it('should reject spec without id', () => {
      const invalidSpec = {
        uuid: 'test-uuid-123',
        type: 'plugin',
        search: { title: 'Test' },
      };

      expect(loader.validateSpec(invalidSpec as any)).toBe(false);
    });

    it('should reject spec without search', () => {
      const invalidSpec = {
        uuid: 'test-uuid-123',
        id: 'test-plugin',
        type: 'plugin',
      };

      expect(loader.validateSpec(invalidSpec as any)).toBe(false);
    });
  });
});
