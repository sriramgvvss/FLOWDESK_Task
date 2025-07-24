/*
Goal:
Automate UI testing on the Binance BTC/USDT trading page.
Page URL:
https://www.binance.com/en/trade/BTC_USDT
Steps:
Navigate to the page and wait for it to fully load
Validate the visibility of:
Order book (buy/sell sides)
Buy/sell buttons
Price chart
Extract the top bid and ask prices from the order book on the UI
Compare them against those from the REST API (Task 1)
Ensure:
Order book is correctly sorted on the UI
Bid/ask prices match the REST API within a reasonable margin

Fail if:
Key elements are not rendered
UI order book is misaligned with API
Sorting of price levels is incorrect
 */

// Import Playwright test utilities
import { test, expect } from '@playwright/test';

// Import axios for REST API calls
import axios from 'axios';
import '../tests/hooks';


// URL for the Binance BTC/USDT trading page
const BINANCE_URL = 'https://www.binance.com/en/trade/BTC_USDT';

// REST API endpoint for the BTC/USDT order book (top 5 levels)
const BINANCE_DEPTH_URL = 'https://api.binance.com/api/v3/depth?symbol=BTCUSDT&limit=5';

test('Task 3 - UI Testing: Binance BTC/USDT Page', async ({ page }) => {
  // --- Step 1: Navigate to the Binance BTC/USDT trading page and wait for full load ---
  await page.goto(BINANCE_URL);
  // Wait for the page to fully load and order book to be visible
  await page.waitForLoadState('domcontentloaded');
  await page.waitForSelector('.order-book', { state: 'visible', timeout: 15000 });

  // --- Step 2: Validate the visibility of key UI elements ---
  // Locate the order book title
  const orderBookTitle = page.getByText('Order Book', { exact: true }).first();
  // Locate the buy and sell buttons (Log In button inside buy/sell forms)
  const buyBtn = page.locator('#autoFormBUY').getByRole('button', { name: 'Log In' });
  const sellBtn = page.locator('#autoFormSELL').getByRole('button', { name: 'Log In' });
  // Locate the price chart (canvas element)
  const priceChart = page.locator('canvas').nth(4);
  // Locate the order book container (not strictly required, but available)
  const orderBook = page.locator('.order-book');

  // Assert that all key UI elements are visible
  await expect(orderBookTitle).toBeVisible();
  await expect(buyBtn).toBeVisible();
  await expect(sellBtn).toBeVisible();
  await expect(priceChart).toBeVisible();


  // --- Step 3: Extract the top bid and ask prices from the order book on the UI ---
  // Use specific selectors to get the top bid and ask prices from the DOM
  const topBidUI = await page.locator('#spotOrderbook > div.orderbook-flex > div:nth-child(2) > div.orderbook-list > div > div > div > div').first().innerText();
  const topAskUI = await page.locator('#spotOrderbook > div.orderbook-flex > div:nth-child(1) > div.orderbook-list > div > div > div > div').first().innerText();

  // --- Step 3b: Extract all visible bid and ask prices from the UI for sorting validation ---
  // Get all bid prices (right side, descending)
  const bidPriceElements = await page.locator('#spotOrderbook > div.orderbook-flex > div:nth-child(2) > div.orderbook-list > div > div > div > div').allInnerTexts();
  // Get all ask prices (left side, ascending)
  const askPriceElements = await page.locator('#spotOrderbook > div.orderbook-flex > div:nth-child(1) > div.orderbook-list > div > div > div > div').allInnerTexts();

  // Parse prices as floats, filter out any non-numeric values
  const bidPrices = bidPriceElements.map(txt => parseFloat(txt)).filter(n => !isNaN(n));
  const askPrices = askPriceElements.map(txt => parseFloat(txt)).filter(n => !isNaN(n));

  // --- Step 3c: Validate order book sorting on the UI ---
  // Bids should be sorted descending (highest to lowest)
  const bidsSorted = bidPrices.every((val, i, arr) => i === 0 || arr[i - 1] >= val);
  // Asks should be sorted ascending (lowest to highest)
  const asksSorted = askPrices.every((val, i, arr) => i === 0 || arr[i - 1] <= val);

  // Assert that the order book is correctly sorted
  expect(bidsSorted).toBe(true);
  expect(asksSorted).toBe(true);


  // --- Step 4: Fetch the top bid and ask prices from the Binance REST API ---
  // Call the Binance REST API to get the latest order book data
  const response = await axios.get(BINANCE_DEPTH_URL);
  const data = response.data as { bids: string[][]; asks: string[][] };
  const topBidAPI = parseFloat(data.bids[0][0]);
  const topAskAPI = parseFloat(data.asks[0][0]);

  // --- Step 5: Compare the UI and API values, allowing a reasonable margin for real-time drift ---
  // Calculate the absolute difference between UI and API prices
  const bidDiff = Math.abs(parseFloat(topBidUI) - topBidAPI);
  const askDiff = Math.abs(parseFloat(topAskUI) - topAskAPI);

  // Assert that the differences are within an acceptable margin (due to real-time updates)
  expect(bidDiff).toBeLessThan(10);
  expect(askDiff).toBeLessThan(10);
});
