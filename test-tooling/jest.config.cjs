module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  rootDir: ".",
  testMatch: ["**/tests/**/*.test.ts?(x)"],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],
  moduleNameMapper: {
    "^@mui/material/(.*)$": "<rootDir>/../node_modules/@mui/material/$1",
    "^@mui/material$": "<rootDir>/../node_modules/@mui/material",
    "^react/jsx-runtime$": "<rootDir>/../node_modules/react/jsx-runtime.js",
    "^react/jsx-dev-runtime$": "<rootDir>/../node_modules/react/jsx-dev-runtime.js"
  },
  globals: {
    "ts-jest": {
      tsconfig: "tsconfig.json"
    }
  },
  setupFilesAfterEnv: ["<rootDir>/tests/setupTests.ts"]
};
