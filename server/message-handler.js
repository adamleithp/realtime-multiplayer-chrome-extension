// WebSocket message routing and handling

import { v4 as uuidv4 } from 'uuid';

const MessageTypes = {
  JOIN_CHANNEL: 'join_channel',
  LEAVE_CHANNEL: 'leave_channel',
  PLAYER_MOVE: 'player_move',
  SEND_CHAT: 'send_chat',
  SEND_EMOJI: 'send_emoji',
  CHANNEL_JOINED: 'channel_joined',
  PLAYER_LIST: 'player_list',
  PLAYER_UPDATE: 'player_update',
  CHAT_MESSAGE: 'chat_message',
  EMOJI_REACTION: 'emoji_reaction',
  ERROR: 'error',
};

export class MessageHandler {
  constructor(channelManager) {
    this.channelManager = channelManager;
  }

  handle(ws, message) {
    const { type, payload } = message;

    switch (type) {
      case MessageTypes.JOIN_CHANNEL:
        this.handleJoinChannel(ws, payload);
        break;
      case MessageTypes.LEAVE_CHANNEL:
        this.handleLeaveChannel(ws);
        break;
      case MessageTypes.PLAYER_MOVE:
        this.handlePlayerMove(ws, payload);
        break;
      case MessageTypes.SEND_CHAT:
        this.handleChat(ws, payload);
        break;
      case MessageTypes.SEND_EMOJI:
        this.handleEmoji(ws, payload);
        break;
      default:
        console.warn('Unknown message type:', type);
    }
  }

  handleJoinChannel(ws, payload) {
    const playerId = uuidv4();
    const playerData = {
      id: playerId,
      username: this.sanitizeUsername(payload.username),
      color: payload.color || this.generateRandomColor(),
      x: 100,
      y: 300,
      velocityX: 0,
      velocityY: 0,
      currentAnimation: 'idle',
      facingRight: true,
      isGrounded: false,
    };

    const result = this.channelManager.joinChannel(ws, payload.channelId, playerData);

    // Send confirmation to joining player
    this.send(ws, MessageTypes.CHANNEL_JOINED, {
      playerId,
      channelId: payload.channelId,
      spawnPoint: { x: 100, y: 300 },
    });

    // Send list of existing players
    this.send(ws, MessageTypes.PLAYER_LIST, {
      players: result.players,
    });
  }

  handleLeaveChannel(ws) {
    this.channelManager.leaveChannel(ws);
  }

  handlePlayerMove(ws, payload) {
    const channelId = this.channelManager.getPlayerChannel(ws);
    const playerData = this.channelManager.getPlayerData(ws);

    if (!channelId || !playerData) return;

    // Update server-side player state
    this.channelManager.updatePlayerData(ws, {
      x: payload.x,
      y: payload.y,
      velocityX: payload.vx,
      velocityY: payload.vy,
      currentAnimation: payload.a,
      facingRight: payload.d,
      isGrounded: payload.g !== undefined ? payload.g : playerData.isGrounded,
    });

    // Broadcast to other players
    this.channelManager.broadcastToChannel(
      channelId,
      {
        type: MessageTypes.PLAYER_UPDATE,
        payload: {
          id: playerData.id,
          x: payload.x,
          y: payload.y,
          vx: payload.vx,
          vy: payload.vy,
          a: payload.a,
          d: payload.d,
          g: payload.g,
          t: Date.now(),
        },
      },
      ws
    );
  }

  handleChat(ws, payload) {
    const channelId = this.channelManager.getPlayerChannel(ws);
    const playerData = this.channelManager.getPlayerData(ws);

    if (!channelId || !playerData) {
      console.log('Chat error: no channel or player data');
      return;
    }

    const sanitizedText = this.sanitizeChatMessage(payload.text);

    console.log(`Player ${playerData.username} sent chat: "${sanitizedText}" in channel ${channelId}`);

    this.channelManager.broadcastToChannel(channelId, {
      type: MessageTypes.CHAT_MESSAGE,
      payload: {
        playerId: playerData.id,
        text: sanitizedText,
        timestamp: Date.now(),
      },
    });
  }

  handleEmoji(ws, payload) {
    const channelId = this.channelManager.getPlayerChannel(ws);
    const playerData = this.channelManager.getPlayerData(ws);

    if (!channelId || !playerData) {
      console.log('Emoji error: no channel or player data');
      return;
    }

    console.log(`Player ${playerData.username} sent emoji: ${payload.emoji} in channel ${channelId}`);

    this.channelManager.broadcastToChannel(channelId, {
      type: MessageTypes.EMOJI_REACTION,
      payload: {
        playerId: playerData.id,
        emoji: payload.emoji,
        timestamp: Date.now(),
      },
    });
  }

  send(ws, type, payload) {
    if (ws.readyState === 1) { // WebSocket.OPEN
      ws.send(JSON.stringify({ type, payload }));
    }
  }

  sanitizeUsername(username) {
    if (!username) return 'Anonymous';
    return username.replace(/[<>]/g, '').substring(0, 20);
  }

  sanitizeChatMessage(text) {
    if (!text) return '';
    return text.replace(/[<>]/g, '').substring(0, 200);
  }

  generateRandomColor() {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'];
    return colors[Math.floor(Math.random() * colors.length)];
  }
}
