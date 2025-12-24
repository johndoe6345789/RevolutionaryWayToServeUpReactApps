/**
 * ESLint rule to enforce single export per file
 * Each file should export exactly 1 class, interface, function, or constant
 */

import fs from 'fs';
import path from 'path';

export default {
  rules: {
    'single-export-per-file': {
      meta: {
        type: 'problem',
        docs: {
          description:
            'Enforces single export per file - each file should export exactly 1 class, interface, function, or constant',
          category: 'Best Practices',
          recommended: true,
        },
        fixable: null,
        schema: [
          {
            type: 'object',
            properties: {
              srcDir: {
                type: 'string',
                default: 'src',
              },
              allowBarrelExports: {
                type: 'boolean',
                default: true,
              },
              excludePatterns: {
                type: 'array',
                items: { type: 'string' },
                default: [
                  'node_modules',
                  '.git',
                  'dist',
                  'build',
                  '__pycache__',
                  '.next',
                  'coverage',
                ],
              },
            },
            additionalProperties: false,
          },
        ],
        messages: {
          multipleExports:
            'File "{{file}}" violates single export rule: {{violations}}. Each file should export exactly 1 class, interface, function, or constant.',
          inlineInterface:
            'File "{{file}}" contains inline interface definitions in constructor parameters. All types must be defined in separate files.',
        },
      },

      create(context) {
        const options = context.options[0] || {},
          srcDir = options.srcDir || 'src',
          allowBarrelExports = options.allowBarrelExports !== false,
          excludePatterns = options.excludePatterns || [
            'node_modules',
            '.git',
            'dist',
            'build',
            '__pycache__',
            '.next',
            'coverage',
          ];

        return {
          Program(node) {
            const filePath = context.filename;
            if (!filePath || filePath === '<input>') {
              return;
            }

            // Get relative path from project root
            const relativePath = path.relative(process.cwd(), filePath);

            // Only check TypeScript files in src directory
            if (
              !relativePath.startsWith(srcDir) ||
              (!relativePath.endsWith('.ts') && !relativePath.endsWith('.tsx'))
            ) {
              return;
            }

            // Check exclude patterns
            if (excludePatterns.some((pattern) => relativePath.includes(pattern))) {
              return;
            }

            try {
              // Read the file content
              const content = fs.readFileSync(filePath, 'utf8'),
                // Count different types of exports
                exportedClasses = (content.match(/export\s+(?:abstract\s+)?class\s+\w+/g) || [])
                  .length,
                exportedInterfaces = (content.match(/export\s+(interface|type)\s+\w+/g) || [])
                  .length,
                exportedFunctions = (content.match(/export\s+(?:async\s+)?function\s+\w+/g) || [])
                  .length,
                exportedConstants = (content.match(/export\s+(?:const|let|var)\s+\w+/g) || [])
                  .length,
                exportedDefaults = (content.match(/export\s+default/g) || []).length,
                // Count total named exports
                totalNamedExports =
                  exportedClasses + exportedInterfaces + exportedFunctions + exportedConstants;

              // Allow files with only default export + optionally one named export (for barrel exports)
              if (exportedDefaults > 0 && totalNamedExports <= (allowBarrelExports ? 1 : 0)) {
                return;
              }

              // Check for violations
              if (totalNamedExports > 1) {
                const violations = [];
                if (exportedClasses > 1) {
                  violations.push(`${exportedClasses} classes`);
                }
                if (exportedInterfaces > 1) {
                  violations.push(`${exportedInterfaces} interfaces/types`);
                }
                if (exportedFunctions > 1) {
                  violations.push(`${exportedFunctions} functions`);
                }
                if (exportedConstants > 1) {
                  violations.push(`${exportedConstants} constants`);
                }

                context.report({
                  node,
                  messageId: 'multipleExports',
                  data: {
                    file: relativePath,
                    violations: violations.join(', '),
                  },
                });
              }

              if (totalNamedExports === 0 && exportedDefaults === 0) {
                // Skip empty files or files with only imports
                return;
              }

              // Check for inline interface definitions in constructor parameters
              const inlineInterfaceMatches =
                content.match(/constructor\s*\([^)]*\w+\s*:\s*{\s*[^}]*}[^)]*\)/g) || [];
              if (inlineInterfaceMatches.length > 0) {
                context.report({
                  node,
                  messageId: 'inlineInterface',
                  data: { file: relativePath },
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
