// Canvas renderer for players, platforms, and interactions

window.Renderer = class Renderer {
  constructor(ctx, spriteManager, constants) {
    this.ctx = ctx;
    this.spriteManager = spriteManager;
    this.constants = constants;
    this.debugMode = false; // Set to true to see platforms
  }

  render(localPlayer, remotePlayers, level) {
    this.clear();

    // Render platforms (debug mode)
    if (this.debugMode) {
      this.renderPlatforms(level.platforms);
    }

    // Viewport culling bounds (with margin for smooth entry/exit)
    const margin = 100;
    const viewportBounds = {
      left: -margin,
      right: this.ctx.canvas.width + margin,
      top: -margin,
      bottom: this.ctx.canvas.height + margin,
    };

    // Render local player (always visible)
    this.renderPlayer(localPlayer, 0, true);

    // Render only visible remote players (with max limit for performance)
    let renderedCount = 0;
    const maxRenders = this.constants.PERFORMANCE.MAX_VISIBLE_PLAYERS;

    remotePlayers.forEach((player) => {
      if (renderedCount >= maxRenders) return; // Hard limit to prevent crashes

      if (this.isPlayerVisible(player, viewportBounds)) {
        const distance = this.getDistance(localPlayer, player);
        this.renderPlayer(player, distance, false);
        renderedCount++;
      }
    });

    // Debug info
    if (this.debugMode) {
      this.ctx.fillStyle = 'white';
      this.ctx.font = '14px monospace';
      this.ctx.fillText(`Players rendered: ${renderedCount + 1}/${remotePlayers.length + 1}`, 10, 20);
    }
  }

  isPlayerVisible(player, bounds) {
    const playerSize = 64; // Approximate player size
    return (
      player.x + playerSize > bounds.left &&
      player.x < bounds.right &&
      player.y + playerSize > bounds.top &&
      player.y < bounds.bottom
    );
  }

  getDistance(player1, player2) {
    const dx = player1.x - player2.x;
    const dy = player1.y - player2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  clear() {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
  }

  renderPlatforms(platforms) {
    this.ctx.fillStyle = 'rgba(100, 100, 100, 0.5)';
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    this.ctx.lineWidth = 2;

    platforms.forEach((platform) => {
      this.ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
      this.ctx.strokeRect(platform.x, platform.y, platform.width, platform.height);
    });
  }

  renderPlayer(player, distance, isLocalPlayer) {
    const scale = this.constants.RENDERING.SPRITE_SCALE;

    // Level of Detail thresholds
    const CLOSE_DISTANCE = 300;
    const MEDIUM_DISTANCE = 600;

    // Get current sprite frame
    const sprite = this.spriteManager.getCurrentFrame(
      player.currentAnimation,
      player.animationTime
    );

    if (!sprite) return;

    this.ctx.save();

    // Apply color tint
    if (player.color) {
      this.ctx.globalAlpha = 0.8;
    }

    // Flip sprite if facing left
    if (!player.facingRight) {
      this.ctx.translate(player.x + sprite.width * scale, player.y);
      this.ctx.scale(-1, 1);
      this.ctx.drawImage(sprite, 0, 0, sprite.width * scale, sprite.height * scale);
    } else {
      this.ctx.drawImage(sprite, player.x, player.y, sprite.width * scale, sprite.height * scale);
    }

    this.ctx.restore();

    // Always render username (but simplify for distant players)
    if (isLocalPlayer || distance < MEDIUM_DISTANCE) {
      this.renderUsername(player, sprite.width * scale, sprite.height * scale);
    }

    // Only render chat bubbles for nearby players
    if ((isLocalPlayer || distance < CLOSE_DISTANCE) && player.chatBubble) {
      this.renderChatBubble(player, sprite.width * scale, isLocalPlayer);
    }

    // Only render emojis for nearby players
    if ((isLocalPlayer || distance < CLOSE_DISTANCE) && player.emojis && player.emojis.length > 0) {
      this.renderEmojis(player, sprite.width * scale);
    }

    // Only render emoji picker for local player
    if (isLocalPlayer && player.showEmojiPicker) {
      this.renderEmojiPicker(player, sprite.width * scale);
    }
  }

  renderUsername(player, spriteWidth, spriteHeight) {
    this.ctx.save();

    this.ctx.font = 'bold 14px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'bottom';

    // Outline
    this.ctx.strokeStyle = 'black';
    this.ctx.lineWidth = 3;
    this.ctx.strokeText(
      player.username,
      player.x + spriteWidth / 2,
      player.y + this.constants.RENDERING.USERNAME_OFFSET_Y
    );

    // Text
    this.ctx.fillStyle = player.color || 'white';
    this.ctx.fillText(
      player.username,
      player.x + spriteWidth / 2,
      player.y + this.constants.RENDERING.USERNAME_OFFSET_Y
    );

    this.ctx.restore();
  }

  renderChatBubble(player, spriteWidth, isLocalPlayer) {
    // Format text with username for remote players
    const displayText = isLocalPlayer
      ? player.chatBubble.text
      : `${player.username} says: ${player.chatBubble.text}`;

    const now = Date.now();
    const elapsed = now - player.chatBubble.timestamp;
    const duration = this.constants.RENDERING.CHAT_BUBBLE_DURATION;

    // Fade out near expiration
    let alpha = 1.0;
    if (elapsed > duration - 1000) {
      alpha = (duration - elapsed) / 1000;
    }

    this.ctx.save();
    this.ctx.globalAlpha = alpha;

    // Measure text
    this.ctx.font = '14px Arial';
    const textMetrics = this.ctx.measureText(displayText);
    const textWidth = textMetrics.width;

    // Bubble dimensions
    const padding = 10;
    const bubbleWidth = textWidth + padding * 2;
    const bubbleHeight = 30;
    const bubbleX = player.x + spriteWidth / 2 - bubbleWidth / 2;
    const bubbleY = player.y + this.constants.RENDERING.CHAT_BUBBLE_OFFSET_Y;

    // Draw bubble
    this.ctx.fillStyle = 'white';
    this.ctx.strokeStyle = '#333';
    this.ctx.lineWidth = 2;
    this.roundRect(bubbleX, bubbleY, bubbleWidth, bubbleHeight, 8);
    this.ctx.fill();
    this.ctx.stroke();

    // Draw text
    this.ctx.fillStyle = '#333';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(displayText, player.x + spriteWidth / 2, bubbleY + bubbleHeight / 2);

    this.ctx.restore();
  }

  renderEmojis(player, spriteWidth) {
    const now = Date.now();
    const duration = this.constants.RENDERING.EMOJI_DURATION;

    // Render each emoji with slight horizontal offset (spread pattern)
    player.emojis.forEach((emojiData, index) => {
      const elapsed = now - emojiData.timestamp;

      // Float upward
      const floatOffset = elapsed * this.constants.RENDERING.EMOJI_FLOAT_SPEED;

      // Horizontal spread (fan out slightly)
      const spreadAngle = (index - player.emojis.length / 2) * 0.3;
      const horizontalOffset = Math.sin(spreadAngle) * 20;

      // Fade out near expiration
      let alpha = 1.0;
      if (elapsed > duration - 1000) {
        alpha = (duration - elapsed) / 1000;
      }

      this.ctx.save();
      this.ctx.globalAlpha = alpha;

      this.ctx.font = '32px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(
        emojiData.emoji,
        player.x + spriteWidth / 2 + horizontalOffset,
        player.y + this.constants.RENDERING.EMOJI_OFFSET_Y - floatOffset
      );

      this.ctx.restore();
    });
  }

  renderEmojiPicker(player, spriteWidth) {
    const pickerY = player.y - 120;
    const centerX = player.x + spriteWidth / 2;

    this.ctx.save();

    // Background
    const padding = 12;
    const emojiSize = 32;
    const spacing = 8;
    const totalWidth = this.constants.PRESET_EMOJIS.length * (emojiSize + spacing) - spacing + padding * 2;

    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    this.ctx.lineWidth = 2;
    this.roundRect(
      centerX - totalWidth / 2,
      pickerY - padding,
      totalWidth,
      emojiSize + padding * 2,
      8
    );
    this.ctx.fill();
    this.ctx.stroke();

    // Render emoji options with numbers
    this.ctx.font = '24px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';

    this.constants.PRESET_EMOJIS.forEach((emoji, index) => {
      const x = centerX - totalWidth / 2 + padding + index * (emojiSize + spacing) + emojiSize / 2;
      const y = pickerY + emojiSize / 2;

      // Emoji
      this.ctx.fillStyle = 'white';
      this.ctx.fillText(emoji, x, y);

      // Number below
      this.ctx.font = 'bold 12px Arial';
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      this.ctx.fillText((index + 1).toString(), x, y + 20);
      this.ctx.font = '24px Arial';
    });

    this.ctx.restore();
  }

  roundRect(x, y, width, height, radius) {
    this.ctx.beginPath();
    this.ctx.moveTo(x + radius, y);
    this.ctx.lineTo(x + width - radius, y);
    this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    this.ctx.lineTo(x + width, y + height - radius);
    this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    this.ctx.lineTo(x + radius, y + height);
    this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    this.ctx.lineTo(x, y + radius);
    this.ctx.quadraticCurveTo(x, y, x + radius, y);
    this.ctx.closePath();
  }
}
