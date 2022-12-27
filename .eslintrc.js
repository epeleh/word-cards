module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: [
    'plugin:vue/vue3-essential',
    '@vue/airbnb',
  ],
  parserOptions: {
    parser: '@babel/eslint-parser',
  },
  globals: {
    defineProps: 'readonly',
    defineEmits: 'readonly',
    defineExpose: 'readonly',
    withDefaults: 'readonly',
  },
  overrides: [
    {
      files: [
        '**/__tests__/*.[jt]s?(x)',
        '**/tests/**/*.spec.[jt]s?(x)',
      ],
      env: {
        jest: true,
      },
    },
  ],
  rules: {
    'max-len': ['warn', { code: 100 }],
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'vuejs-accessibility/mouse-events-have-key-events': 'off',
    'vuejs-accessibility/click-events-have-key-events': 'off',
    'vuejs-accessibility/form-control-has-label': 'off',
    'vue/multi-word-component-names': 'off',
    'function-call-argument-newline': 'off',
    'function-paren-newline': 'off',
    'no-param-reassign': 'off',
    'no-unused-vars': 'off',
    'default-case': 'off',
    'vue/no-unused-components': 'warn',
    'no-multiple-empty-lines': 'warn',
    'object-curly-spacing': 'warn',
    'arrow-body-style': 'warn',
    'no-multi-spaces': 'warn',
    'space-in-parens': 'warn',
    'prefer-template': 'warn',
    'no-unreachable': 'warn',
    'padded-blocks': 'warn',
    'comma-dangle': 'warn',
    'arrow-parens': 'warn',
    'no-shadow': 'warn',
    indent: 'warn',
    quotes: 'warn',
    semi: 'warn',
  },
};
