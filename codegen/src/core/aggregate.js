/**
 * Aggregate - AGENTS.md compliant hierarchical container
 * Strict OO constraints: ≤3 public methods, supports drill-down navigation
 */

const BaseComponent = require('./base-component');

class Aggregate extends BaseComponent {
  /**
   * Constructor with single spec parameter (AGENTS.md requirement)
   * @param {Object} spec - Aggregate specification
   */
  constructor(spec) {
    super(spec);
    this.children = new Map();
    this.aggregateType = spec.aggregateType || 'generic';
  }

  /**
   * List child component IDs (≤3 public methods, ≤10 lines)
   * @returns {Array<string>} Array of child IDs
   */
  listChildren() {
    return Array.from(this.children.keys());
  }

  /**
   * Get child by ID (≤3 public methods, ≤10 lines)
   * @param {string} id - Child ID
   * @returns {Aggregate|Registry|Object|null} Child component or null
   */
  getChild(id) {
    return this.children.get(id) || null;
  }

  /**
   * Add child component (protected method for subclasses)
   * @param {string} id - Child ID
   * @param {Aggregate|Registry|Object} child - Child component
   */
  _addChild(id, child) {
    this.children.set(id, child);
  }

  /**
   * Drill down through path (convenience method, ≤10 lines)
   * @param {Array<string>} path - Path segments to traverse
   * @returns {Object|null} Target component or null
   */
  drillDown(path) {
    let current = this;
    for (const segment of path) {
      if (current && typeof current.getChild === 'function') {
        current = current.getChild(segment);
      } else {
        return null;
      }
    }
    return current;
  }

  /**
   * Validate child before adding (≤10 lines)
   * @param {Object} child - Child to validate
   * @returns {boolean} Is valid child
   */
  _validateChild(child) {
    return child &&
           (child instanceof Aggregate ||
            child instanceof require('./registry') ||
            (child.uuid && child.id));
  }
}

module.exports = Aggregate;
