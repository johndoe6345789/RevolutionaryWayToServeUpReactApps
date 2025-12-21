const NetworkEntryPoint = require("./network-entrypoint.js");

const entrypoint = new NetworkEntryPoint();
const { exports: networkExports } = entrypoint.run();

module.exports = networkExports;
