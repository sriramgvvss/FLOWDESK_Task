
// playwright.config.ts
// Playwright configuration for FlowDesk Binance Order Book Test Suite
//
// Key features:
// - Runs all tests in Chromium only (no Firefox/WebKit)
// - Serial execution (no parallelism, for reliability)
// - HTML reporting, debug artifacts (screenshots, traces, video) on failure

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  // Directory containing all test files
  testDir: './tests',

  // Maximum time one test can run (in milliseconds)
  timeout: 60 * 1000, // 60 seconds per test

  // Maximum time for expect() assertions
  expect: {
    timeout: 5000, // 5 seconds for expect conditions
  },

  // Reporter configuration
  // Use HTML reporter, do not auto-open after run
  reporter: [['html', { open: 'never' }]],

  // Default context and browser options for all tests
  use: {
    headless: true, // Run browsers in headless mode (no UI)
    screenshot: 'only-on-failure', // Save screenshot if a test fails
    trace: 'retain-on-failure',    // Save Playwright trace on failure
    video: 'retain-on-failure',    // Save video recording on failure
    viewport: { width: 1280, height: 800 }, // Default browser window size
    actionTimeout: 0, // No timeout for individual actions (use test/expect timeouts)
    baseURL: '',      // No base URL set (can be overridden per test)
  },

  // Project configuration
  // Only run tests in Chromium (Desktop Chrome profile)
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    }
  ],

  // Directory for output files (screenshots, traces, videos)
  outputDir: 'test-results/',

  // Run tests one after the other (serially, no parallelism)
  workers: 1,
});
