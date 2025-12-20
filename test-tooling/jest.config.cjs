const path = require("path");

module.exports = {
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.(ts|tsx)$": require.resolve("ts-jest")
  },
  rootDir: path.resolve(__dirname, ".."),
  testMatch: ["<rootDir>/test-tooling/tests/**/*.test.ts?(x)"],
  collectCoverage: true,
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "bootstrap/cdn/logging.js",
    "bootstrap/cdn/network.js",
    "bootstrap/cdn/dynamic-modules.js",
    "bootstrap/initializers/path-utils/local-paths.js"
  ],
  coveragePathIgnorePatterns: ["/node_modules/", "<rootDir>/test-tooling/tests/"],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],
  moduleDirectories: ["node_modules"],
  modulePaths: [
    path.resolve(__dirname, "node_modules"),
    path.resolve(__dirname, "../ci/node_modules")
  ],
  moduleNameMapper: {
    "^@mui/material/(.*)$": "<rootDir>/test-tooling/node_modules/@mui/material/$1",
    "^@mui/material$": "<rootDir>/test-tooling/node_modules/@mui/material",
    "^react/jsx-runtime$": require.resolve("react/jsx-runtime"),
    "^react/jsx-dev-runtime$": require.resolve("react/jsx-dev-runtime")
  },
  globals: {
    "ts-jest": {
      tsconfig: "tsconfig.json"
    }
  },
  setupFilesAfterEnv: ["<rootDir>/test-tooling/tests/setupTests.ts"]
};
