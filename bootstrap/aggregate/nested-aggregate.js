const BaseClass = require('../base/base-class.js');
const AggregateData = require('../data/aggregate-data.js');
const fs = require('fs');
const path = require('path');

/**
 * NestedAggregate - Handles hierarchical class loading and management
 * Enforces OO plugin rules with single business method
 */
class NestedAggregate extends BaseClass {
  /**
   * Creates a new NestedAggregate instance
   * @param {Object} data - Configuration data
   */
  constructor(data) {
    super(data);
    this.aggregateTree = new Map();
    this.aggregateMap = new Map();
    this.constantsPath = data.constantsPath || path.join(__dirname, 'class-constants.json');
    this.maxNestingLevel = data.maxNestingLevel || 5;
    this.rootAggregates = [];
  }

  /**
   * Initializes the nested aggregate and loads hierarchy
   * @returns {Promise<NestedAggregate>} The initialized instance
   */
  async initialize() {
    await this.loadAggregateHierarchy();
    this.buildAggregateTree();
    this.generateGetMethods();
    return super.initialize();
  }

  /**
   * The ONE additional method - loads nested aggregate hierarchy from JSON
   * @returns {Promise<Array>} The loaded aggregate hierarchy
   */
  async loadAggregateHierarchy() {
    try {
      const constantsContent = fs.readFileSync(this.constantsPath, 'utf8');
      const constants = JSON.parse(constantsContent);
      
      const aggregates = constants.classes || [];
      
      // Build hierarchy and create AggregateData instances
      for (const aggregateData of aggregates) {
        const aggregate = new AggregateData(aggregateData);
        await aggregate.initialize();
        aggregate.validate();
        
        this.aggregateMap.set(aggregate.name, aggregate);
        
        // Track root aggregates
        if (aggregate.isRoot()) {
          this.rootAggregates.push(aggregate.name);
        }
      }
      
      // Build parent-child relationships
      this.buildParentChildRelationships();
      
      return aggregates;
    } catch (error) {
      throw new Error(`Failed to load aggregate hierarchy: ${error.message}`);
    }
  }

  /**
   * Builds parent-child relationships in the hierarchy
   */
  buildParentChildRelationships() {
    for (const [name, aggregate] of this.aggregateMap) {
      if (aggregate.parent) {
        const parent = this.aggregateMap.get(aggregate.parent);
        if (parent) {
          parent.addChild(aggregate);
        }
      }
    }
  }

  /**
   * Builds the aggregate tree structure
   */
  buildAggregateTree() {
    for (const rootName of this.rootAggregates) {
      const rootAggregate = this.aggregateMap.get(rootName);
      if (rootAggregate) {
        this.aggregateTree.set(rootName, this.buildTreeNode(rootAggregate));
      }
    }
  }

  /**
   * Builds a tree node for an aggregate and its children
   * @param {AggregateData} aggregate - The aggregate to build node for
   * @returns {Object} Tree node structure
   */
  buildTreeNode(aggregate) {
    const node = {
      name: aggregate.name,
      factory: aggregate.factory,
      dataClass: aggregate.dataClass,
      module: aggregate.module,
      config: aggregate.config,
      depth: aggregate.getDepth(),
      children: []
    };

    for (const child of aggregate.children) {
      node.children.push(this.buildTreeNode(new AggregateData(child)));
    }

    return node;
  }

  /**
   * Generates get methods for each aggregate in the hierarchy
   */
  generateGetMethods() {
    for (const [name, aggregate] of this.aggregateMap) {
      const methodName = `get${aggregate.name}`;
      
      this[methodName] = async function(config = {}) {
        try {
          // Check nesting level limit
          if (aggregate.nestingLevel > this.maxNestingLevel) {
            throw new Error(`Nesting level ${aggregate.nestingLevel} exceeds maximum ${this.maxNestingLevel}`);
          }
          
          // Dynamically require the factory
          const FactoryClass = require(`../factories/${aggregate.factory}.js`);
          const factory = new FactoryClass({
            ...config,
            targetClass: aggregate.name,
            dataClass: aggregate.dataClass,
            aggregateHierarchy: this.getAggregatePath(aggregate.name)
          });
          
          await factory.initialize();
          return await factory.create(config);
        } catch (error) {
          throw new Error(`Failed to create ${aggregate.name}: ${error.message}`);
        }
      };
    }
  }

  /**
   * Gets the path from root to the specified aggregate
   * @param {string} aggregateName - Name of the aggregate
   * @returns {Array} Path from root to aggregate
   */
  getAggregatePath(aggregateName) {
    const aggregate = this.aggregateMap.get(aggregateName);
    if (!aggregate) {
      return [];
    }

    const path = [];
    let current = aggregate;
    
    while (current) {
      path.unshift(current.name);
      if (current.parent) {
        current = this.aggregateMap.get(current.parent);
      } else {
        break;
      }
    }
    
    return path;
  }

