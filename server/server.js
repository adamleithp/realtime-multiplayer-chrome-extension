// WebSocket server entry point

import { WebSocketServer } from 'ws';
import { ChannelManager } from './channel-manager.js';
import { MessageHandler } from './message-handler.js';

const PORT = process.env.PORT || 8080;

const wss = new WebSocketServer({ port: PORT });
const channelManager = new ChannelManager();
const messageHandler = new MessageHandler(channelManager);

wss.on('connection', (ws) => {
  console.log('Client connected');

  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data);
      messageHandler.handle(ws, message);
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  });

  ws.on('close', () => {
    channelManager.removePlayer(ws);
    console.log('Client disconnected');
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

const isProduction = process.env.NODE_ENV === 'production';
const host = isProduction ? '0.0.0.0' : 'localhost';
console.log(`WebSocket server running on ws://${host}:${PORT}`);
if (isProduction) {
  console.log('Production mode - ready to accept connections');
}
