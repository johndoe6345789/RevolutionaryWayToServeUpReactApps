// Main factories index
const BaseFactory = require('../interfaces/base-factory.js');
const core = require('./core/');
const services = require('./services/');
const local = require('./local/');
const cdn = require('./cdn/');

module.exports = {
  BaseFactory,
  core,
  services,
  local,
  cdn
};
