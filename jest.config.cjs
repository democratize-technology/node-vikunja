/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    // Handle ES module imports 
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  collectCoverageFrom: ['src/**/*.ts'],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    'src/index.ts',
    'src/services/index.ts',
    'src/models/index.ts',
    'src/models/common.ts'
  ],
  testMatch: ['**/__tests__/**/*.test.ts', '**/*.test.ts'],
};
