/**
 * Registry - AGENTS.md compliant component registry
 * Strict OO constraints: ≤3 public methods, immutable after construction
 */

const BaseComponent = require('./base-component');

class Registry extends BaseComponent {
  /**
   * Constructor with single spec parameter (AGENTS.md requirement)
   * @param {Object} spec - Registry specification
   */
  constructor(spec) {
    super(spec);
    this.components = new Map();
    this.componentType = spec.componentType || 'component';
  }

  /**
   * List all component IDs (≤3 public methods, ≤10 lines)
   * @returns {Array<string>} Array of component IDs
   */
  listIds() {
    return Array.from(this.components.keys());
  }

  /**
   * Get component by ID or UUID (≤3 public methods, ≤10 lines)
   * @param {string} idOrUuid - Component ID or UUID
   * @returns {Object|null} Component or null if not found
   */
  get(idOrUuid) {
    // Try direct ID lookup first
    if (this.components.has(idOrUuid)) {
      return this.components.get(idOrUuid);
    }
    // Fallback to UUID lookup
    for (const component of this.components.values()) {
      if (component.uuid === idOrUuid) {
        return component;
      }
    }
    return null;
  }

  /**
   * Register component (protected method for subclasses)
   * @param {string} id - Component ID
   * @param {Object} component - Component to register
   */
  _register(id, component) {
    this.components.set(id, component);
  }

  /**
   * Validate component before registration (≤10 lines)
   * @param {Object} component - Component to validate
   * @returns {boolean} Is valid
   */
  _validateComponent(component) {
    return component &&
           component.uuid &&
           component.id &&
           component.search &&
           this._isValidUUID(component.uuid);
  }
}

module.exports = Registry;
