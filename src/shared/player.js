// Player entity class

window.Player = class Player {
  constructor(id, username, color) {
    this.id = id;                    // Unique player ID (UUID)
    this.username = username;         // Display name
    this.color = color;               // Character tint color

    // Position & Physics
    this.x = 100;                     // X position (pixels)
    this.y = 300;                     // Y position (pixels)
    this.velocityX = 0;               // Horizontal velocity
    this.velocityY = 0;               // Vertical velocity
    this.isGrounded = false;          // On platform?
    this.facingRight = true;          // Sprite direction

    // Animation State
    this.currentAnimation = 'idle';   // idle/walk/jump
    this.animationFrame = 0;          // Current frame index
    this.animationTime = 0;           // Time in current animation

    // Interactions
    this.chatBubble = null;           // { text: string, timestamp: number }
    this.emojis = [];                 // Array of { emoji: string, timestamp: number, id: number }

    // Network
    this.lastUpdateTime = Date.now(); // For interpolation
    this.serverState = null;          // Last received server state
  }

  updateAnimation(deltaTime) {
    this.animationTime += deltaTime;
  }

  setState(state) {
    if (state.x !== undefined) this.x = state.x;
    if (state.y !== undefined) this.y = state.y;
    if (state.velocityX !== undefined) this.velocityX = state.velocityX;
    if (state.velocityY !== undefined) this.velocityY = state.velocityY;
    if (state.currentAnimation !== undefined) this.currentAnimation = state.currentAnimation;
    if (state.facingRight !== undefined) this.facingRight = state.facingRight;
    if (state.isGrounded !== undefined) this.isGrounded = state.isGrounded;
  }
}
