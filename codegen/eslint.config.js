import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import prettier from 'eslint-plugin-prettier';
import jsdoc from 'eslint-plugin-jsdoc';
import noHardcodedStrings from './src/core/eslint-rules/no-hardcoded-strings.js';
import noLargeDirectories from './src/core/eslint-rules/no-large-directories.js';
import requireReadme from './src/core/eslint-rules/require-readme.js';
import oopCompliance from './src/core/eslint-rules/oop-compliance.js';
import singleExportPerFile from './src/core/eslint-rules/single-export-per-file.js';
import validateSpecs from './src/core/eslint-rules/validate-specs.js';
import pluginDependencies from './src/core/eslint-rules/plugin-dependencies.js';

export default [
  js.configs.all,
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        project: './tsconfig.json',
      },
      globals: {
        console: 'readonly',
        process: 'readonly',
        __dirname: 'readonly',
        require: 'readonly',
        module: 'readonly',
        Buffer: 'readonly',
        global: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      prettier,
      jsdoc,
      'no-hardcoded-strings': noHardcodedStrings,
      'no-large-directories': noLargeDirectories,
      'require-readme': requireReadme,
      'oop-compliance': oopCompliance,
      'single-export-per-file': singleExportPerFile,
      'validate-specs': validateSpecs,
      'plugin-dependencies': pluginDependencies,
    },
    rules: {
      // ESLint all rules
      ...js.configs.all.rules,
      // TypeScript ESLint all rules
      ...tseslint.configs.all.rules,
      // TypeScript ESLint strict type-checked rules
      ...tseslint.configs['strict-type-checked'].rules,
      // TypeScript ESLint stylistic type-checked rules
      ...tseslint.configs['stylistic-type-checked'].rules,
      'prettier/prettier': 'error',
      // Mandatory strict rules from linting-system.md
      'max-lines-per-function': ['error', 10],
      'max-params': ['error', 3],
      'complexity': ['error', 5],
      '@typescript-eslint/explicit-function-return-type': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/strict-boolean-expressions': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      // Existing rules that are still needed
      '@typescript-eslint/explicit-module-boundary-types': 'error',
      '@typescript-eslint/prefer-nullish-coalescing': 'error',
      '@typescript-eslint/prefer-optional-chain': 'error',
      '@typescript-eslint/no-unnecessary-condition': 'error',
      '@typescript-eslint/require-await': 'error',
      '@typescript-eslint/no-shadow': 'error',
      '@typescript-eslint/no-redundant-type-constituents': 'error',
      '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
      '@typescript-eslint/no-confusing-void-expression': 'error',
      '@typescript-eslint/prefer-as-const': 'error',
      '@typescript-eslint/prefer-enum-initializers': 'error',
      '@typescript-eslint/prefer-literal-enum-member': 'error',
      '@typescript-eslint/prefer-readonly': 'error',
      '@typescript-eslint/prefer-readonly-parameter-types': 'off',
      '@typescript-eslint/triple-slash-reference': 'error',
      '@typescript-eslint/prefer-regexp-exec': 'error',
      '@typescript-eslint/prefer-return-this-type': 'error',
      '@typescript-eslint/prefer-string-starts-ends-with': 'error',
      '@typescript-eslint/prefer-ts-expect-error': 'error',
      '@typescript-eslint/no-require-imports': 'off',
      'max-classes-per-file': ['error', 1],
      'no-console': 'off', // Allow console in Node.js scripts
      'no-undef': 'off', // Allow Node.js globals
      'no-hardcoded-strings/no-hardcoded-strings': [
        'warn',
        {
          maxTemplateLiteralLines: 5,
          maxStringPropertiesInObject: 3,
          maxStringArrayLength: 5,
          ignoreInTests: true,
        },
      ],
      'no-large-directories/no-large-directories': [
        'warn',
        {
          maxFiles: 15,
          excludePatterns: [
            'node_modules',
            '.git',
            'dist',
            'build',
            '__pycache__',
            '.next',
            'coverage',
          ],
          excludeExtensions: ['.log', '.lock', '.map', '.min.js', '.min.css'],
          includeExtensions: ['.ts', '.tsx', '.js', '.jsx', '.json', '.md'],
        },
      ],
      'require-readme/require-readme': [
        'warn',
        {
          requireInRoot: true,
          requireInSubdirs: false,
          readmeNames: ['README.md', 'readme.md', 'Readme.md'],
          excludePatterns: [
            'node_modules',
            '.git',
            'dist',
            'build',
            '__pycache__',
            '.next',
            'coverage',
            '.vscode',
          ],
          minContentLength: 50,
          checkContent: true,
        },
      ],
      'jsdoc/require-jsdoc': [
        'warn',
        {
          require: {
            ClassDeclaration: true,
            MethodDefinition: true,
            FunctionDeclaration: false,
          },
          contexts: ['TSInterfaceDeclaration', 'TSMethodSignature'],
          checkConstructors: false,
          checkGetters: false,
          checkSetters: false,
        },
      ],
      'jsdoc/require-param': 'warn',
      'jsdoc/require-returns': 'warn',
      'jsdoc/require-throws': 'warn',
      'oop-compliance/oop-compliance': 'error',
      'single-export-per-file/single-export-per-file': 'error',
      'validate-specs/validate-specs': [
        'error',
        {
          specFiles: [
            'src/plugins/tools/oop-principles/spec.json',
            'src/plugins/tools/test-runner/spec.json',
            'src/specs/bootstrap-system/spec.json',
          ],
        },
      ],
      'plugin-dependencies/plugin-dependencies': 'error',
    },
  },

  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      'max-lines': ['error', 300],
    },
  },
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        console: 'readonly',
        process: 'readonly',
        __dirname: 'readonly',
        require: 'readonly',
        module: 'readonly',
        Buffer: 'readonly',
        global: 'readonly',
      },
    },
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-console': 'off', // Allow console in scripts
      'no-underscore-dangle': 'off', // Allow __dirname in scripts
      'func-style': 'off', // Allow function declarations in scripts
      'one-var': 'off', // Allow multiple const declarations
      'no-magic-numbers': 'off', // Allow magic numbers in scripts
    },
  },
  {
    files: [
      '**/*.test.ts',
      '**/*.test.tsx',
      '**/*.spec.ts',
      '**/*.spec.tsx',
      '**/__tests__/setup.ts',
    ],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/strict-boolean-expressions': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      'no-console': 'off',
      'max-classes-per-file': 'off',
    },
  },
  {
    ignores: ['node_modules/**', 'dist/**', 'build/**', '*.config.js', '*.config.ts'],
  },
];
