// Channel/room management for multiplayer sessions

import { WebSocket } from 'ws';

export class ChannelManager {
  constructor() {
    this.channels = new Map();      // channelId -> Set<WebSocket>
    this.playerChannels = new Map(); // WebSocket -> channelId
    this.playerData = new Map();     // WebSocket -> playerState
  }

  joinChannel(ws, channelId, playerData) {
    // Create channel if it doesn't exist
    if (!this.channels.has(channelId)) {
      this.channels.set(channelId, new Set());
    }

    // Add player to channel
    this.channels.get(channelId).add(ws);
    this.playerChannels.set(ws, channelId);
    this.playerData.set(ws, playerData);

    console.log(`Player ${playerData.username} (${playerData.id}) joined channel: ${channelId}`);

    // Notify others in channel
    this.broadcastToChannel(channelId, {
      type: 'player_joined',
      payload: playerData,
    }, ws);

    // Return list of existing players
    return {
      players: this.getChannelPlayers(channelId).filter(p => p.id !== playerData.id),
    };
  }

  leaveChannel(ws) {
    const channelId = this.playerChannels.get(ws);
    if (!channelId) return;

    const playerData = this.playerData.get(ws);

    // Remove from channel
    const channel = this.channels.get(channelId);
    if (channel) {
      channel.delete(ws);

      // Remove empty channels
      if (channel.size === 0) {
        this.channels.delete(channelId);
      }
    }

    this.playerChannels.delete(ws);
    this.playerData.delete(ws);

    if (playerData) {
      console.log(`Player ${playerData.username} (${playerData.id}) left channel: ${channelId}`);

      // Notify others in channel
      this.broadcastToChannel(channelId, {
        type: 'player_left',
        payload: { id: playerData.id },
      });
    }
  }

  removePlayer(ws) {
    this.leaveChannel(ws);
  }

  broadcastToChannel(channelId, message, excludeWs = null) {
    const channel = this.channels.get(channelId);
    if (!channel) return;

    const messageStr = JSON.stringify(message);

    channel.forEach((ws) => {
      if (ws !== excludeWs && ws.readyState === WebSocket.OPEN) {
        ws.send(messageStr);
      }
    });
  }

  getChannelPlayers(channelId) {
    const channel = this.channels.get(channelId);
    if (!channel) return [];

    return Array.from(channel).map((ws) => this.playerData.get(ws));
  }

  updatePlayerData(ws, updates) {
    const playerData = this.playerData.get(ws);
    if (playerData) {
      Object.assign(playerData, updates);
    }
  }

  getPlayerData(ws) {
    return this.playerData.get(ws);
  }

  getPlayerChannel(ws) {
    return this.playerChannels.get(ws);
  }
}
