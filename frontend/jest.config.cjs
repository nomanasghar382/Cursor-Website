const nextJest = require("next/jest");

const createJestConfig = nextJest({ dir: "./" });

/** @type {import('jest').Config} */
const config = {
  testEnvironment: "jsdom",
  modulePathIgnorePatterns: ["<rootDir>/.next/"],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  testMatch: ["<rootDir>/src/**/*.test.{ts,tsx}"],
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/app/**",
    "!src/**/*.stories.{ts,tsx}",
  ],
  coverageDirectory: "coverage",
  coverageThreshold: {
    global: {
      branches: 3,
      functions: 3,
      lines: 4,
      statements: 4,
    },
  },
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
};

module.exports = createJestConfig(config);
