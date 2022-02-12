module.exports = {
  preset: '@vue/cli-plugin-unit-jest',
  transform: {
    '^.+\\.vue$': 'vue-jest',
  },
  testMatch: [
    '**/__tests__/*.[jt]s?(x)',
    '**/tests/**/*.spec.[jt]s?(x)',
  ],
};
