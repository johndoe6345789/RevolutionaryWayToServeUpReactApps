const globalObject =
  typeof globalThis !== "undefined"
    ? globalThis
    : typeof global !== "undefined"
    ? global
    : {};

const isCommonJs = typeof module !== "undefined" && module.exports;

module.exports = { globalObject, isCommonJs };
