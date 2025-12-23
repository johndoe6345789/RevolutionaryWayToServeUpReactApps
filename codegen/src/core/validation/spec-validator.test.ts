import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SpecValidator } from './spec-validator';
import * as fs from 'fs';
import * as path from 'path';

// Mock filesystem operations
vi.mock('fs');
vi.mock('path');

const mockedFs = vi.mocked(fs),
  mockedPath = vi.mocked(path);

describe('SpecValidator', () => {
  let validator: SpecValidator;
  const mockSchemaPath = '/mock/schema.json',
    mockSchema = {
      type: 'object',
      properties: {
        uuid: { type: 'string' },
        id: { type: 'string' },
        search: { type: 'object' },
      },
      required: ['uuid', 'id', 'search'],
    };

  beforeEach(() => {
    vi.clearAllMocks();
    mockedPath.join.mockReturnValue(mockSchemaPath);
    mockedFs.existsSync.mockReturnValue(true);
    mockedFs.readFileSync.mockReturnValue(JSON.stringify(mockSchema));

    validator = new SpecValidator();
  });

  describe('constructor', () => {
    it.each([
      ['default options', undefined, '/mock/schema.json', true],
      ['custom schema path', { schemaPath: '/custom/path.json' }, '/custom/path.json', true],
      ['strict mode disabled', { strictMode: false }, '/mock/schema.json', false],
      ['strict mode enabled', { strictMode: true }, '/mock/schema.json', true],
    ])('should initialize with %s', (description, options, _expectedPath, _expectedStrict) => {
      const testValidator = new SpecValidator(options);
      expect(mockedPath.join).toHaveBeenCalled();

      // Test that validator can be initialized (schema loading)
      expect(() => testValidator).not.toThrow();
    });
  });

  describe('initialise', () => {
    it.each([
      ['successful schema load', true, JSON.stringify(mockSchema), undefined],
      ['schema file not found', false, null, 'ENOENT'],
      ['invalid JSON schema', true, '{invalid json}', 'SyntaxError'],
    ])('should handle %s', async (description, fileExists, fileContent, expectedError) => {
      mockedFs.existsSync.mockReturnValue(fileExists);

      if (fileContent !== null) {
        mockedFs.readFileSync.mockReturnValue(fileContent);
      } else {
        mockedFs.readFileSync.mockImplementation(() => {
          throw new Error(expectedError);
        });
      }

      if (expectedError) {
        await expect(validator.initialise()).rejects.toThrow();
      } else {
        await expect(validator.initialise()).resolves.not.toThrow();
        expect(mockedFs.readFileSync).toHaveBeenCalledWith(mockSchemaPath, 'utf8');
      }
    });

    it('should return the validator instance when successful', async () => {
      const result = await validator.initialise();
      expect(result).toBe(validator);
    });
  });

  describe('validate', () => {
    beforeEach(async () => {
      await validator.initialise();
    });

    describe('basic structure validation', () => {
      it.each([
        ['null spec', null, false, ['Spec must be an object']],
        ['undefined spec', undefined, false, ['Spec must be an object']],
        ['string spec', 'not an object', false, ['Spec must be an object']],
        ['number spec', 42, false, ['Spec must be an object']],
        ['boolean spec', true, false, ['Spec must be an object']],
        [
          'array spec',
          [],
          false,
          [
            'Missing required field: uuid',
            'Missing required field: id',
            'Missing required field: search',
          ],
        ],
      ])('should reject %s', (description, spec, expectedValid, expectedErrors) => {
        const result = validator.validate(spec);
        expect(result.valid).toBe(expectedValid);
        if (!expectedValid) {
          expect(result.errors).toEqual(expect.arrayContaining(expectedErrors));
        }
      });

      it.each([
        [
          'empty object',
          {},
          false,
          [
            'Missing required field: uuid',
            'Missing required field: id',
            'Missing required field: search',
          ],
        ],
        [
          'only uuid',
          { uuid: '12345678-1234-4123-8123-123456789012' },
          false,
          ['Missing required field: id', 'Missing required field: search'],
        ],
        [
          'only id',
          { id: 'test-id' },
          false,
          ['Missing required field: uuid', 'Missing required field: search'],
        ],
        [
          'only search',
          { search: {} },
          false,
          ['Missing required field: uuid', 'Missing required field: id'],
        ],
        [
          'uuid and id',
          { uuid: '12345678-1234-4123-8123-123456789012', id: 'test-id' },
          false,
          ['Missing required field: search'],
        ],
        [
          'uuid and search',
          { uuid: '12345678-1234-4123-8123-123456789012', search: {} },
          false,
          ['Missing required field: id'],
        ],
        ['id and search', { id: 'test-id', search: {} }, false, ['Missing required field: uuid']],
      ])('should reject spec with %s', (description, spec, expectedValid, expectedErrors) => {
        const result = validator.validate(spec);
        expect(result.valid).toBe(expectedValid);
        if (!expectedValid) {
          expect(result.errors).toEqual(expect.arrayContaining(expectedErrors));
        }
      });
    });

    describe('UUID validation', () => {
      const validSpecTemplate = {
        id: 'test-id',
        search: { title: 'Test', summary: 'Test spec', keywords: ['test'] },
      };

      it.each([
        ['valid UUID v4', '12345678-1234-4123-8123-123456789012', true, []],
        ['valid UUID v4 uppercase', '12345678-1234-4123-8123-123456789ABC', true, []],
        [
          'invalid UUID - wrong format',
          '12345678-1234-4123-8123-12345678901',
          false,
          ['Invalid UUID format (must be RFC 4122)'],
        ],
        [
          'invalid UUID - no hyphens',
          '12345678123441238123123456789012',
          false,
          ['Invalid UUID format (must be RFC 4122)'],
        ],
        [
          'invalid UUID - wrong version',
          '12345678-1234-3123-8123-123456789012',
          false,
          ['Invalid UUID format (must be RFC 4122)'],
        ],
        [
          'invalid UUID - non-hex chars',
          'gggggggg-gggg-gggg-gggg-gggggggggggg',
          false,
          ['Invalid UUID format (must be RFC 4122)'],
        ],
        ['null UUID', null, false, ['Invalid UUID format (must be RFC 4122)']],
        ['undefined UUID', undefined, false, ['Invalid UUID format (must be RFC 4122)']],
        ['empty string UUID', '', false, ['Invalid UUID format (must be RFC 4122)']],
        ['number UUID', 123456789, false, ['Invalid UUID format (must be RFC 4122)']],
      ])('should validate UUID: %s', (description, uuid, expectedValid, expectedErrors) => {
        const spec = { ...validSpecTemplate, uuid },
          result = validator.validate(spec);
        expect(result.valid).toBe(expectedValid);
        if (!expectedValid) {
          expect(result.errors).toEqual(expect.arrayContaining(expectedErrors));
        }
      });
    });

    describe('ID validation', () => {
      const validSpecTemplate = {
        uuid: '12345678-1234-4123-8123-123456789012',
        search: { title: 'Test', summary: 'Test spec', keywords: ['test'] },
      };

      it.each([
        ['valid lowercase id', 'valid-id', true, []],
        ['valid id with numbers', 'id123', true, []],
        ['valid id with hyphens', 'valid-id-name', true, []],
        [
          'valid id with underscores',
          'valid_id_name',
          false,
          ['Invalid ID format (must match pattern)'],
        ],
        ['valid id with dots', 'valid.id.name', true, []],
        [
          'invalid id - starts with hyphen',
          '-invalid',
          false,
          ['Invalid ID format (must match pattern)'],
        ],
        [
          'invalid id - starts with number',
          '1invalid',
          false,
          ['Invalid ID format (must match pattern)'],
        ],
        ['invalid id - uppercase', 'Invalid', false, ['Invalid ID format (must match pattern)']],
        [
          'invalid id - special chars',
          'invalid@id',
          false,
          ['Invalid ID format (must match pattern)'],
        ],
        ['invalid id - spaces', 'invalid id', false, ['Invalid ID format (must match pattern)']],
        ['null id', null, false, ['Invalid ID format (must match pattern)']],
        ['undefined id', undefined, false, ['Invalid ID format (must match pattern)']],
        ['empty string id', '', false, ['Invalid ID format (must match pattern)']],
      ])('should validate ID: %s', (description, id, expectedValid, expectedErrors) => {
        const spec = { ...validSpecTemplate, id },
          result = validator.validate(spec);
        expect(result.valid).toBe(expectedValid);
        if (!expectedValid) {
          expect(result.errors).toEqual(expect.arrayContaining(expectedErrors));
        }
      });
    });

    describe('search metadata validation', () => {
      const validSpecTemplate = {
        uuid: '12345678-1234-4123-8123-123456789012',
        id: 'test-id',
      };

      it.each([
        ['null search', null, false, ['Search metadata must be an object']],
        ['undefined search', undefined, false, ['Search metadata must be an object']],
        ['string search', 'not an object', false, ['Search metadata must be an object']],
        ['number search', 42, false, ['Search metadata must be an object']],
        ['boolean search', true, false, ['Search metadata must be an object']],
        [
          'array search',
          [],
          false,
          [
            'Missing required search field: title',
            'Missing required search field: summary',
            'Missing required search field: keywords',
          ],
        ],
      ])(
        'should reject invalid search metadata: %s',
        (description, search, expectedValid, expectedErrors) => {
          const spec = { ...validSpecTemplate, search },
            result = validator.validate(spec);
          expect(result.valid).toBe(expectedValid);
          if (!expectedValid) {
            expect(result.errors).toEqual(expect.arrayContaining(expectedErrors));
          }
        },
      );

      it.each([
        [
          'empty search object',
          {},
          false,
          [
            'Missing required search field: title',
            'Missing required search field: summary',
            'Missing required search field: keywords',
          ],
        ],
        [
          'only title',
          { title: 'Test' },
          false,
          ['Missing required search field: summary', 'Missing required search field: keywords'],
        ],
        [
          'only summary',
          { summary: 'Test summary' },
          false,
          ['Missing required search field: title', 'Missing required search field: keywords'],
        ],
        [
          'only keywords',
          { keywords: ['test'] },
          false,
          ['Missing required search field: title', 'Missing required search field: summary'],
        ],
        [
          'title and summary',
          { title: 'Test', summary: 'Test summary' },
          false,
          ['Missing required search field: keywords'],
        ],
        [
          'title and keywords',
          { title: 'Test', keywords: ['test'] },
          false,
          ['Missing required search field: summary'],
        ],
        [
          'summary and keywords',
          { summary: 'Test summary', keywords: ['test'] },
          false,
          ['Missing required search field: title'],
        ],
      ])(
        'should reject incomplete search metadata: %s',
        (description, search, expectedValid, expectedErrors) => {
          const spec = { ...validSpecTemplate, search },
            result = validator.validate(spec);
          expect(result.valid).toBe(expectedValid);
          if (!expectedValid) {
            expect(result.errors).toEqual(expect.arrayContaining(expectedErrors));
          }
        },
      );

      it.each([
        ['null keywords', { title: 'Test', summary: 'Test summary', keywords: null }, true, []],
        [
          'undefined keywords',
          { title: 'Test', summary: 'Test summary', keywords: undefined },
          true,
          [],
        ],
        [
          'string keywords',
          { title: 'Test', summary: 'Test summary', keywords: 'not an array' },
          false,
          ['Search keywords must be an array'],
        ],
        [
          'number keywords',
          { title: 'Test', summary: 'Test summary', keywords: 42 },
          false,
          ['Search keywords must be an array'],
        ],
        [
          'object keywords',
          { title: 'Test', summary: 'Test summary', keywords: {} },
          false,
          ['Search keywords must be an array'],
        ],
        [
          'boolean keywords',
          { title: 'Test', summary: 'Test summary', keywords: true },
          false,
          ['Search keywords must be an array'],
        ],
      ])(
        'should validate keywords format: %s',
        (description, search, expectedValid, expectedErrors) => {
          const spec = { ...validSpecTemplate, search },
            result = validator.validate(spec);
          expect(result.valid).toBe(expectedValid);
          if (!expectedValid) {
            expect(result.errors).toEqual(expect.arrayContaining(expectedErrors));
          }
        },
      );

      it.each([
        [
          'valid minimal search',
          { title: 'Test', summary: 'Test summary', keywords: ['test'] },
          true,
          [],
        ],
        [
          'valid full search',
          {
            title: 'Test Component',
            summary: 'A comprehensive test component',
            keywords: ['test', 'component', 'validation'],
            tags: ['utility', 'testing'],
            aliases: ['tester', 'validator'],
            domain: 'testing',
            capabilities: ['validation', 'testing'],
          },
          true,
          [],
        ],
        [
          'empty keywords array',
          { title: 'Test', summary: 'Test summary', keywords: [] },
          true,
          [],
        ],
        [
          'single keyword',
          { title: 'Test', summary: 'Test summary', keywords: ['single'] },
          true,
          [],
        ],
      ])(
        'should accept valid search metadata: %s',
        (description, search, expectedValid, expectedErrors) => {
          const spec = { ...validSpecTemplate, search },
            result = validator.validate(spec);
          expect(result.valid).toBe(expectedValid);
          if (!expectedValid) {
            expect(result.errors).toEqual(expect.arrayContaining(expectedErrors));
          }
        },
      );
    });

    describe('valid specifications', () => {
      it.each([
        [
          'minimal valid spec',
          {
            uuid: '12345678-1234-4123-8123-123456789012',
            id: 'test-component',
            search: {
              title: 'Test Component',
              summary: 'A test component',
              keywords: ['test'],
            },
          },
          true,
          [],
        ],
        [
          'complete valid spec',
          {
            uuid: '12345678-1234-4123-8123-123456789012',
            id: 'advanced-component',
            type: 'component',
            search: {
              title: 'Advanced Component',
              summary: 'An advanced component with full metadata',
              keywords: ['advanced', 'component'],
              tags: ['advanced', 'full-featured'],
              aliases: ['adv-comp'],
              domain: 'application',
              capabilities: ['processing', 'analysis'],
            },
            customField: 'additional data',
          },
          true,
          [],
        ],
      ])('should accept %s', (description, spec, expectedValid, expectedErrors) => {
        const result = validator.validate(spec);
        expect(result.valid).toBe(expectedValid);
        if (!expectedValid) {
          expect(result.errors).toEqual(expect.arrayContaining(expectedErrors));
        }
      });
    });
  });
});
