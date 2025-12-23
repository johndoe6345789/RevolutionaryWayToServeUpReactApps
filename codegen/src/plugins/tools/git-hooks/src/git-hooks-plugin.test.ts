/**
 * Git Hooks Plugin Tests - AGENTS.md compliant test implementation
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { GitHooksPlugin } from './git-hooks-plugin';
import { IPluginConfig } from '../../../../core/interfaces/index';

describe('GitHooksPlugin', () => {
  let plugin: GitHooksPlugin;

  beforeEach(() => {
    plugin = new GitHooksPlugin({
      name: 'git-hooks-plugin',
      description: 'Git hooks management plugin',
      version: '1.0.0',
      author: 'Test Author',
      category: 'tools',
      capabilities: ['git-hooks', 'automation'],
    } as IPluginConfig);
  });

  describe('constructor', () => {
    it('should create plugin instance with config', () => {
      expect(plugin).toBeDefined();
      expect(plugin).toBeInstanceOf(GitHooksPlugin);
    });
  });

  describe('execute', () => {
    it('should default to list operation', async () => {
      const result = await plugin.execute({});
      expect(result).toHaveProperty('operation', 'list');
      expect(result).toHaveProperty('installed');
      expect(result).toHaveProperty('available');
      expect(result).toHaveProperty('templates');
    });

    it('should handle setup operation', async () => {
      const result = await plugin.execute({ operation: 'setup' });
      expect(result).toHaveProperty('operation', 'setup');
      expect(result).toHaveProperty('hooks');
      expect(result).toHaveProperty('total');
      expect(result).toHaveProperty('successful');
      expect(result).toHaveProperty('failed');
    });

    it('should handle verify operation', async () => {
      const result = await plugin.execute({ operation: 'verify' });
      expect(result).toHaveProperty('operation', 'verify');
      expect(result).toHaveProperty('hooks');
      expect(result).toHaveProperty('total');
      expect(result).toHaveProperty('verified');
      expect(result).toHaveProperty('issues');
      expect(result).toHaveProperty('status');
    });

    it('should throw error for unknown operation', async () => {
      await expect(plugin.execute({ operation: 'unknown' })).rejects.toThrow(
        'Unknown Git hooks operation: unknown'
      );
    });
  });

  describe('hook management', () => {
    it('should handle create operation', async () => {
      await expect(plugin.execute({
        operation: 'create',
        hook: 'test-hook'
      })).rejects.toThrow('Template not found: test-hook');
    });

    it('should handle remove operation', async () => {
      const result = await plugin.execute({
        operation: 'remove',
        hooks: ['nonexistent-hook']
      });
      expect(result).toHaveProperty('operation', 'remove');
      expect(result).toHaveProperty('hooks');
      expect(result).toHaveProperty('total', 1);
      expect(result).toHaveProperty('removed', 0);
      expect(result).toHaveProperty('failed', 0);
    });
  });

  describe('template content', () => {
    it('should return pre-commit template', () => {
      const content = (plugin as any).getTemplateContent('templates/pre-commit.sh', {});
      expect(content).toContain('#!/bin/sh');
      expect(content).toContain('Pre-commit hook template');
      expect(content).toContain('bun run lint.ts');
    });

    it('should return commit-msg template', () => {
      const content = (plugin as any).getTemplateContent('templates/commit-msg.sh', {});
      expect(content).toContain('#!/bin/sh');
      expect(content).toContain('Commit message validation hook template');
      expect(content).toContain('conventional commit format');
    });

    it('should return pre-push template', () => {
      const content = (plugin as any).getTemplateContent('templates/pre-push.sh', {});
      expect(content).toContain('#!/bin/sh');
      expect(content).toContain('Pre-push hook template');
      expect(content).toContain('bun test');
    });

    it('should return generic template for unknown path', () => {
      const content = (plugin as any).getTemplateContent('unknown-template.sh', {});
      expect(content).toContain('#!/bin/sh');
      expect(content).toContain('Generic hook template');
    });
  });

  describe('utility methods', () => {
    it('should detect package manager for linux', () => {
      const pm = (plugin as any).detectPackageManager('linux');
      expect(pm).toBe('apt');
    });

    it('should detect package manager for darwin', () => {
      const pm = (plugin as any).detectPackageManager('darwin');
      expect(pm).toBe('brew');
    });

    it('should detect package manager for win32', () => {
      const pm = (plugin as any).detectPackageManager('win32');
      expect(pm).toBe('choco');
    });

    it('should default to apt for unknown platform', () => {
      const pm = (plugin as any).detectPackageManager('unknown');
      expect(pm).toBe('apt');
    });
  });
});
