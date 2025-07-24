
// utils/fetchRestSnapshot.ts
// Utility function to fetch the Binance order book snapshot from REST API

// Import axios for HTTP requests
import axios from 'axios';


// Type definition for the order book snapshot returned by Binance REST API
export interface OrderBookSnapshot {
  lastUpdateId: number; // The last update ID in the snapshot
  bids: [string, string][]; // Array of [price, quantity] for bids
  asks: [string, string][]; // Array of [price, quantity] for asks
}


/**
 * Fetches the order book snapshot from the given REST URL.
 *
 * @param restUrl - Binance REST endpoint for order book snapshot (e.g., https://api.binance.com/api/v3/depth?symbol=BTCUSDT&limit=1000)
 * @returns Promise resolving to the snapshot object containing lastUpdateId, bids, and asks
 *
 * This function performs an HTTP GET request to the Binance REST endpoint,
 * parses the response, and returns the snapshot in a typed format.
 */
export async function fetchRestSnapshot(restUrl: string): Promise<OrderBookSnapshot> {
  // Make HTTP GET request to the REST endpoint
  const response = await axios.get(restUrl);
  // Return the response data as a typed OrderBookSnapshot object
  return response.data as OrderBookSnapshot;
}
