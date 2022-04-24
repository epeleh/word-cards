module.exports = {
  preset: '@vue/cli-plugin-unit-jest/presets/no-babel',
  transform: {
    '^.+\\.js$': 'babel-jest',
    '^.+\\.vue$': '@vue/vue3-jest',
  },
  testMatch: [
    '**/__tests__/*.[jt]s?(x)',
    '**/tests/**/*.spec.[jt]s?(x)',
  ],
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.vue',
  ],
  verbose: true,
};
