/*
Task 2: WebSocket Testing - Binance Depth Stream

Goal:
Connect to Binance’s WebSocket stream and validate real-time updates:
Stream: wss://stream.binance.com:9443/ws/btcusdt@depth
Listen for a short duration (e.g., 30 seconds).
F
or each update:
Ensure the presence of valid bids and asks
Validate prices are sorted (highest bid descending, lowest ask ascending)
Detect and log anomalies (e.g., out-of-order updates, missing data, pricegaps)
Optionally: Build a local in-memory order book and validate sequenceintegrity

Fail if:
Updates are missing required fields
prices are not sorted correctly
Anomalies are detected dudring the stream
*/

// Import local order book logic and types
import { LocalOrderBook, DepthUpdateEvent } from '../utils/localOrderBook';

// Import Playwright test utilities
import { test, expect } from '@playwright/test';

// Import REST snapshot fetcher utility
import { fetchRestSnapshot } from '../utils/fetchRestSnapshot';

// Import WebSocket client utility
import { WSClient } from '../utils/wsClient';

// Import hooks file to apply afterEach wait
import '../tests/hooks';

test('Task 2 - WebSocket Testing: Binance Depth Stream', async () => {

  // --- Step 1: Define constants and state ---
  // Symbol to test
  const SYMBOL = 'BTCUSDT';

  // Binance WebSocket endpoint for depth updates
  const WS_URL = `wss://stream.binance.com:9443/ws/${SYMBOL.toLowerCase()}@depth`;

  // Binance REST endpoint for order book snapshot
  const REST_URL = `https://api.binance.com/api/v3/depth?symbol=${SYMBOL}&limit=1000`;

  // Array to collect error messages for later assertion
  const errors: string[] = [];

  // Counter for number of WebSocket messages received
  let messageCount = 0;

  // Buffer to store events received before the snapshot is loaded
  const eventBuffer: DepthUpdateEvent[] = [];

  // Flag to indicate if snapshot has been received and processed
  let snapshotReceived = false;

  // Local order book utility instance
  const localOrderBook = new LocalOrderBook();

  // --- Step 2: Open WebSocket using WSClient and buffer events until snapshot is loaded ---
  console.log('Connecting to Binance WebSocket:', WS_URL);
  const wsClient = new WSClient(WS_URL);

  // Connect and set up message, open, and error handlers
  wsClient.connect(
    (json) => {
      messageCount++;
      // Buffer events until snapshot is loaded
      if (!snapshotReceived) {
        eventBuffer.push(json);
        // Log the first event's update IDs for debugging
        if (eventBuffer.length === 1) {
          console.log('First event U:', json.U, 'u:', json.u);
        }
        return;
      }
      // If snapshot is loaded, apply the event to the local order book
      applyEvent(json);
    },
    () => {
      console.log('WebSocket connection established. Buffering events until snapshot is loaded...');
    },
    (err) => {
      console.error('WebSocket error:', err);
      errors.push('WebSocket error: ' + err.message);
    }
  );

  // --- Step 3: Fetch REST snapshot and sync local order book ---
  // This function fetches the current order book snapshot from Binance REST API,
  // ensures it is in sync with the buffered WebSocket events, and initializes the local order book.
  async function fetchAndSyncSnapshot() {
    let snapshot;
    while (true) {
      // Fetch the snapshot from REST endpoint
      console.log('Fetching REST snapshot:', REST_URL);
      snapshot = await fetchRestSnapshot(REST_URL);

      // If the snapshot's lastUpdateId is less than the first buffered event's U,
      // re-fetch the snapshot to ensure we can sync correctly (per Binance docs)
      if (eventBuffer.length > 0 && eventBuffer[0].U && snapshot.lastUpdateId < eventBuffer[0].U) {
        console.warn('Snapshot lastUpdateId < first event U, re-fetching snapshot...');
        continue;
      }
      break;
    }
    // Set local order book state to the snapshot
    localOrderBook.setFromSnapshot(snapshot);
    console.log('Snapshot loaded. lastUpdateId:', localOrderBook.lastUpdateId);
    snapshotReceived = true;

    // Discard buffered events whose u <= lastUpdateId (already reflected in snapshot)
    let i = 0;
    while (i < eventBuffer.length && localOrderBook.lastUpdateId !== null && eventBuffer[i].u <= localOrderBook.lastUpdateId) i++;
    
    // Apply all remaining buffered events in order
    for (; i < eventBuffer.length; i++) {
      applyEvent(eventBuffer[i]);
    }
    // Clear the buffer
    eventBuffer.length = 0;
  }

  // --- Step 4: Apply update procedure for each event ---
  // This function applies a depth update event to the local order book,
  // checks for sequence integrity, and logs the top of book after each update.
  function applyEvent(json: DepthUpdateEvent) {
    // Log the full update before processing for traceability
    console.log('Applying update:', JSON.stringify(json));
    localOrderBook.applyEvent(json, errors);
    // Log the current top-of-book (best bid/ask) for monitoring
    const topBid = localOrderBook.getTopBid();
    const topAsk = localOrderBook.getTopAsk();
    if (topBid) {
      console.log('Local top bid:', JSON.stringify(topBid));
    } else {
      console.warn('Local order book has no bids.');
    }
    if (topAsk) {
      console.log('Local top ask:', JSON.stringify(topAsk));
    } else {
      console.warn('Local order book has no asks.');
    }
  }

  // --- Step 5: Start the sync process ---
  // Fetch the snapshot and apply buffered events
  await fetchAndSyncSnapshot();

  // --- Step 6: Listen for 30 seconds, then close the connection and summarize ---
  // Wait for 30 seconds to receive and process real-time updates
  await new Promise((resolve) => setTimeout(resolve, 30000));
  // Close the WebSocket connection
  wsClient.close();

  // --- Step 7: Log summary and assert test result ---
  // Print the number of updates received
  console.log(`\nSummary: Received ${messageCount} updates in 30 seconds.`);
  // If any errors were detected, log them; otherwise, confirm success
  if (errors.length) {
    console.error('Errors Found:\n', errors.join('\n'));
  } else {
    console.log('No anomalies or errors detected during the stream.');
  }

  // Fail the test if any errors were detected
  expect(errors.length).toBe(0);
});