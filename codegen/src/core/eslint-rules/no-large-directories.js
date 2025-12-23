/**
 * ESLint rule to detect directories with too many files
 * Enforces good code organization and Single Responsibility Principle
 */

import fs from 'fs';
import path from 'path';

export default {
  rules: {
    'no-large-directories': {
      meta: {
        type: 'suggestion',
        docs: {
          description: 'Detects directories with too many files, suggesting better organization',
          category: 'Best Practices',
          recommended: true,
        },
        fixable: null,
        schema: [
          {
            type: 'object',
            properties: {
              maxFiles: {
                type: 'integer',
                default: 10,
              },
              excludePatterns: {
                type: 'array',
                items: { type: 'string' },
                default: ['node_modules', '.git', 'dist', 'build', '__pycache__', '.next', 'coverage'],
              },
              excludeExtensions: {
                type: 'array',
                items: { type: 'string' },
                default: ['.log', '.lock', '.map', '.min.js', '.min.css'],
              },
              includeExtensions: {
                type: 'array',
                items: { type: 'string' },
                default: ['.ts', '.tsx', '.js', '.jsx', '.json', '.md'],
              },
            },
            additionalProperties: false,
          },
        ],
        messages: {
          tooManyFiles: 'Directory "{{directory}}" contains {{fileCount}} files, exceeding the maximum of {{maxFiles}}. Consider splitting into smaller, more focused directories.',
          directoryTooLarge: 'Large directory detected: {{directory}} ({{fileCount}} files). This may indicate a violation of the Single Responsibility Principle.',
        },
      },

      create(context) {
        const options = context.options[0] || {};
        const maxFiles = options.maxFiles || 10;
        const excludePatterns = options.excludePatterns || ['node_modules', '.git', 'dist', 'build', '__pycache__', '.next', 'coverage'];
        const excludeExtensions = options.excludeExtensions || ['.log', '.lock', '.map', '.min.js', '.min.css'];
        const includeExtensions = options.includeExtensions || ['.ts', '.tsx', '.js', '.jsx', '.json', '.md'];

        // Track directories we've already checked
        const checkedDirectories = new Set();

        return {
          Program(node) {
            const filePath = context.filename;
            if (!filePath || filePath === '<input>') return;

            // Get the directory of the current file
            const directory = path.dirname(filePath);

            // Skip if we've already checked this directory
            if (checkedDirectories.has(directory)) return;
            checkedDirectories.add(directory);

            // Skip excluded directories
            const dirName = path.basename(directory);
            if (excludePatterns.some(pattern => dirName.includes(pattern) || directory.includes(pattern))) {
              return;
            }

            try {
              // Count files in the directory
              const files = fs.readdirSync(directory);
              const relevantFiles = files.filter(file => {
                const ext = path.extname(file);

                // Exclude files with excluded extensions
                if (excludeExtensions.some(exclExt => file.endsWith(exclExt))) {
                  return false;
                }

                // Include files with included extensions or no extension (directories)
                return includeExtensions.some(inclExt => file.endsWith(inclExt)) || !ext;
              });

              if (relevantFiles.length > maxFiles) {
                context.report({
                  node,
                  messageId: 'tooManyFiles',
                  data: {
                    directory: path.relative(process.cwd(), directory),
                    fileCount: relevantFiles.length,
                    maxFiles,
                  },
                });
              }

              // Additional warning for very large directories
              if (relevantFiles.length > maxFiles * 2) {
                context.report({
                  node,
                  messageId: 'directoryTooLarge',
                  data: {
                    directory: path.relative(process.cwd(), directory),
                    fileCount: relevantFiles.length,
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
