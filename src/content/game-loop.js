// Fixed timestep game loop with physics

window.GameLoop = class GameLoop {
  constructor(localPlayer, remotePlayers, level, constants) {
    this.localPlayer = localPlayer;
    this.remotePlayers = remotePlayers;
    this.level = level;
    this.constants = constants;
    this.isRunning = false;
    this.lastTime = 0;
    this.accumulator = 0;
    this.lastNetworkUpdate = 0;

    // Callbacks
    this.onUpdate = null;
    this.onRender = null;

    // Player dimensions for collision
    this.playerWidth = 32 * this.constants.RENDERING.SPRITE_SCALE;
    this.playerHeight = 48 * this.constants.RENDERING.SPRITE_SCALE;
  }

  start() {
    this.isRunning = true;
    this.lastTime = performance.now();
    this.loop(this.lastTime);
  }

  stop() {
    this.isRunning = false;
  }

  loop(currentTime) {
    if (!this.isRunning) return;

    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;
    this.accumulator += deltaTime;

    // Fixed timestep physics updates
    while (this.accumulator >= this.constants.GAME.FIXED_TIMESTEP) {
      this.updatePhysics(this.constants.GAME.FIXED_TIMESTEP);
      this.accumulator -= this.constants.GAME.FIXED_TIMESTEP;

      // Call update callback
      if (this.onUpdate) {
        this.onUpdate();
      }
    }

    // Render with interpolation
    const alpha = this.accumulator / this.constants.GAME.FIXED_TIMESTEP;
    if (this.onRender) {
      this.onRender(alpha);
    }

    // Cleanup expired interactions
    this.cleanupInteractions();

    requestAnimationFrame((time) => this.loop(time));
  }

  updatePhysics(deltaTime) {
    // Update local player physics
    this.updatePlayerPhysics(this.localPlayer, deltaTime);

    // Update remote players (just animations, server handles their physics)
    // Skip animation updates for players outside viewport (performance optimization)
    let updatedCount = 0;
    const maxUpdatesPerFrame = 50; // Limit updates per frame for performance

    this.remotePlayers.forEach((player) => {
      if (updatedCount < maxUpdatesPerFrame) {
        player.updateAnimation(deltaTime);
        this.updatePlayerAnimation(player);
        updatedCount++;
      }
    });
  }

  updatePlayerPhysics(player, deltaTime) {
    // Free 2D movement - no gravity

    // Apply velocity to position
    player.x += player.velocityX;
    player.y += player.velocityY;

    // Check boundaries - wrap around screen edges
    if (player.x < -this.playerWidth) {
      player.x = window.innerWidth;
    } else if (player.x > window.innerWidth) {
      player.x = -this.playerWidth;
    }

    if (player.y < -this.playerHeight) {
      player.y = window.innerHeight;
    } else if (player.y > window.innerHeight) {
      player.y = -this.playerHeight;
    }

    // Update animation
    player.updateAnimation(deltaTime);
    this.updatePlayerAnimation(player);
  }

  updatePlayerAnimation(player) {
    // Determine current animation based on movement
    if (player.velocityX !== 0 || player.velocityY !== 0) {
      player.currentAnimation = 'walk';
    } else {
      player.currentAnimation = 'idle';
    }

    // Update animation frame (this will be handled by sprite manager)
  }

  shouldSendNetworkUpdate() {
    const now = Date.now();
    if (now - this.lastNetworkUpdate >= this.constants.NETWORK.UPDATE_RATE) {
      this.lastNetworkUpdate = now;
      return true;
    }
    return false;
  }

  cleanupInteractions() {
    const now = Date.now();

    // Clean up local player
    this.cleanupPlayerInteractions(this.localPlayer, now);

    // Clean up remote players
    this.remotePlayers.forEach((player) => {
      this.cleanupPlayerInteractions(player, now);
    });
  }

  cleanupPlayerInteractions(player, now) {
    if (player.chatBubble && now - player.chatBubble.timestamp > this.constants.RENDERING.CHAT_BUBBLE_DURATION) {
      player.chatBubble = null;
    }

    // Remove expired emojis from array
    if (player.emojis && player.emojis.length > 0) {
      player.emojis = player.emojis.filter(
        (emoji) => now - emoji.timestamp <= this.constants.RENDERING.EMOJI_DURATION
      );
    }
  }
}
