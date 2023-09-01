module.exports = {
  // ...
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
    include: ['**/*.ts'],
  },
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  rules: {
    'space-before-function-paren': ['error', 'always'],
    '@typescript-eslint/no-explicit-any': 'off',
    'space-before-function-paren': 'off',
    "@typescript-eslint/no-var-requires": "off"
  },

  // ...
}
