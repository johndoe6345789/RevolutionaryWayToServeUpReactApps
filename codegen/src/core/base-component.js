/**
 * BaseComponent - Foundation for all AGENTS.md compliant components
 * Strict OO constraints: 1 constructor param, ≤3 public methods, ≤10 lines per function
 */

class BaseComponent {
  /**
   * Constructor with single spec parameter (AGENTS.md requirement)
   * @param {Object} spec - Component specification with uuid, id, search metadata
   */
  constructor(spec) {
    this.uuid = spec.uuid;
    this.id = spec.id;
    this.search = spec.search;
    this.spec = spec;
  }

  /**
   * Initialise component (lifecycle method, ≤10 lines)
   * @returns {Promise<BaseComponent>} Initialised component
   */
  async initialise() {
    // Validate UUID format
    if (!this._isValidUUID(this.uuid)) {
      throw new Error(`Invalid UUID: ${this.uuid}`);
    }
    // Validate required fields
    if (!this.id || !this.search) {
      throw new Error('Missing required fields: id, search');
    }
    return this;
  }

  /**
   * Execute component logic (core method, ≤10 lines)
   * @param {Object} context - Execution context
   * @returns {Object} Execution result
   */
  async execute(context) {
    return {
      success: true,
      component: this.id,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Validate input (optional method, keeps ≤3 total public methods)
   * @param {Object} input - Input to validate
   * @returns {boolean} Validation result
   */
  validate(input) {
    return input && typeof input === 'object';
  }

  /**
   * Validate UUID format (private helper, ≤10 lines)
   * @param {string} uuid - UUID to validate
   * @returns {boolean} Is valid UUID
   */
  _isValidUUID(uuid) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return typeof uuid === 'string' && uuidRegex.test(uuid);
  }
}

module.exports = BaseComponent;
