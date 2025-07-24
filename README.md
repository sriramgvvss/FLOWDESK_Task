# FlowDesk Take Home Task

## Project Structure

- `tests/` - Contains all Playwright test scripts and hooks:
  - `task1.test.ts` - REST API order book validation
  - `task2.test.ts` - WebSocket order book sync and validation
  - `task3.test.ts` - UI order book validation and API comparison
  - `hooks.ts` - Global Playwright hooks (e.g., afterEach wait for stability)
- `utils/` - Utility modules for test logic:
  - `orderBookValidations.ts` - Order book field, sort, and bid/ask validators
  - `localOrderBook.ts` - Local order book sync logic
  - `wsClient.ts` - WebSocket client utility
  - `fetchRestSnapshot.ts` - REST snapshot fetch utility
- `playwright.config.ts` - Playwright configuration (Chromium only, serial execution, debug artifacts enabled)
- `playwright-report/` - HTML test report output (generated after test run)
- `test-results/` - Debug artifacts (screenshots, traces, videos)
- `package.json` - Project dependencies and scripts

## Packages Used

- `@playwright/test` - End-to-end browser automation and test runner
- `axios` - HTTP client for REST API calls
- `ws` - WebSocket client for Node.js (used in API tests)
- `typescript` - TypeScript support
- `@types/axios`, `@types/ws` - TypeScript type definitions
- `allure-playwright` (optional) - Allure reporting integration (if enabled)

## How to Run the Tests

1. **Install dependencies:**
   ```sh
   npm install
   ```

2. **Run all tests (Chromium only, serial):**
   ```sh
   npm test
   ```
   or
   ```sh
   npx playwright test
   ```
   This will execute all test scripts in the `tests/` folder. Debug artifacts (screenshots, traces, video) will be saved in `test-results/`.

## How to View the HTML Test Report

After running the tests, open the HTML report:

```sh
npx playwright show-report
```

Or open the file directly in your browser:
- `playwright-report/index.html`

## How to View the Allure Report (if enabled)

If you have Allure reporting set up, generate and open the report with:
```sh
npm run report
```
This will generate and open the Allure report from `./allure-results`.

## Notes

- Tests run serially (one after another) for reliability.
- Only Chromium (Desktop Chrome) is used for UI tests.
- A 2-second wait is added after each test for stability/debugging (see `tests/hooks.ts`).
- The UI selectors in `task3.test.ts` may need adjustment if Binance updates their DOM structure.
- For Allure reporting, install and configure `allure-playwright` and update your test scripts as needed.
