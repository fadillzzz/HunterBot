module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  globals: {
    'ts-jest': {
      diagnostics: false
    }
  },
  roots: ["<rootDir>/src/", "<rootDir>/tests/"],
  moduleDirectories: ["node_modules", "src"]
};
