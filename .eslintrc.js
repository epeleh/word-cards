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
    parser: 'babel-eslint',
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'default-case': 'off',
    'no-unused-vars': 'warn',
    'vue/no-unused-components': 'warn',
    'object-curly-spacing': 'warn',
    'arrow-body-style': 'warn',
    'no-multi-spaces': 'warn',
    'space-in-parens': 'warn',
    'no-unreachable': 'warn',
    'padded-blocks': 'warn',
    'comma-dangle': 'warn',
    'arrow-parens': 'warn',
    'no-shadow': 'warn',
    indent: 'warn',
    semi: 'warn',
  },
};
