import type { Config } from 'jest';

/**
 * Jest configuration for PoliMarket CLI project.
 * Uses ts-jest for TypeScript support and maps path aliases.
 */
const config: Config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['src/**/*.(t|j)s', '!src/main.ts'],
  coverageDirectory: './coverage',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@shared/(.*)$': '<rootDir>/src/shared/$1',
    '^@facades/(.*)$': '<rootDir>/src/facades/$1',
  },
};

export default config;
