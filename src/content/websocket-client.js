// WebSocket client wrapper

window.WebSocketClient = class WebSocketClient {
  constructor(url) {
    this.url = url;
    this.ws = null;
    this.handlers = {};
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 2000;
    this.isConnected = false;
  }

  connect() {
    console.log('Connecting to WebSocket server...');

    this.ws = new WebSocket(this.url);

    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      if (this.handlers['open']) {
        this.handlers['open']();
      }
    };

    this.ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        const handler = this.handlers[message.type];
        if (handler) {
          handler(message.payload);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    this.ws.onclose = () => {
      console.log('WebSocket disconnected');
      this.isConnected = false;

      if (this.handlers['close']) {
        this.handlers['close']();
      }

      // Attempt reconnection
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        console.log(`Reconnecting... (Attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        setTimeout(() => this.connect(), this.reconnectDelay);
      } else {
        console.error('Max reconnection attempts reached');
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      if (this.handlers['error']) {
        this.handlers['error'](error);
      }
    };
  }

  send(type, payload) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, payload }));
    } else {
      console.warn('WebSocket not connected, cannot send message:', type);
    }
  }

  on(messageType, handler) {
    this.handlers[messageType] = handler;
  }

  disconnect() {
    if (this.ws) {
      this.maxReconnectAttempts = 0; // Prevent reconnection
      this.ws.close();
    }
  }
}
