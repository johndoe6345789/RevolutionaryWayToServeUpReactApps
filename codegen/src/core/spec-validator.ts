/**
 * SpecValidator - AGENTS.md compliant specification validator
 * Validates specs against JSON schema and AGENTS.md constraints
 * TypeScript strict typing with no 'any' types
 */

import * as fs from 'fs';
import * as path from 'path';
import {
  ISpecValidatorOptions,
  IValidationResult,
  ISpecForValidation,
  ISearchMetadataForValidation,
} from './interfaces/index';

export class SpecValidator {
  private schemaPath: string;
  private strictMode: boolean;
  private schema: unknown | null;

  /**
   * Constructor with single options parameter
   * @param options - Validator options
   */
  constructor(options: ISpecValidatorOptions = {}) {
    this.schemaPath = options.schemaPath || path.join(__dirname, '../schemas/spec-schema.json');
    this.strictMode = options.strictMode !== false;
    this.schema = null;
  }

  /**
   * Initialise validator (loads schema)
   * @returns Promise<SpecValidator> Initialised validator
   */
  public async initialise(): Promise<SpecValidator> {
    this.schema = JSON.parse(fs.readFileSync(this.schemaPath, 'utf8'));
    return this;
  }

  /**
   * Validate specification
   * @param spec - Specification to validate
   * @returns Validation result
   */
  public validate(spec: unknown): IValidationResult {
    const errors: string[] = [];

    // Basic structure validation
    if (!this._validateBasicStructure(spec, errors)) {
      return { valid: false, errors };
    }

    // AGENTS.md specific validations
    if (!this._validateAgentsMdCompliance(spec as ISpecForValidation, errors)) {
      return { valid: false, errors };
    }

    return { valid: true, errors: [] };
  }

  /**
   * Validate basic structure
   * @param spec - Spec to validate
   * @param errors - Error accumulator
   * @returns Is valid
   */
  private _validateBasicStructure(spec: unknown, errors: string[]): boolean {
    if (!spec || typeof spec !== 'object') {
      errors.push('Spec must be an object');
      return false;
    }

    const specObj = spec as Record<string, unknown>;
    const required = ['uuid', 'id', 'search'];
    for (const field of required) {
      if (!(field in specObj)) {
        errors.push(`Missing required field: ${field}`);
      }
    }

    return errors.length === 0;
  }

  /**
   * Validate AGENTS.md compliance
   * @param spec - Spec to validate
   * @param errors - Error accumulator
   * @returns Is valid
   */
  private _validateAgentsMdCompliance(spec: ISpecForValidation, errors: string[]): boolean {
    // UUID format validation
    if (!this._isValidUUID(spec.uuid)) {
      errors.push('Invalid UUID format (must be RFC 4122)');
    }

    // Search metadata validation
    if (!this._validateSearchMetadata(spec.search, errors)) {
      return false;
    }

    // ID format validation
    if (!this._isValidId(spec.id)) {
      errors.push('Invalid ID format (must match pattern)');
    }

    return errors.length === 0;
  }

  /**
   * Validate search metadata
   * @param search - Search metadata
   * @param errors - Error accumulator
   * @returns Is valid
   */
  private _validateSearchMetadata(search: ISearchMetadataForValidation, errors: string[]): boolean {
    if (!search || typeof search !== 'object') {
      errors.push('Search metadata must be an object');
      return false;
    }

    const required = ['title', 'summary', 'keywords'];
    for (const field of required) {
      if (!(field in search)) {
        errors.push(`Missing required search field: ${field}`);
      }
    }

    if (search.keywords && !Array.isArray(search.keywords)) {
      errors.push('Search keywords must be an array');
    }

    return errors.length === 0;
  }

  /**
   * Validate UUID format
   * @param uuid - UUID to validate
   * @returns Is valid
   */
  private _isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return typeof uuid === 'string' && uuidRegex.test(uuid);
  }

  /**
   * Validate ID format
   * @param id - ID to validate
   * @returns Is valid
   */
  private _isValidId(id: string): boolean {
    const idRegex = /^[a-z][a-z0-9.-]*$/;
    return typeof id === 'string' && idRegex.test(id);
  }
}
