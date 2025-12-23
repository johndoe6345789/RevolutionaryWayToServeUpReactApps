/**
 * ESLint rule to require JSDoc documentation on classes, interfaces, and methods
 * Enforces comprehensive API documentation standards
 */

export default {
  rules: {
    'require-docstrings': {
      meta: {
        type: 'suggestion',
        docs: {
          description: 'Requires JSDoc documentation on classes, interfaces, and methods',
          category: 'Best Practices',
          recommended: true,
        },
        fixable: null,
        schema: [
          {
            type: 'object',
            properties: {
              requireClassDocs: {
                type: 'boolean',
                default: true,
              },
              requireInterfaceDocs: {
                type: 'boolean',
                default: true,
              },
              requireMethodDocs: {
                type: 'boolean',
                default: true,
              },
              requirePropertyDocs: {
                type: 'boolean',
                default: false,
              },
              excludePrivate: {
                type: 'boolean',
                default: true,
              },
              excludeConstructors: {
                type: 'boolean',
                default: true,
              },
              excludeGettersSetters: {
                type: 'boolean',
                default: true,
              },
              minDescriptionLength: {
                type: 'integer',
                default: 10,
              },
              requireParams: {
                type: 'boolean',
                default: true,
              },
              requireReturns: {
                type: 'boolean',
                default: true,
              },
              requireThrows: {
                type: 'boolean',
                default: false,
              },
            },
            additionalProperties: false,
          },
        ],
        messages: {
          missingClassDocs: 'Class "{{className}}" requires JSDoc documentation.',
          missingInterfaceDocs: 'Interface "{{interfaceName}}" requires JSDoc documentation.',
          missingMethodDocs: 'Method "{{methodName}}" requires JSDoc documentation.',
          missingPropertyDocs: 'Property "{{propertyName}}" requires JSDoc documentation.',
          insufficientDescription: 'JSDoc comment for "{{name}}" must have a description of at least {{minLength}} characters.',
          missingParamDocs: 'Parameter "{{paramName}}" in method "{{methodName}}" requires @param documentation.',
          missingReturnDocs: 'Method "{{methodName}}" requires @return documentation.',
          missingThrowsDocs: 'Method "{{methodName}}" with throw statements requires @throws documentation.',
        },
      },

      create(context) {
        const options = context.options[0] || {};
        const requireClassDocs = options.requireClassDocs !== false;
        const requireInterfaceDocs = options.requireInterfaceDocs !== false;
        const requireMethodDocs = options.requireMethodDocs !== false;
        const requirePropertyDocs = options.requirePropertyDocs || false;
        const excludePrivate = options.excludePrivate !== false;
        const excludeConstructors = options.excludeConstructors !== false;
        const excludeGettersSetters = options.excludeGettersSetters !== false;
        const minDescriptionLength = options.minDescriptionLength || 10;
        const requireParams = options.requireParams !== false;
        const requireReturns = options.requireReturns !== false;
        const requireThrows = options.requireThrows !== false;

        // Track classes and interfaces to validate methods
        const classDeclarations = new Map();
        const interfaceDeclarations = new Map();

        return {
          ClassDeclaration(node) {
            if (!requireClassDocs) return;

            const className = node.id?.name;
            if (!className) return;

            const jsdoc = getJSDocComment(node);
            if (!jsdoc) {
              context.report({
                node,
                messageId: 'missingClassDocs',
                data: { className },
              });
            } else {
              validateJSDocContent(jsdoc, className, context);
            }

            // Track class for method validation
            classDeclarations.set(node, className);
          },

          TSInterfaceDeclaration(node) {
            if (!requireInterfaceDocs) return;

            const interfaceName = node.id?.name;
            if (!interfaceName) return;

            const jsdoc = getJSDocComment(node);
            if (!jsdoc) {
              context.report({
                node,
                messageId: 'missingInterfaceDocs',
                data: { interfaceName },
              });
            } else {
              validateJSDocContent(jsdoc, interfaceName, context);
            }

            // Track interface for method validation
            interfaceDeclarations.set(node, interfaceName);
          },

          MethodDefinition(node) {
            if (!requireMethodDocs) return;

            const methodName = getMethodName(node);
            if (!methodName) return;

            // Check exclusions
            if (excludePrivate && isPrivate(node)) return;
            if (excludeConstructors && node.kind === 'constructor') return;
            if (excludeGettersSetters && (node.kind === 'get' || node.kind === 'set')) return;

            const jsdoc = getJSDocComment(node);
            if (!jsdoc) {
              context.report({
                node,
                messageId: 'missingMethodDocs',
                data: { methodName },
              });
            } else {
              validateMethodJSDoc(jsdoc, methodName, node, context);
            }
          },

          TSMethodSignature(node) {
            if (!requireMethodDocs) return;

            const methodName = getMethodName(node);
            if (!methodName) return;

            const jsdoc = getJSDocComment(node);
            if (!jsdoc) {
              // Find parent interface for context
              let parentInterface = null;
              let parent = node.parent;
              while (parent && !parentInterface) {
                if (parent.type === 'TSInterfaceDeclaration') {
                  parentInterface = parent.id?.name;
                }
                parent = parent.parent;
              }

              context.report({
                node,
                messageId: 'missingMethodDocs',
                data: { methodName },
              });
            } else {
              validateMethodJSDoc(jsdoc, methodName, node, context);
            }
          },

          PropertyDefinition(node) {
            if (!requirePropertyDocs) return;

            const propertyName = getPropertyName(node);
            if (!propertyName) return;

            if (excludePrivate && isPrivate(node)) return;

            const jsdoc = getJSDocComment(node);
            if (!jsdoc) {
              context.report({
                node,
                messageId: 'missingPropertyDocs',
                data: { propertyName },
              });
            } else {
              validateJSDocContent(jsdoc, propertyName, context);
            }
          },

          TSPropertySignature(node) {
            if (!requirePropertyDocs) return;

            const propertyName = getPropertyName(node);
            if (!propertyName) return;

            const jsdoc = getJSDocComment(node);
            if (!jsdoc) {
              context.report({
                node,
                messageId: 'missingPropertyDocs',
                data: { propertyName },
              });
            } else {
              validateJSDocContent(jsdoc, propertyName, context);
            }
          },
        };

        function getJSDocComment(node) {
          const comments = context.sourceCode.getCommentsBefore(node);
          for (let i = comments.length - 1; i >= 0; i--) {
            const comment = comments[i];
            if (comment.type === 'Block' && comment.value.startsWith('*')) {
              return comment;
            }
          }
          return null;
        }

        function validateJSDocContent(jsdoc, name, context) {
          if (!jsdoc) return;

          const content = jsdoc.value;
          // Extract description (first line after /**)
          const lines = content.split('\n').map(line => line.trim().replace(/^\* ?/, ''));
          const description = lines.find(line => line.length > 0 && !line.startsWith('@'));

          if (!description || description.length < minDescriptionLength) {
            context.report({
              node: jsdoc,
              messageId: 'insufficientDescription',
              data: {
                name,
                minLength: minDescriptionLength,
              },
            });
          }
        }

        function validateMethodJSDoc(jsdoc, methodName, node, context) {
          validateJSDocContent(jsdoc, methodName, context);

          if (!jsdoc) return;

          const content = jsdoc.value;
          const hasParams = /@param/.test(content);
          const hasReturns = /@return|@returns/.test(content);
          const hasThrows = /@throw|@throws|@exception/.test(content);

          // Check parameters
          if (requireParams && node.params && node.params.length > 0) {
            for (const param of node.params) {
              if (param.type === 'Identifier') {
                const paramName = param.name;
                const paramRegex = new RegExp(`@param.*${paramName}`, 'g');
                if (!paramRegex.test(content)) {
                  context.report({
                    node: jsdoc,
                    messageId: 'missingParamDocs',
                    data: { paramName, methodName },
                  });
                }
              }
            }
          }

          // Check return type (skip for constructors and void methods)
          if (requireReturns && node.kind !== 'constructor') {
            const returnType = getReturnType(node);
            if (returnType !== 'void' && returnType !== 'never' && !hasReturns) {
              context.report({
                node: jsdoc,
                messageId: 'missingReturnDocs',
                data: { methodName },
              });
            }
          }

          // Check throws documentation if method contains throw statements
          if (requireThrows) {
            const hasThrowStatements = containsThrowStatement(node);
            if (hasThrowStatements && !hasThrows) {
              context.report({
                node: jsdoc,
                messageId: 'missingThrowsDocs',
                data: { methodName },
              });
            }
          }
        }

        function getMethodName(node) {
          if (node.key?.name) return node.key.name;
          if (node.key?.value) return node.key.value;
          return null;
        }

        function getPropertyName(node) {
          if (node.key?.name) return node.key.name;
          if (node.key?.value) return node.key.value;
          return null;
        }

        function isPrivate(node) {
          return node.key?.name?.startsWith('_') ||
                 node.key?.name?.startsWith('#') ||
                 node.accessibility === 'private';
        }

        function getReturnType(node) {
          // This is a simplified check - in practice you'd need more sophisticated type checking
          if (node.returnType) {
            return context.sourceCode.getText(node.returnType);
          }
          return 'void';
        }

        function containsThrowStatement(node) {
          // Simple check for throw statements in the method body
          function checkNode(n) {
            if (n.type === 'ThrowStatement') return true;
            if (n.body && Array.isArray(n.body)) {
              return n.body.some(checkNode);
            }
            if (n.consequent) return checkNode(n.consequent);
            if (n.alternate) return checkNode(n.alternate);
            return false;
          }
          return node.body ? checkNode(node.body) : false;
        }
      },
    },
  },
};
