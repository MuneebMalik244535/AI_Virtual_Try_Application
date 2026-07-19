import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/setupTests.ts',
    include: ['tests/**/*.test.*', 'tests/**/*.spec.*', 'tests/**/*.int.*']
  }
})
