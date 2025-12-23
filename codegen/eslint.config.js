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
      // ESLint all rules - as per linting-system.md
      ...js.configs.all.rules,
      // TypeScript ESLint all rules
      ...tseslint.configs.all.rules,
      // TypeScript ESLint strict type-checked rules
      ...tseslint.configs['strict-type-checked'].rules,
      // TypeScript ESLint stylistic type-checked rules
      ...tseslint.configs['stylistic-type-checked'].rules,

      // Prettier integration
      'prettier/prettier': 'error',

      // Strict rules from linting-system.md
      'max-lines-per-function': ['error', 10],
      'max-params': ['error', 3],
      'complexity': ['error', 5],
      '@typescript-eslint/explicit-function-return-type': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/strict-boolean-expressions': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/prefer-readonly-parameter-types': 'off',
      '@typescript-eslint/no-unused-vars': 'error',

      // Additional strict rules for code quality
      'max-classes-per-file': ['error', 1],
      'max-lines': ['error', 300],
      'sort-imports': ['error', { 'ignoreCase': true, 'memberSyntaxSortOrder': ['none', 'all', 'multiple', 'single'] }],
      'sort-keys': ['error', 'asc', { 'caseSensitive': true, 'natural': false, 'minKeys': 2 }],
      'sort-vars': 'error',
      'one-var': ['error', 'never'],
      'func-style': ['error', 'expression'],
      '@typescript-eslint/member-ordering': [
        'error',
        {
          'default': [
            'signature',
            'field',
            'constructor',
            'method'
          ]
        }
      ],
      'no-ternary': 'error',
      'no-eq-null': 'error',
      'eqeqeq': ['error', 'always'],
      'no-continue': 'error',
      'no-await-in-loop': 'error',
      'no-inline-comments': 'error',
      'no-underscore-dangle': 'error',
      '@typescript-eslint/init-declarations': 'error',
      '@typescript-eslint/no-magic-numbers': ['error', { 'ignore': [0, 1] }],
      '@typescript-eslint/explicit-member-accessibility': ['error', { 'accessibility': 'explicit' }],
      '@typescript-eslint/naming-convention': [
        'error',
        {
          'selector': 'variableLike',
          'format': ['camelCase'],
          'leadingUnderscore': 'allow'
        },
        {
          'selector': 'typeLike',
          'format': ['PascalCase']
        },
        {
          'selector': 'memberLike',
          'modifiers': ['private'],
          'format': ['camelCase'],
          'leadingUnderscore': 'require'
        }
      ],
      'no-duplicate-imports': 'error',
      'require-atomic-updates': 'error',

      // Allow console in Node.js environment
      'no-console': 'off',
      'no-undef': 'off',
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
      'oop-compliance/oop-compliance': [
        'error',
        {
          coreFiles: [
            'src/core/codegen/base-component.ts',
            'src/core/plugins/base-plugin.ts',
          ],
          baseComponentFile: 'src/core/codegen/base-component.ts',
          maxMethods: 3,
        },
      ],
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
