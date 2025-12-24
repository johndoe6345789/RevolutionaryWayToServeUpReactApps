/**
 * ESLint rule to check plugin dependencies for circular imports
 * Uses PluginDependencyLinter to analyze plugin system dependencies
 */

import path from 'path';
import { PluginDependencyLinter } from '../plugins/plugin-dependency-linter.js';

export default {
  rules: {
    'plugin-dependencies': {
      meta: {
        type: 'problem',
        docs: {
          description:
            'Checks plugin dependencies for circular imports using PluginDependencyLinter',
          category: 'Best Practices',
          recommended: true,
        },
        fixable: null,
        schema: [
          {
            type: 'object',
            properties: {
              pluginsDir: {
                type: 'string',
                default: 'codegen/src/plugins',
              },
            },
            additionalProperties: false,
          },
        ],
        messages: {
          circularDependency: 'Circular dependency detected in plugin system: {{cycle}}',
          dependencyWarning: 'Plugin dependency warning: {{warning}}',
        },
      },

      create(context) {
        const options = context.options[0] || {},
         pluginsDir = options.pluginsDir || 'codegen/src/plugins',

        // Track processed files to avoid duplicate checks
         processedFiles = new Set();

        return {
          Program(node) {
            const filePath = context.filename;
            if (!filePath || filePath === '<input>') {return;}

            // Only run once per lint session
            if (processedFiles.has('plugin-deps-checked')) {return;}
            processedFiles.add('plugin-deps-checked');

            try {
              // Resolve plugins directory path
              const resolvedPluginsDir = path.resolve(process.cwd(), pluginsDir),
               linter = new PluginDependencyLinter(resolvedPluginsDir);

              // Analyze dependencies asynchronously
              linter
                .analyze()
                .then((result) => {
                  // Report circular dependencies
                  if (!result.success) {
                    result.circularDeps.forEach((cycle) => {
                      context.report({
                        node,
                        messageId: 'circularDependency',
                        data: { cycle: cycle.join(' → ') },
                      });
                    });
                  }

                  // Report warnings
                  result.warnings.forEach((warning) => {
                    context.report({
                      node,
                      messageId: 'dependencyWarning',
                      data: { warning },
                    });
                  });
                })
                .catch((error) => {
                  // Ignore analysis errors in ESLint context
                  console.warn('Plugin dependency analysis failed:', error.message);
                });
            } catch {
              // Ignore initialization errors
            }
          },
        };
      },
    },
  },
};
