const path = require("path");

module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  rootDir: ".",
  testMatch: ["**/tests/**/*.test.ts?(x)"],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],
  moduleDirectories: ["node_modules"],
  modulePaths: [
    path.resolve(__dirname, "node_modules"),
    path.resolve(__dirname, "../ci/node_modules")
  ],
  moduleNameMapper: {
    "^@mui/material/(.*)$": "<rootDir>/node_modules/@mui/material/$1",
    "^@mui/material$": "<rootDir>/node_modules/@mui/material",
    "^react/jsx-runtime$": require.resolve("react/jsx-runtime"),
    "^react/jsx-dev-runtime$": require.resolve("react/jsx-dev-runtime")
  },
  globals: {
    "ts-jest": {
      tsconfig: "tsconfig.json"
    }
  },
  setupFilesAfterEnv: ["<rootDir>/tests/setupTests.ts"]
};
