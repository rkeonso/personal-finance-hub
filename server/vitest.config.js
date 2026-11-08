// server/vitest.config.js
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage',
      include: ['src/**/*.js'],
      exclude: [
        // Test files & dependencies
        'src/__tests__/**',
        'node_modules/**',

        // Entrypoints & server listeners (hard to exercise without running process)
        'src/server.js',
        'src/index.js',

        // Database clients & adapters (environment-dependent connection bootstrapping)
        'src/prismaClient.js',
        'src/lib/prisma.js',

        // Static config files or environment loaders
        'src/config/**',
      ],
    },
  },
});