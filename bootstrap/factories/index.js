// Main factories index
const BaseFactory = require('./base-factory.js');
const core = require('./core/');
const services = require('./services/');
const local = require('./local/');
const cdn = require('./cdn/');
const factoryManager = require('./factory-manager.js');
const factoryManagerInstance = require('./factory-manager-instance.js');

module.exports = {
  BaseFactory,
  core,
  services,
  local,
  cdn,
  factoryManager,
  factoryManagerInstance
};