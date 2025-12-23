import { beforeEach, describe, expect, it } from 'vitest';
import { GitPlugin } from './git-plugin';

describe('GitPlugin', () => {
  let plugin: GitPlugin;

  beforeEach(() => {
    plugin = new GitPlugin({
      name: 'git-plugin',
      description: 'Git version control plugin',
      version: '1.0.0',
      author: 'Test Author',
      category: 'tools',
      capabilities: ['git', 'version-control'],
    });
  });

  it('should initialize', () => {
    expect(plugin).toBeDefined();
  });
});
