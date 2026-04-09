module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  moduleNameMapper: {
    '^@domain/(.*)$': '<rootDir>/src/domain/$1',
    '^@data/(.*)$': '<rootDir>/src/data/$1',
    '^@infrastructure/(.*)$': '<rootDir>/src/infrastructure/$1',
    '^@presentation/(.*)$': '<rootDir>/src/presentation/$1',
    '^@baby-monitor/shared-types$': '<rootDir>/../../packages/shared-types/src/index',
    '^@baby-monitor/design-tokens$': '<rootDir>/../../packages/design-tokens/src/index',
    '^@baby-monitor/webrtc-config$': '<rootDir>/../../packages/webrtc-config/src/index',
  },
  clearMocks: true,
  collectCoverageFrom: ['src/domain/**/*.ts', 'src/presentation/stores/**/*.ts'],
};
