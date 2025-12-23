/**
 * TypeScript Generator Tests - 100% coverage required
 * Tests generation, validation, and lifecycle compliance
 */

import { beforeEach, describe, expect, it } from 'vitest';
import { TypeScriptGenerator } from '../src/typescript-generator';

describe('TypeScriptGenerator', () => {
  let generator: TypeScriptGenerator, mockSpec: any;

  beforeEach(() => {
    mockSpec = {
      uuid: '550e8400-e29b-41d4-a716-446655440032',
      id: 'language.typescript',
      search: {
        title: 'TypeScript',
        summary: 'Test spec',
        keywords: ['test'],
        domain: 'codegen',
      },
      templates: {
        class: {
          pattern: ['export class {name} {', '  constructor() {', '    {body}', '  }', '}'],
        },
      },
      extensions: ['.ts', '.tsx'],
    };

    generator = new TypeScriptGenerator(mockSpec);
  });

  describe('Lifecycle Compliance', () => {
    it('should implement IStandardLifecycle', () => {
      expect(generator.initialise).toBeDefined();
      expect(generator.validate).toBeDefined();
      expect(generator.execute).toBeDefined();
      expect(generator.cleanup).toBeDefined();
      expect(generator.debug).toBeDefined();
      expect(generator.reset).toBeDefined();
      expect(generator.status).toBeDefined();
    });

    it('should implement ILanguageGenerator', () => {
      expect(generator.generate).toBeDefined();
      expect(generator.supportsTemplate).toBeDefined();
      expect(generator.language).toBe('typescript');
      expect(generator.extensions).toEqual(['.ts', '.tsx']);
    });
  });

  describe('Language Interface', () => {
    it('should support TypeScript language', () => {
      expect(generator.language).toBe('typescript');
      expect(generator.extensions).toEqual(['.ts', '.tsx']);
      expect(generator.supportedTemplates).toContain('class');
    });

    it('should validate template support', () => {
      expect(generator.supportsTemplate('class')).toBe(true);
      expect(generator.supportsTemplate('invalid')).toBe(false);
    });
  });

  describe('Code Generation', () => {
    it('should generate class code from template', async () => {
      generator.initialise();
      generator.validate();

      const context = {
          templateId: 'class',
          language: 'typescript',
          variables: {
            name: 'TestClass',
            body: 'this.value = 42;',
          },
          output: {
            directory: '/tmp',
            filename: 'TestClass',
            overwrite: false,
          },
        },
        result = await generator.generate(context);

      expect(result.content).toEqual([
        'export class TestClass {',
        '  constructor() {',
        '    this.value = 42;',
        '  }',
        '}',
      ]);
      expect(result.extension).toBe('.ts');
      expect(result.metadata.language).toBe('typescript');
    });

    it('should handle component templates with tsx extension', async () => {
      // Add component template to mock spec
      mockSpec.templates.component = {
        pattern: ['export const {name} = () => <div>Hello</div>;'],
      };
      mockSpec.supportedTemplates = ['class', 'component'];

      const context = {
          templateId: 'component',
          language: 'typescript',
          variables: { name: 'MyComponent' },
          output: {
            directory: '/tmp',
            filename: 'MyComponent',
            overwrite: false,
          },
        },
        result = await generator.generate(context);
      expect(result.extension).toBe('.tsx');
    });
  });

  describe('Error Handling', () => {
    it('should throw on unsupported template', async () => {
      generator.initialise();
      generator.validate();

      const context = {
        templateId: 'unsupported',
        language: 'typescript',
        variables: {},
        output: {
          directory: '/tmp',
          filename: 'test',
          overwrite: false,
        },
      };

      try {
        await generator.generate(context);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect((error as Error).message).toContain('Template unsupported not supported');
      }
    });

    it('should validate spec on construction', () => {
      const invalidSpec = { ...mockSpec };
      delete invalidSpec.templates;

      expect(() => new TypeScriptGenerator(invalidSpec)).toThrow(
        'TypeScript spec missing templates',
      );
    });
  });
});
