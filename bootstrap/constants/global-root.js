const GlobalRootHandler = require("./global-root-handler.js");

const handler = new GlobalRootHandler();

module.exports = handler.root;
module.exports.handler = handler;
