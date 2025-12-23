/**
 * ESLint rule to detect hardcoded strings that should be moved to JSON
 * Prevents the same mistake we made with git hooks templates
 */

export default {
  rules: {
    'no-hardcoded-strings': {
      meta: {
        type: 'suggestion',
        docs: {
          description: 'Detects hardcoded strings that should be moved to external JSON files',
          category: 'Best Practices',
          recommended: true,
        },
        fixable: null,
        schema: [
          {
            type: 'object',
            properties: {
              maxTemplateLiteralLines: {
                type: 'integer',
                default: 5,
              },
              maxStringPropertiesInObject: {
                type: 'integer',
                default: 3,
              },
              maxStringArrayLength: {
                type: 'integer',
                default: 5,
              },
              ignoreInTests: {
                type: 'boolean',
                default: true,
              },
            },
            additionalProperties: false,
          },
        ],
        messages: {
          templateLiteralTooLarge:
            'Template literal with {{lineCount}} lines should be moved to an external JSON file. Consider creating a template file and loading it at runtime.',
          objectWithManyStrings:
            'Object with {{stringCount}} string properties should be moved to an external JSON file. Configuration objects should be externalized.',
          stringArrayTooLarge:
            'Array with {{length}} strings should be moved to an external JSON file. Consider using a configuration array in JSON.',
          hardcodedConfigDetected:
            'Hardcoded configuration detected. Move this to an external JSON file for better maintainability.',
        },
      },

      create(context) {
        const options = context.options[0] || {},
         maxTemplateLiteralLines = options.maxTemplateLiteralLines || 5,
         maxStringPropertiesInObject = options.maxStringPropertiesInObject || 3,
         maxStringArrayLength = options.maxStringArrayLength || 5,
         ignoreInTests = options.ignoreInTests !== false;

        // Skip test files if configured to do so
        if (
          (ignoreInTests && context.filename.includes('.test.')) ||
          context.filename.includes('.spec.')
        ) {
          return {};
        }

        return {
          TemplateLiteral(node) {
            const lineCount = getLineCount(node);
            if (lineCount > maxTemplateLiteralLines) {
              context.report({
                node,
                messageId: 'templateLiteralTooLarge',
                data: { lineCount },
              });
            }
          },

          ObjectExpression(node) {
            const stringProperties = node.properties.filter(
              (prop) =>
                prop.type === 'Property' &&
                prop.key.type === 'Identifier' &&
                prop.value.type === 'Literal' &&
                typeof prop.value.value === 'string'
            );

            if (stringProperties.length > maxStringPropertiesInObject) {
              // Check if this looks like configuration (has multiple string properties)
              const hasConfigPattern = stringProperties.some((prop) =>
                ['extends', 'plugins', 'rules', 'template', 'description', 'summary'].includes(
                  prop.key.name
                )
              );

              if (hasConfigPattern) {
                context.report({
                  node,
                  messageId: 'objectWithManyStrings',
                  data: { stringCount: stringProperties.length },
                });
              }
            }
          },

          ArrayExpression(node) {
            const stringElements = node.elements.filter(
              (el) => el && el.type === 'Literal' && typeof el.value === 'string'
            );

            if (stringElements.length > maxStringArrayLength) {
              // Check if this looks like configuration (multiple string literals)
              const hasConfigPattern = stringElements.some(
                (el) =>
                  el.value.includes('extends') ||
                  el.value.includes('rules') ||
                  el.value.includes('plugins') ||
                  el.value.includes('template') ||
                  el.value.includes('description')
              );

              if (hasConfigPattern) {
                context.report({
                  node,
                  messageId: 'stringArrayTooLarge',
                  data: { length: stringElements.length },
                });
              }
            }
          },

          VariableDeclarator(node) {
            // Check for large configuration objects assigned to variables
            if (node.init && node.init.type === 'ObjectExpression') {
              const {properties} = node.init,
               stringProperties = properties.filter(
                (prop) =>
                  prop.type === 'Property' &&
                  prop.value.type === 'Literal' &&
                  typeof prop.value.value === 'string'
              );

              if (stringProperties.length > maxStringPropertiesInObject) {
                // Look for configuration-like variable names
                const configLikeNames = [
                  'config',
                  'configs',
                  'template',
                  'templates',
                  'rules',
                  'settings',
                ];
                if (
                  node.id.type === 'Identifier' &&
                  configLikeNames.some((name) => node.id.name.includes(name))
                ) {
                  context.report({
                    node: node.init,
                    messageId: 'hardcodedConfigDetected',
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

/**
 * Count the number of lines in a template literal
 */
function getLineCount(node) {
  if (!node.loc) {return 0;}

  // Count newlines in the template literal
  let lineCount = 1; // Start with 1 for the first line

  for (const quasi of node.quasis) {
    if (quasi.type === 'TemplateElement') {
      const text = quasi.value.raw || quasi.value.cooked,
       newlines = (text.match(/\n/g) || []).length;
      lineCount += newlines;
    }
  }

  return lineCount;
}
