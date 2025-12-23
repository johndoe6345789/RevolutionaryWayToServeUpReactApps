/**
 * SpecValidator - AGENTS.md compliant specification validator
 * Validates specs against JSON schema and AGENTS.md constraints
 */

const fs = require('fs');
const path = require('path');

class SpecValidator {
  /**
   * Constructor with single options parameter
   * @param {Object} options - Validator options
   */
  constructor(options = {}) {
    this.schemaPath = options.schemaPath || path.join(__dirname, '../schemas/spec-schema.json');
    this.strictMode = options.strictMode !== false;
    this.schema = null;
  }

  /**
   * Initialise validator (loads schema)
   * @returns {Promise<SpecValidator>} Initialised validator
   */
  async initialise() {
    this.schema = JSON.parse(fs.readFileSync(this.schemaPath, 'utf8'));
    return this;
  }

  /**
   * Validate specification
   * @param {Object} spec - Specification to validate
   * @returns {Object} Validation result
   */
  validate(spec) {
    const errors = [];

    // Basic structure validation
    if (!this._validateBasicStructure(spec, errors)) {
      return { valid: false, errors };
    }

    // AGENTS.md specific validations
    if (!this._validateAgentsMdCompliance(spec, errors)) {
      return { valid: false, errors };
    }

    return { valid: true, errors: [] };
  }

  /**
   * Validate basic structure
   * @param {Object} spec - Spec to validate
   * @param {Array} errors - Error accumulator
   * @returns {boolean} Is valid
   */
  _validateBasicStructure(spec, errors) {
    if (!spec || typeof spec !== 'object') {
      errors.push('Spec must be an object');
      return false;
    }

    const required = ['uuid', 'id', 'search'];
    for (const field of required) {
      if (!(field in spec)) {
        errors.push(`Missing required field: ${field}`);
      }
    }

    return errors.length === 0;
  }

  /**
   * Validate AGENTS.md compliance
   * @param {Object} spec - Spec to validate
   * @param {Array} errors - Error accumulator
   * @returns {boolean} Is valid
   */
  _validateAgentsMdCompliance(spec, errors) {
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
   * @param {Object} search - Search metadata
   * @param {Array} errors - Error accumulator
   * @returns {boolean} Is valid
   */
  _validateSearchMetadata(search, errors) {
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
   * @param {string} uuid - UUID to validate
   * @returns {boolean} Is valid
   */
  _isValidUUID(uuid) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return typeof uuid === 'string' && uuidRegex.test(uuid);
  }

  /**
   * Validate ID format
   * @param {string} id - ID to validate
   * @returns {boolean} Is valid
   */
  _isValidId(id) {
    const idRegex = /^[a-z][a-z0-9.-]*$/;
    return typeof id === 'string' && idRegex.test(id);
  }
}

module.exports = SpecValidator;
