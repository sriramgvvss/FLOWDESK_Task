

// orderBookFieldValidator:
// Validates the structure and types of bids and asks arrays in the order book response.
// Ensures both bids and asks are non-empty arrays of [price, quantity] pairs, and all values are numeric.
export function orderBookFieldValidator(data: { bids: any[]; asks: any[] }): boolean {
  // Log the first bid and ask for every evaluation for debugging
  if (Array.isArray(data.bids) && data.bids.length > 0) {
    console.log('orderBookFieldValidator - Top bid:', data.bids[0]);
  } else {
    console.log('orderBookFieldValidator - No bids found');
  }
  if (Array.isArray(data.asks) && data.asks.length > 0) {
    console.log('orderBookFieldValidator - Top ask:', data.asks[0]);
  } else {
    console.log('orderBookFieldValidator - No asks found');
  }
  // Check that bids and asks are arrays, non-empty, and every entry is a [price, quantity] tuple of numbers
  return Array.isArray(data.bids) &&
         Array.isArray(data.asks) &&
         data.bids.length > 0 &&
         data.asks.length > 0 &&
         data.bids.every(b => b.length === 2 && !isNaN(+b[0]) && !isNaN(+b[1])) &&
         data.asks.every(a => a.length === 2 && !isNaN(+a[0]) && !isNaN(+a[1]));
}
  


// bidAskValidator:
// Validates that the highest bid is less than the lowest ask (market rule).
// This ensures there is no crossed book, which would indicate a data anomaly.
export function bidAskValidator(data: { bids: any[]; asks: any[] }): boolean {
  // Parse the top-of-book prices
  const highestBid = parseFloat(data.bids[0][0]);
  const lowestAsk = parseFloat(data.asks[0][0]);
  // Log the bid/ask values on every evaluation for traceability
  console.log(`bidAskValidator - Evaluating highestBid: ${highestBid}, lowestAsk: ${lowestAsk}`);
  // Return true if the market is not crossed
  return highestBid < lowestAsk;
}
  


// sortValidator:
// Validates that the entries (bids or asks) are sorted in the specified order (ascending or descending).
// Used to ensure bids are sorted descending and asks ascending, as required by order book rules.
export function sortValidator(entries: any[], order: 'asc' | 'desc'): boolean {
  // Extract price values from entries
  const prices = entries.map(e => parseFloat(e[0]));
  // Log the order and price sequence being validated for debugging
  console.log(`sortValidator - Checking sort order: ${order}, prices:`, prices);
  for (let i = 1; i < prices.length; i++) {
    if (order === 'asc' && prices[i] < prices[i - 1]) {
      console.log(`sortValidator - Sort violation at index ${i}: ${prices[i]} < ${prices[i - 1]}`);
      return false;
    }
    if (order === 'desc' && prices[i] > prices[i - 1]) {
      console.log(`sortValidator - Sort violation at index ${i}: ${prices[i]} > ${prices[i - 1]}`);
      return false;
    }
  }
  // If no violations found, the entries are sorted as required
  return true;
}