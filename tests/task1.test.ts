/*
TASK 1: REST API Testing - Binance Order Book BTC/USDT

Goal:
Write an automated test that:
Fetches the order book for BTC/USDT using Binance’s REST API.
Validates the presence of essential fields: bids, asks, prices, quantities.
Ensures the highest bid price < lowest ask price (basic market rule).
Measures and logs the API response time.

Fails the test if:
Response time exceeds 1 second (adjustable)
Essential fields are missing
Bid/Ask logic is invalid

API Endpoint:
GET https://api.binance.com/api/v3/depth?symbol=BTCUSDT&limit=5

*/


// Import Playwright test utilities and axios for HTTP requests
import { test, expect } from '@playwright/test';
import axios from 'axios';
// Import custom validators for order book structure and bid/ask logic
import { orderBookFieldValidator, bidAskValidator } from '../utils/orderBookValidations';
import '../tests/hooks';


// Binance REST API endpoint for BTC/USDT order book
const BINANCE_DEPTH_URL = 'https://api.binance.com/api/v3/depth?symbol=BTCUSDT&limit=5';

// Maximum allowed response time in milliseconds
const MAX_RESPONSE_TIME_MS = 1000;

test('Task 1 - REST API Testing: Binance Order Book BTC/USDT', async () => {
  
  // Start timer to measure API response time
  const currentTime = Date.now();
  

  // Log the request URL
  console.log(`Requesting: ${BINANCE_DEPTH_URL}`);

  // Fetch the order book for BTC/USDT using Binance’s REST API
  const response = await axios.get(BINANCE_DEPTH_URL);
  const duration = Date.now() - currentTime;

  // Log the full response data (truncated for readability)
  console.log('Response data:', JSON.stringify(response.data, null, 2).slice(0, 500) + '...');

  // Log the API response time
  console.log(`API Response Time: ${duration}ms`);

  // Fail the test if response time exceeds 1 second
  expect(duration).toBeLessThan(MAX_RESPONSE_TIME_MS);

  // Parse the response data
  const data = response.data as { bids: any[]; asks: any[] };

  // Validate the presence of essential fields: bids and asks
  expect(data).toHaveProperty('bids');
  expect(data).toHaveProperty('asks');


  // Print the top bid and ask values retrieved
  /*The top bids and top asks are selected correctly according to the Binance order book API response format:
    data.bids is an array of bid orders, each entry like [price, quantity], sorted from highest to lowest price.
    data.asks is an array of ask orders, each entry like [price, quantity], sorted from lowest to highest price.*/
  if (Array.isArray(data.bids) && data.bids.length > 0 && Array.isArray(data.asks) && data.asks.length > 0) {
    // Print all bids and asks
    console.log('All bids:', JSON.stringify(data.bids));
    console.log('Top bid:', data.bids[0]);

    console.log('All asks:', JSON.stringify(data.asks));
    console.log('Top ask:', data.asks[0]);

  } else {
    console.log('No bids or asks found in response.');
  }

  // Validate bids/asks structure, prices, and quantities
  expect(orderBookFieldValidator(data)).toBe(true);

  // Ensure the highest bid price < lowest ask price
  expect(bidAskValidator(data)).toBe(true);
});