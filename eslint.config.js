import antfu from '@antfu/eslint-config'

export default antfu({
  ignores: [
    '**/dist',
    '**/node_modules',
    '**/vitest-output',
  ],
  javascript: {
    overrides: {
      'prefer-promise-reject-errors': 'off',
    },
  },
  typescript: {
    tsconfigPath: 'tsconfig.eslint.json',
    overrides: {
      'ts/no-unsafe-argument': 'off',
      'ts/no-unsafe-return': 'off',
      'ts/no-unsafe-assignment': 'off',
      'ts/no-unsafe-call': 'off',
      'ts/no-unsafe-member-access': 'off',
      'ts/no-floating-promises': 'off',
      'ts/no-throw-literal': 'off',
    },
  },
  rules: {
    'style/operator-linebreak': ['error', 'after'],
  },
})
