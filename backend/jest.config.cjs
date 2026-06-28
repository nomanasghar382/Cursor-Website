module.exports = {
  moduleFileExtensions: ["js", "json", "ts"],
  rootDir: ".",
  testRegex: ".*\\.spec\\.ts$",
  transform: {
    "^.+\\.(t|j)s$": ["ts-jest", { tsconfig: "tsconfig.json" }],
  },
  collectCoverageFrom: [
    "src/**/*.(t|j)s",
    "!src/**/*.module.ts",
    "!src/main.ts",
    "!src/**/index.ts",
  ],
  coverageDirectory: "coverage",
  coverageThreshold: {
    global: {
      branches: 5,
      functions: 6,
      lines: 10,
      statements: 11,
    },
  },
  testEnvironment: "node",
  transformIgnorePatterns: ["/node_modules/(?!(@scure|@noble|otplib|@otplib)/)"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@common/(.*)$": "<rootDir>/src/common/$1",
    "^@core/(.*)$": "<rootDir>/src/core/$1",
    "^@modules/(.*)$": "<rootDir>/src/modules/$1",
    "^@shared/(.*)$": "<rootDir>/src/shared/$1"
  }
};
