// Game constants for physics, network, and rendering
// Note: WebSocket URL is now configured through the popup UI

window.MULTIPLAYER_CONSTANTS = window.MULTIPLAYER_CONSTANTS || {};

window.MULTIPLAYER_CONSTANTS.PHYSICS = {
  GRAVITY: 0.8,              // pixels/frame^2
  MOVE_SPEED: 5,             // pixels/frame
  JUMP_FORCE: -15,           // pixels/frame (negative = up)
  MAX_FALL_SPEED: 20,        // Terminal velocity
  FRICTION: 0.8,             // Ground friction
  AIR_RESISTANCE: 0.95,      // Air friction
};

window.MULTIPLAYER_CONSTANTS.NETWORK = {
  UPDATE_RATE: 50,           // ms (20 Hz)
  RECONNECT_DELAY: 2000,     // ms
  MAX_RECONNECT_ATTEMPTS: 5,
  PING_INTERVAL: 5000,       // ms
  // WS_URL is now configured through popup UI and stored in chrome.storage
};

window.MULTIPLAYER_CONSTANTS.RENDERING = {
  TARGET_FPS: 60,
  SPRITE_SCALE: 2,           // 2x pixel art scaling
  CHAT_BUBBLE_DURATION: 5000, // ms
  EMOJI_DURATION: 3000,      // ms
  USERNAME_OFFSET_Y: -10,    // pixels above sprite
  CHAT_BUBBLE_OFFSET_Y: -80, // pixels above sprite
  EMOJI_OFFSET_Y: -60,       // pixels above sprite
  EMOJI_FLOAT_SPEED: 0.5,    // pixels per frame
  MAX_EMOJIS_PER_PLAYER: 15, // Limit to prevent memory issues
};

window.MULTIPLAYER_CONSTANTS.GAME = {
  FIXED_TIMESTEP: 1000 / 60, // 60 FPS physics
};

window.MULTIPLAYER_CONSTANTS.PERFORMANCE = {
  MAX_VISIBLE_PLAYERS: 100,      // Max players to render per frame
  MAX_ANIMATION_UPDATES: 50,     // Max animation updates per frame
  VIEWPORT_CULLING_MARGIN: 100,  // Pixels outside viewport to still render
  CLOSE_DISTANCE: 300,           // Distance for full detail rendering
  MEDIUM_DISTANCE: 600,          // Distance for reduced detail rendering
};

window.MULTIPLAYER_CONSTANTS.PRESET_EMOJIS = ['👋', '😀', '❤️', '🎉', '😂', '👍', '🔥', '⭐', '💯'];
