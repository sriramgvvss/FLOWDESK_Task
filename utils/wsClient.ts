
// utils/wsClient.ts
// Simple WebSocket client utility for Binance depth stream (or similar)
// Exposes a class that emits messages to a callback handler


// Import ws package for WebSocket support
import WebSocket from 'ws';


// Type for the message handler callback
export type WSMessageHandler = (data: any) => void;


// WSClient: A simple wrapper for WebSocket connections that emits parsed messages to a callback
export class WSClient {
  private ws: WebSocket; // Underlying WebSocket instance
  private url: string;   // WebSocket endpoint URL
  private isOpen: boolean = false; // Connection state

  /**
   * Constructs a new WSClient for the given URL and creates the WebSocket connection.
   * @param url - The WebSocket endpoint to connect to
   */
  constructor(url: string) {
    this.url = url;
    this.ws = new WebSocket(url);
  }

  /**
   * Connects the WebSocket and sets up event handlers for message, open, and error events.
   * @param onMessage - Callback for each parsed message received
   * @param onOpen - Optional callback for when the connection is established
   * @param onError - Optional callback for errors or JSON parse failures
   */
  connect(onMessage: WSMessageHandler, onOpen?: () => void, onError?: (err: Error) => void) {
    // Handle connection open event
    this.ws.on('open', () => {
      this.isOpen = true;
      if (onOpen) onOpen();
    });
    // Handle incoming messages: parse as JSON and pass to callback
    this.ws.on('message', (data) => {
      try {
        const json = JSON.parse(data.toString());
        onMessage(json);
      } catch (err) {
        if (onError) onError(err as Error);
      }
    });
    // Handle connection errors
    this.ws.on('error', (err) => {
      if (onError) onError(err);
    });
  }

  /**
   * Closes the WebSocket connection if open.
   */
  close() {
    if (this.isOpen) {
      this.ws.close();
      this.isOpen = false;
    }
  }
}
