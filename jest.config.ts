import type { Config } from "jest";

const config: Config = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
    "^next/link$": "<rootDir>/__mocks__/next-link.tsx",
    "^next/navigation$": "<rootDir>/__mocks__/next-navigation.ts",
    "^next-auth/react$": "<rootDir>/__mocks__/next-auth-react.ts",
  },
  testMatch: ["**/__tests__/**/*.[jt]s?(x)", "**/?(*.)+(spec|test).[jt]s?(x)"],
  transform: {
    "^.+\\.(ts|tsx)$": ["ts-jest", { tsconfig: "tsconfig.test.json", useESM: false }],
  },
  transformIgnorePatterns: [
    "/node_modules/(?!(next|@testing-library)/)",
  ],
  globals: {
    "ts-jest": {
      tsconfig: "tsconfig.test.json",
    },
  },
  collectCoverageFrom: [
    "lib/**/*.{ts,tsx}",
    "components/**/*.{ts,tsx}",
    "app/**/*.{ts,tsx}",
    "!app/**/*.d.ts",
    "!**/node_modules/**",
  ],
};

export default config;