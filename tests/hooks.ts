// tests/hooks.ts
// Global Playwright hooks for all tests
// Adds a wait after each test for stability/debugging

import { test } from '@playwright/test';

test.afterEach(async () => {
  // Wait 2 seconds after each test
  await new Promise(res => setTimeout(res, 2000));
});
