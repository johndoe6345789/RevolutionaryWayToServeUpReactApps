/**
 * Python Generator Tests - 100% coverage required
 * Tests generation, validation, and lifecycle compliance
 */

import { beforeEach, describe, expect, it } from 'vitest';
import { PythonGenerator } from '../src/python-generator';

describe('PythonGenerator', () => {
  let generator: PythonGenerator, mockSpec: any;

  beforeEach(() => {
    mockSpec = {
      uuid: '550e8400-e29b-41d4-a716-446655440034',
      id: 'language.python',
      search: {
        title: 'Python',
        summary: 'Test spec',
        keywords: ['test'],
        domain: 'codegen',
      },
      templates: {
        class: {
          pattern: [
            'class {name}:',
            '    """{docstring}"""',
            '',
            '    def __init__(self{parameters}):',
            '{init-body}',
            '',
            '{methods}',
          ],
        },
        function: {
          pattern: [
            'def {name}({parameters}){return-type}:',
            '    """{docstring}"""',
            '{body}',
            '    return {return-value}',
          ],
        },
      },
      extensions: ['.py'],
    };

    generator = new PythonGenerator(mockSpec);
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
      expect(generator.language).toBe('python');
      expect(generator.extensions).toEqual(['.py']);
    });
  });

  describe('Language Interface', () => {
    it('should support Python language', () => {
      expect(generator.language).toBe('python');
      expect(generator.extensions).toEqual(['.py']);
      expect(generator.supportedTemplates).toContain('class');
    });

    it('should validate template support', () => {
      expect(generator.supportsTemplate('class')).toBe(true);
      expect(generator.supportsTemplate('dataclass')).toBe(true);
      expect(generator.supportsTemplate('invalid')).toBe(false);
    });
  });

  describe('Code Generation', () => {
    it('should generate class code from template', async () => {
      generator.initialise();
      generator.validate();

      const context = {
          templateId: 'class',
          language: 'python',
          variables: {
            name: 'TestClass',
            docstring: 'A test class',
            parameters: ['name: str', 'age: int'],
            'init-body': ['        self.name = name', '        self.age = age'],
            methods: [
              '    def greet(self) -> str:',
              '        """Return a greeting message."""',
              '        return f"Hello, {self.name}!"',
            ],
          },
          output: {
            directory: '/tmp',
            filename: 'TestClass',
            overwrite: false,
          },
        },
        result = await generator.generate(context);

      expect(result.content).toEqual([
        'class TestClass:',
        '    """A test class"""',
        '',
        '    def __init__(self, name: str, age: int):',
        '        self.name = name',
        '        self.age = age',
        '',
        '    def greet(self) -> str:',
        '        """Return a greeting message."""',
        '        return f"Hello, {self.name}!"',
      ]);
      expect(result.extension).toBe('.py');
      expect(result.metadata.language).toBe('python');
    });

    it('should handle function templates', async () => {
      // Add function template to mock spec
      mockSpec.templates.function = {
        pattern: [
          'def {name}({parameters}){return-type}:',
          '    """{docstring}"""',
          '{body}',
          '    return {return-value}',
        ],
      };

      const context = {
          templateId: 'function',
          language: 'python',
          variables: {
            name: 'calculate_sum',
            parameters: 'a: int, b: int',
            'return-type': 'int',
            docstring: 'Calculate the sum of two numbers',
            body: ['    """Calculate the sum of two integers."""', '    result = a + b'],
            'return-value': 'result',
          },
          output: {
            directory: '/tmp',
            filename: 'utils',
            overwrite: false,
          },
        },
        result = await generator.generate(context);
      expect(result.content.join('\n')).toContain('def calculate_sum(a: int, b: int) -> int:');
      expect(result.content.join('\n')).toContain('"""Calculate the sum of two numbers"""');
      expect(result.extension).toBe('.py');
    });
  });

  describe('Error Handling', () => {
    it('should throw on unsupported template', async () => {
      generator.initialise();
      generator.validate();

      const context = {
        templateId: 'unsupported',
        language: 'python',
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

      expect(() => new PythonGenerator(invalidSpec)).toThrow('Python spec missing templates');
    });
  });
});
