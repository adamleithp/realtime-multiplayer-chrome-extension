// WebSocket message protocol definitions

window.MessageTypes = {
  // Client -> Server
  JOIN_CHANNEL: 'join_channel',
  LEAVE_CHANNEL: 'leave_channel',
  PLAYER_MOVE: 'player_move',
  SEND_CHAT: 'send_chat',
  SEND_EMOJI: 'send_emoji',

  // Server -> Client
  CHANNEL_JOINED: 'channel_joined',
  PLAYER_LIST: 'player_list',
  PLAYER_JOINED: 'player_joined',
  PLAYER_LEFT: 'player_left',
  PLAYER_UPDATE: 'player_update',
  CHAT_MESSAGE: 'chat_message',
  EMOJI_REACTION: 'emoji_reaction',
  ERROR: 'error',
};