  /**
   * Gets aggregate information by name
   * @param {string} aggregateName - The aggregate name to lookup
   * @returns {Object|null} Aggregate information or null if not found
   */
  getAggregateInfo(aggregateName) {
    const aggregate = this.aggregateMap.get(aggregateName);
    return aggregate ? aggregate.toJSON() : null;
  }

  /**
   * Gets all root aggregates
   * @returns {Array} Array of root aggregate names
   */
  getRootAggregates() {
    return [...this.rootAggregates];
  }

  /**
   * Gets children of an aggregate
   * @param {string} parentName - Parent aggregate name
   * @returns {Array} Array of child aggregate names
   */
  getChildren(parentName) {
    const parent = this.aggregateMap.get(parentName);
    return parent ? parent.children.map(child => child.name) : [];
  }

  /**
   * Gets all descendants of an aggregate
   * @param {string} parentName - Parent aggregate name
   * @returns {Array} Array of all descendant aggregate names
   */
  getAllDescendants(parentName) {
    const parent = this.aggregateMap.get(parentName);
    return parent ? parent.getAllDescendants().map(child => child.name) : [];
  }

  /**
   * Gets the complete aggregate tree
   * @returns {Object} Complete tree structure
   */
  getAggregateTree() {
    const tree = {};
    for (const [rootName, rootNode] of this.aggregateTree) {
      tree[rootName] = rootNode;
    }
    return tree;
  }

  /**
   * Gets aggregates at a specific nesting level
   * @param {number} level - Nesting level to filter by
   * @returns {Array} Aggregates at the specified level
   */
  getAggregatesAtLevel(level) {
    const result = [];
    for (const [name, aggregate] of this.aggregateMap) {
      if (aggregate.nestingLevel === level) {
        result.push(aggregate.toJSON());
      }
    }
    return result;
  }

  /**
   * Validates the aggregate hierarchy
   * @returns {Object} Validation result with issues array
   */
  validateHierarchy() {
    const issues = [];
    
    // Check for circular references
    const visited = new Set();
    const recursionStack = new Set();
    
    const checkCircular = (aggregateName) => {
      if (recursionStack.has(aggregateName)) {
        issues.push(`Circular reference detected: ${aggregateName}`);
        return;
      }
      
      if (visited.has(aggregateName)) {
        return;
      }
      
      visited.add(aggregateName);
      recursionStack.add(aggregateName);
      
      const aggregate = this.aggregateMap.get(aggregateName);
      if (aggregate) {
        for (const child of aggregate.children) {
          checkCircular(child.name);
        }
      }
      
      recursionStack.delete(aggregateName);
    };
    
    for (const rootName of this.rootAggregates) {
      checkCircular(rootName);
    }
    
    // Check for orphaned aggregates
    const allReferenced = new Set();
    for (const aggregate of this.aggregateMap.values()) {
      if (aggregate.parent) {
        allReferenced.add(aggregate.parent);
      }
      for (const child of aggregate.children) {
        allReferenced.add(child.name);
      }
    }
    
    for (const [name] of this.aggregateMap) {
      if (!allReferenced.has(name) && !this.aggregateMap.get(name).isRoot()) {
        issues.push(`Orphaned aggregate detected: ${name}`);
      }
    }
    
    return {
      valid: issues.length === 0,
      issues: issues,
      totalAggregates: this.aggregateMap.size,
      maxDepth: Math.max(...Array.from(this.aggregateMap.values()).map(a => a.nestingLevel))
    };
  }

  /**
   * Gets hierarchy statistics
   * @returns {Object} Hierarchy statistics
   */
  getHierarchyStats() {
    const stats = {
      totalAggregates: this.aggregateMap.size,
      rootAggregates: this.rootAggregates.length,
      maxDepth: 0,
      avgChildren: 0,
      leafCount: 0
    };
    
    let totalChildren = 0;
    for (const aggregate of this.aggregateMap.values()) {
      stats.maxDepth = Math.max(stats.maxDepth, aggregate.nestingLevel);
      totalChildren += aggregate.children.length;
      if (aggregate.isLeaf()) {
        stats.leafCount++;
      }
    }
    
    stats.avgChildren = stats.totalAggregates > 0 ? totalChildren / stats.totalAggregates : 0;
    
    return stats;
  }

  /**
   * Checks if an aggregate exists
   * @param {string} aggregateName - The aggregate name to check
   * @returns {boolean} True if aggregate exists
   */
  hasAggregate(aggregateName) {
    return this.aggregateMap.has(aggregateName);
  }

  /**
   * Gets all registered aggregates
   * @returns {Array} Array of aggregate information
   */
  getAllAggregates() {
    return Array.from(this.aggregateMap.values()).map(aggregate => aggregate.toJSON());
  }
}

module.exports = NestedAggregate;
