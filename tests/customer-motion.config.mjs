import { defineConfig } from 'vitest/config';

export default defineConfig({
  esbuild: { jsx: 'automatic' },
  test: { environment: 'jsdom', include: ['tests/customer-motion.test.tsx', 'tests/header-navigation.test.tsx'] },
});
