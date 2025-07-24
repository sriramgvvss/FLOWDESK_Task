
// utils/localOrderBook.ts
// LocalOrderBook: Utility class for maintaining and updating a local in-memory order book
// according to Binance's official depth stream synchronization procedure.


// Type alias for one side of the order book (bids or asks): price (string) -> quantity (string)
export type OrderBookSide = Map<string, string>;


// Type for a depth update event from Binance WebSocket
export interface DepthUpdateEvent {
  U: number; // First update ID in event
  u: number; // Final update ID in event
  bids: [string, string][]; // Array of [price, quantity] for bids
  asks: [string, string][]; // Array of [price, quantity] for asks
}


// LocalOrderBook: Maintains a local copy of the order book and applies updates per Binance's official sync procedure
export class LocalOrderBook {
  public bids: OrderBookSide; // Local bids map
  public asks: OrderBookSide; // Local asks map
  public lastUpdateId: number | null; // Last update ID applied

  /**
   * Constructs an empty local order book.
   */
  constructor() {
    this.bids = new Map();
    this.asks = new Map();
    this.lastUpdateId = null;
  }

  /**
   * Initializes the order book from a REST snapshot.
   * Clears any previous state and sets bids/asks and lastUpdateId.
   * @param snapshot - The snapshot object from REST API
   */
  setFromSnapshot(snapshot: { lastUpdateId: number; bids: [string, string][]; asks: [string, string][] }) {
    this.bids.clear();
    this.asks.clear();
    for (const [price, qty] of snapshot.bids) {
      this.bids.set(price, qty);
    }
    for (const [price, qty] of snapshot.asks) {
      this.asks.set(price, qty);
    }
    this.lastUpdateId = snapshot.lastUpdateId;
  }


  /**
   * Applies a depth update event to the local order book.
   * Handles out-of-sequence and outdated events per Binance's sync rules.
   * @param event - The depth update event from WebSocket
   * @param errors - Optional array to collect error messages
   */
  applyEvent(event: DepthUpdateEvent, errors?: string[]): void {
    const { U, u, bids, asks } = event;
    // Ignore event if u < lastUpdateId (already processed)
    if (typeof u === 'number' && this.lastUpdateId !== null) {
      if (u < this.lastUpdateId) {
        // Outdated event, ignore
        return;
      }
      // If event is not contiguous, log error and optionally trigger resync
      if (U > this.lastUpdateId + 1) {
        if (errors) {
          errors.push(`Event U=${U} > lastUpdateId+1=${this.lastUpdateId + 1}, out of sequence. Restarting sync.`);
        }
        return;
      }
    }
    // Apply bid updates: set or delete price levels as per event
    if (Array.isArray(bids)) {
      for (const [price, qty] of bids) {
        if (parseFloat(qty) === 0) {
          this.bids.delete(price);
        } else {
          this.bids.set(price, qty);
        }
      }
    }
    // Apply ask updates: set or delete price levels as per event
    if (Array.isArray(asks)) {
      for (const [price, qty] of asks) {
        if (parseFloat(qty) === 0) {
          this.asks.delete(price);
        } else {
          this.asks.set(price, qty);
        }
      }
    }
    // Update the last applied update ID
    if (typeof u === 'number') {
      this.lastUpdateId = u;
    }
  }

  /**
   * Returns the best (highest) bid as a [price, quantity] tuple, or null if no bids.
   * Used for logging and validation.
   */
  getTopBid(): [number, number] | null {
    const sorted = Array.from(this.bids.entries())
      .map(([p, q]) => [parseFloat(p), parseFloat(q)] as [number, number])
      .sort((a, b) => b[0] - a[0]);
    return sorted.length > 0 && sorted[0].length === 2 ? [sorted[0][0], sorted[0][1]] : null;
  }

  /**
   * Returns the best (lowest) ask as a [price, quantity] tuple, or null if no asks.
   * Used for logging and validation.
   */
  getTopAsk(): [number, number] | null {
    const sorted = Array.from(this.asks.entries())
      .map(([p, q]) => [parseFloat(p), parseFloat(q)] as [number, number])
      .sort((a, b) => a[0] - b[0]);
    return sorted.length > 0 && sorted[0].length === 2 ? [sorted[0][0], sorted[0][1]] : null;
  }
}
