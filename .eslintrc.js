module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    useJSXTextNode: true,
    project: './tsconfig.json',
    tsconfigRootDir: '.',
  },
  plugins: [
    '@typescript-eslint',
    'react',
    'react-hooks',
    'prettier',
    'react-native',
  ],
  rules: {
    'prettier/prettier': [
      'error',
      {
        'no-inline-styles': true,
      },
    ],
    'react/jsx-filename-extension': [1, {extensions: ['.js', '.jsx', '.tsx']}],
    '@typescript-eslint/no-use-before-define': 'off',
    'react/prop-types': 'off',
    'no-restricted-syntax': 'off',
    'class-methods-use-this': 'off',
    'no-return-assign': 'off',
    'consistent-return': 'off',
    'no-nested-ternary': 'error',
    '@typescript-eslint/lines-between-class-members': 'off',
    'react/jsx-props-no-spreading': 'off',
    'react/function-component-definition': 'off',
    'import/extensions': 'off',
    'react-native/no-inline-styles': 1,
    'react/jsx-uses-react': 1,
    '@typescript-eslint/array-type': [2, {default: 'array-simple'}],
    '@typescript-eslint/member-ordering': [
      2,
      {
        default: {
          memberTypes: ['field', 'constructor', 'get', 'set', 'method'],
        },
      },
    ],
  },
  ignorePatterns: ['*.js'],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'airbnb',
    'airbnb-typescript',
    'plugin:prettier/recommended',
  ],
  root: true,
};
