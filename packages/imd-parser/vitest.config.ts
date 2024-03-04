import { configDefaults, defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [
    tsconfigPaths(),
  ],
  test: {
    globals: true,
    reporters: ['default', 'html'],
    typecheck: {
      tsconfig: 'tsconfig.vitest.json',
    },
    outputFile: {
      html: 'vitest-output/html/index.html',
    },
    coverage: {
      enabled: false,
      exclude: [
        ...configDefaults.coverage.exclude || [],
        'vitest-output/**',
      ],
      reportsDirectory: 'vitest-output/html/coverage',
    },
  },
})
