// Keyboard input handler with chat overlay

window.InputHandler = class InputHandler {
  constructor(player, constants, presetEmojis, chatWindow) {
    this.player = player;
    this.constants = constants;
    this.presetEmojis = presetEmojis;
    this.chatWindow = chatWindow;
    this.keys = {
      ArrowLeft: false,
      ArrowRight: false,
      ArrowUp: false,
      ArrowDown: false,
      ' ': false, // Space
      Shift: false, // Shift for emoji picker
    };
    this.onEmojiSend = null; // Callback for sending emoji reactions
  }

  attachListeners() {
    document.addEventListener('keydown', (e) => this.handleKeyDown(e));
    document.addEventListener('keyup', (e) => this.handleKeyUp(e));
  }

  handleKeyDown(e) {
    // Handle chat window
    if (e.key === 'Enter' && !this.chatWindow.isOpen) {
      e.preventDefault();
      this.chatWindow.show();
      return;
    }

    if (e.key === 'Escape' && this.chatWindow.isOpen) {
      e.preventDefault();
      this.chatWindow.hide();
      return;
    }

    // Ignore game controls if chat is open
    if (this.chatWindow.isOpen) {
      return;
    }

    // Emoji reactions (number keys 1-9)
    const num = parseInt(e.key);
    if (num >= 1 && num <= 9) {
      e.preventDefault();
      const emoji = this.presetEmojis[num - 1];
      if (emoji && this.onEmojiSend) {
        this.onEmojiSend(emoji);
      }
      return;
    }

    // Game controls
    if (e.key in this.keys) {
      e.preventDefault();
      this.keys[e.key] = true;
    }
  }

  handleKeyUp(e) {
    // Ignore if chat is open
    if (this.chatWindow.isOpen) return;

    if (e.key in this.keys) {
      e.preventDefault();
      this.keys[e.key] = false;
    }
  }

  updatePlayer() {
    // Don't update if chat is open
    if (this.chatWindow.isOpen) return;

    const moveSpeed = this.constants.PHYSICS.MOVE_SPEED;

    // Show emoji picker when Shift is held
    this.player.showEmojiPicker = this.keys.Shift;

    // Horizontal movement
    if (this.keys.ArrowLeft) {
      this.player.velocityX = -moveSpeed;
      this.player.facingRight = false;
    } else if (this.keys.ArrowRight) {
      this.player.velocityX = moveSpeed;
      this.player.facingRight = true;
    } else {
      this.player.velocityX = 0;
    }

    // Vertical movement (free 2D movement)
    if (this.keys.ArrowUp) {
      this.player.velocityY = -moveSpeed;
    } else if (this.keys.ArrowDown) {
      this.player.velocityY = moveSpeed;
    } else {
      this.player.velocityY = 0;
    }

    // Space for speed boost (optional)
    if (this.keys[' ']) {
      const boostMultiplier = 2;
      this.player.velocityX *= boostMultiplier;
      this.player.velocityY *= boostMultiplier;
    }
  }

  destroy() {
    // Cleanup if needed
  }
}
