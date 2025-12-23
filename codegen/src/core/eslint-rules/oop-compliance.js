/**
 * ESLint rule to enforce OOP compliance for AGENTS.md architecture
 * Ensures proper class definitions, inheritance, and method limits
 */

import fs from 'fs';
import path from 'path';

export default {
  rules: {
    'oop-compliance': {
      meta: {
        type: 'problem',
        docs: {
          description:
            'Enforces OOP compliance for AGENTS.md architecture - proper class definitions, inheritance, and method limits',
          category: 'Best Practices',
          recommended: true,
        },
        fixable: null,
        schema: [
          {
            type: 'object',
            properties: {
              coreFiles: {
                type: 'array',
                items: { type: 'string' },
                default: [
                  'codegen/core/base-component.js',
                  'codegen/core/registry.js',
                  'codegen/core/aggregate.js',
                  'codegen/core/plugin.js',
                ],
              },
              baseComponentFile: {
                type: 'string',
                default: 'codegen/core/base-component.js',
              },
              maxMethods: {
                type: 'integer',
                default: 7,
              },
            },
            additionalProperties: false,
          },
        ],
        messages: {
          missingClass:
            'File "{{file}}" does not contain a class definition. All core files must define exactly one class.',
          missingInheritance:
            'File "{{file}}" does not extend BaseComponent. All core files except base-component.js must extend BaseComponent.',
          tooManyMethods:
            'File "{{file}}" has too many methods ({{count}} methods, maximum {{max}}). Consider breaking down the class into smaller, focused components.',
        },
      },

      create(context) {
        const options = context.options[0] || {},
         coreFiles = options.coreFiles || [
          'codegen/core/base-component.js',
          'codegen/core/registry.js',
          'codegen/core/aggregate.js',
          'codegen/core/plugin.js',
        ],
         baseComponentFile = options.baseComponentFile || 'codegen/core/base-component.js',
         maxMethods = options.maxMethods || 7;

        return {
          Program(node) {
            const filePath = context.filename;
            if (!filePath || filePath === '<input>') {return;}

            // Get relative path from project root
            const relativePath = path.relative(process.cwd(), filePath),

            // Check if this file is one of the core files we need to validate
             isCoreFile = coreFiles.some((coreFile) => relativePath.endsWith(coreFile));
            if (!isCoreFile) {return;}

            try {
              // Read the file content
              const content = fs.readFileSync(filePath, 'utf8'),

              // Check for class definition
               classMatches = content.match(/class\s+\w+/g) || [];
              if (classMatches.length === 0) {
                context.report({
                  node,
                  messageId: 'missingClass',
                  data: { file: relativePath },
                });
                return;
              }

              if (classMatches.length > 1) {
                context.report({
                  node,
                  messageId: 'missingClass',
                  data: { file: relativePath },
                });
                return;
              }

              // Check inheritance (except for base-component.js)
              if (!relativePath.endsWith(baseComponentFile)) {
                if (!content.includes('extends BaseComponent')) {
                  context.report({
                    node,
                    messageId: 'missingInheritance',
                    data: { file: relativePath },
                  });
                }
              }

              // Check method count
              const methodMatches =
                content.match(/async\s+\w+\s*\(|^\s*\w+\s*\(\s*[^)]*\)\s*{/gm) || [];
              if (methodMatches.length > maxMethods) {
                context.report({
                  node,
                  messageId: 'tooManyMethods',
                  data: {
                    file: relativePath,
                    count: methodMatches.length,
                    max: maxMethods,
                  },
                });
              }
            } catch {
              // Ignore filesystem errors
            }
          },
        };
      },
    },
  },
};
