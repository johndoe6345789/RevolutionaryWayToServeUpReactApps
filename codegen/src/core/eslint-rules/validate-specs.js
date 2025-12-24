/**
 * ESLint rule to validate specification JSON files
 * Ensures spec files contain valid JSON
 */

import fs from 'fs';
import path from 'path';

export default {
  rules: {
    'validate-specs': {
      meta: {
        type: 'problem',
        docs: {
          description: 'Validates specification JSON files to ensure they contain valid JSON',
          category: 'Best Practices',
          recommended: true,
        },
        fixable: null,
        schema: [
          {
            type: 'object',
            properties: {
              specFiles: {
                type: 'array',
                items: { type: 'string' },
                default: [
                  'codegen/src/plugins/tools/oop-principles/spec.json',
                  'codegen/src/plugins/tools/test-runner/spec.json',
                  'codegen/src/specs/bootstrap-system/spec.json',
                ],
              },
            },
            additionalProperties: false,
          },
        ],
        messages: {
          invalidJson: 'Invalid JSON in specification file "{{file}}": {{error}}',
          missingSpecFile: 'Specification file "{{file}}" does not exist',
        },
      },

      create(context) {
        const options = context.options[0] || {},
          specFiles = options.specFiles || [
            'codegen/src/plugins/tools/oop-principles/spec.json',
            'codegen/src/plugins/tools/test-runner/spec.json',
            'codegen/src/specs/bootstrap-system/spec.json',
          ],
          // Track processed files to avoid duplicate checks
          processedFiles = new Set();

        return {
          Program(node) {
            const filePath = context.filename;
            if (!filePath || filePath === '<input>') {
              return;
            }

            // Only run once per lint session
            if (processedFiles.has('specs-validated')) {
              return;
            }
            processedFiles.add('specs-validated');

            // Validate all spec files
            for (const specFile of specFiles) {
              try {
                // Resolve path relative to project root
                const resolvedPath = path.resolve(process.cwd(), specFile);
                if (!fs.existsSync(resolvedPath)) {
                  context.report({
                    node,
                    messageId: 'missingSpecFile',
                    data: { file: specFile },
                  });
                  continue;
                }

                const content = fs.readFileSync(resolvedPath, 'utf8');
                JSON.parse(content);
              } catch (error) {
                if (error instanceof SyntaxError) {
                  context.report({
                    node,
                    messageId: 'invalidJson',
                    data: {
                      file: specFile,
                      error: error.message,
                    },
                  });
                } else {
                  // File system error
                  context.report({
                    node,
                    messageId: 'missingSpecFile',
                    data: { file: specFile },
                  });
                }
              }
            }
          },
        };
      },
    },
  },
};
