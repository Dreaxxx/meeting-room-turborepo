import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '.',
  testMatch: ['**/?(*.)+(spec).ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: ['src/**/*.ts', '!src/main.ts', '!src/**/*.module.ts', '!src/**/dto/*.ts', '!src/**/entities/*.ts'],
  coverageDirectory: 'coverage',
  setupFilesAfterEnv: ['<rootDir>/test/setup-unit.ts'],
};
export default config;
