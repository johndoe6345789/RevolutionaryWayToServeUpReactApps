/**
 * ESLint rule to ensure README.md files exist in directories
 * Promotes good documentation practices and project organization
 */

import fs from 'fs';
import path from 'path';

export default {
  rules: {
    'require-readme': {
      meta: {
        type: 'suggestion',
        docs: {
          description: 'Ensures README.md files exist in directories to promote documentation',
          category: 'Best Practices',
          recommended: true,
        },
        fixable: null,
        schema: [
          {
            type: 'object',
            properties: {
              requireInRoot: {
                type: 'boolean',
                default: true,
              },
              requireInSubdirs: {
                type: 'boolean',
                default: false,
              },
              readmeNames: {
                type: 'array',
                items: { type: 'string' },
                default: ['README.md', 'readme.md', 'Readme.md'],
              },
              excludePatterns: {
                type: 'array',
                items: { type: 'string' },
                default: ['node_modules', '.git', 'dist', 'build', '__pycache__', '.next', 'coverage', '.vscode', '.github'],
              },
              minContentLength: {
                type: 'integer',
                default: 50,
              },
              checkContent: {
                type: 'boolean',
                default: true,
              },
            },
            additionalProperties: false,
          },
        ],
        messages: {
          missingReadme: 'Directory "{{directory}}" is missing a README file. Please add {{readmeNames}} to document this directory.',
          emptyReadme: 'README file "{{readmePath}}" appears to be empty or too short ({{length}} characters). Please add meaningful documentation.',
          readmeTooShort: 'README file "{{readmePath}}" is too short ({{length}} characters, minimum {{minLength}}). Please add more comprehensive documentation.',
        },
      },

      create(context) {
        const options = context.options[0] || {};
        const requireInRoot = options.requireInRoot !== false;
        const requireInSubdirs = options.requireInSubdirs || false;
        const readmeNames = options.readmeNames || ['README.md', 'readme.md', 'Readme.md'];
        const excludePatterns = options.excludePatterns || ['node_modules', '.git', 'dist', 'build', '__pycache__', '.next', 'coverage', '.vscode', '.github'];
        const minContentLength = options.minContentLength || 50;
        const checkContent = options.checkContent !== false;

        // Track directories we've already checked
        const checkedDirectories = new Set();

        return {
          Program(node) {
            const filePath = context.filename;
            if (!filePath || filePath === '<input>') return;

            // Get the directory of the current file
            const directory = path.dirname(filePath);
            const relativeDir = path.relative(process.cwd(), directory);

            // Skip if we've already checked this directory
            if (checkedDirectories.has(directory)) return;
            checkedDirectories.add(directory);

            // Check if we should skip this directory based on patterns
            const dirName = path.basename(directory);
            if (excludePatterns.some(pattern => dirName.includes(pattern) || directory.includes(pattern))) {
              return;
            }

            // Determine if we should check this directory
            const isRootDir = relativeDir === '' || relativeDir === '.';
            if (isRootDir && !requireInRoot) return;
            if (!isRootDir && !requireInSubdirs) return;

            // Check for README files
            let readmeFound = null;
            for (const readmeName of readmeNames) {
              const readmePath = path.join(directory, readmeName);
              try {
                if (fs.existsSync(readmePath)) {
                  readmeFound = { name: readmeName, path: readmePath };
                  break;
                }
              } catch (error) {
                // Ignore filesystem errors
              }
            }

            if (!readmeFound) {
              // No README found
              context.report({
                node,
                messageId: 'missingReadme',
                data: {
                  directory: relativeDir || '.',
                  readmeNames: readmeNames.join(' or '),
                },
              });
              return;
            }

            // README exists, check content if required
            if (checkContent) {
              try {
                const content = fs.readFileSync(readmeFound.path, 'utf8');
                const contentLength = content.trim().length;

                if (contentLength === 0) {
                  context.report({
                    node,
                    messageId: 'emptyReadme',
                    data: {
                      readmePath: path.relative(process.cwd(), readmeFound.path),
                      length: contentLength,
                    },
                  });
                } else if (contentLength < minContentLength) {
                  context.report({
                    node,
                    messageId: 'readmeTooShort',
                    data: {
                      readmePath: path.relative(process.cwd(), readmeFound.path),
                      length: contentLength,
                      minLength: minContentLength,
                    },
                  });
                }
              } catch (error) {
                // Ignore read errors
              }
            }
          },
        };
      },
    },
  },
};
