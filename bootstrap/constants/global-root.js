/**
 * Shared reference to the current global object so helpers can run in browsers or Node.
 */
const globalRoot =
  typeof globalThis !== "undefined"
    ? globalThis
    : typeof global !== "undefined"
    ? global
    : this;

module.exports = globalRoot;
