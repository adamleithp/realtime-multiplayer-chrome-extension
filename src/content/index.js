// Main content script orchestrator
// This file coordinates all components of the multiplayer overlay

(async function () {
  console.log('Multiplayer extension initializing...');

  // Check if already running
  if (window.MULTIPLAYER_ACTIVE) {
    console.log('Extension already active in this tab');
    return;
  }

  // Mark as active
  window.MULTIPLAYER_ACTIVE = true;

  // Get constants from global scope
  const constants = window.MULTIPLAYER_CONSTANTS;
  const MessageTypes = window.MessageTypes;
  const Player = window.Player;
  const Level = window.Level;
  const SpriteManager = window.SpriteManager;
  const OverlayManager = window.OverlayManager;
  const WebSocketClient = window.WebSocketClient;
  const GameLoop = window.GameLoop;
  const Renderer = window.Renderer;
  const InputHandler = window.InputHandler;

  // Get channel info from chrome.storage
  const { channelId, username, color } = await chrome.storage.local.get(['channelId', 'username', 'color']);

  if (!channelId || !username) {
    console.error('Missing channel or username in storage');
    return;
  }

  console.log(`Joining channel: ${channelId} as ${username}`);

  // Initialize sprite manager
  const spriteManager = new SpriteManager();
  await spriteManager.load('src/assets/sprites/sprite-config.json');

  // Create overlay
  const overlay = new OverlayManager();
  overlay.initialize();

  // Create floating control panel
  const floatingMenu = document.createElement('div');
  floatingMenu.id = 'multiplayer-floating-menu';
  floatingMenu.innerHTML = `
    <div style="
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 16px;
      border-radius: 12px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
      z-index: 2147483646;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      pointer-events: auto;
      min-width: 280px;
      backdrop-filter: blur(10px);
    ">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <div>
          <div style="font-size: 16px; font-weight: 700; margin-bottom: 4px;">Multiplayer Active</div>
          <div style="font-size: 12px; opacity: 0.9;">Channel: ${channelId}</div>
        </div>
        <button id="multiplayer-minimize-btn" style="
          background: rgba(255, 255, 255, 0.15);
          border: none;
          color: white;
          width: 28px;
          height: 28px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
        " onmouseover="this.style.background='rgba(255, 255, 255, 0.25)'" onmouseout="this.style.background='rgba(255, 255, 255, 0.15)'" title="Minimize">
          −
        </button>
      </div>

      <div id="multiplayer-menu-content">
        <div style="margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px solid rgba(255, 255, 255, 0.2);">
          <div style="font-size: 13px; font-weight: 600; margin-bottom: 8px; opacity: 0.9;">Appearance</div>
          <div style="display: flex; align-items: center; gap: 10px;">
            <label style="font-size: 12px; opacity: 0.85;">Name Color:</label>
            <input type="color" id="multiplayer-color-picker" value="${color}" style="
              width: 50px;
              height: 32px;
              border: 2px solid rgba(255, 255, 255, 0.3);
              border-radius: 6px;
              cursor: pointer;
              background: transparent;
            "/>
            <span id="multiplayer-color-value" style="font-size: 11px; opacity: 0.7; font-family: monospace;">${color}</span>
          </div>
          <div style="font-size: 11px; opacity: 0.6; margin-top: 8px; font-style: italic;">
            More options coming soon...
          </div>
        </div>

        <div style="margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px solid rgba(255, 255, 255, 0.2);">
          <div style="font-size: 13px; font-weight: 600; margin-bottom: 8px; opacity: 0.9;">Controls</div>
          <div style="font-size: 12px; line-height: 1.6; opacity: 0.85;">
            <div style="margin-bottom: 4px;"><strong>Arrows:</strong> Move around</div>
            <div style="margin-bottom: 4px;"><strong>Space:</strong> Speed boost</div>
            <div style="margin-bottom: 4px;"><strong>Shift:</strong> Show emoji picker</div>
            <div style="margin-bottom: 4px;"><strong>1-9:</strong> Send emoji</div>
            <div style="margin-bottom: 4px;"><strong>Enter:</strong> Open chat input</div>
          </div>
        </div>

        <button id="multiplayer-close-btn" style="
          width: 100%;
          background: rgba(255, 255, 255, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.3);
          color: white;
          padding: 10px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 600;
          transition: all 0.2s;
        " onmouseover="this.style.background='rgba(255, 255, 255, 0.3)'; this.style.transform='translateY(-1px)'" onmouseout="this.style.background='rgba(255, 255, 255, 0.2)'; this.style.transform='translateY(0)'">
          Close Multiplayer
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(floatingMenu);

  // Create local player
  const localPlayer = new Player(null, username, color);
  const remotePlayers = new Map();

  // Handle minimize/expand
  let isMinimized = false;
  const minimizeBtn = document.getElementById('multiplayer-minimize-btn');
  const menuContent = document.getElementById('multiplayer-menu-content');

  minimizeBtn.addEventListener('click', () => {
    isMinimized = !isMinimized;
    if (isMinimized) {
      menuContent.style.display = 'none';
      minimizeBtn.textContent = '+';
      minimizeBtn.title = 'Expand';
    } else {
      menuContent.style.display = 'block';
      minimizeBtn.textContent = '−';
      minimizeBtn.title = 'Minimize';
    }
  });

  // Handle color picker change
  const colorPicker = document.getElementById('multiplayer-color-picker');
  const colorValue = document.getElementById('multiplayer-color-value');

  colorPicker.addEventListener('input', (e) => {
    const newColor = e.target.value;
    colorValue.textContent = newColor;
    localPlayer.color = newColor;

    // Save to storage
    chrome.storage.local.set({ color: newColor });

    // Note: Color change will be visible on next position update
    // which happens automatically via the game loop
  });

  // Load level data
  const level = new Level();

  // Initialize WebSocket
  const ws = new WebSocketClient(constants.NETWORK.WS_URL);

  // Set up message handlers
  ws.on(MessageTypes.CHANNEL_JOINED, (payload) => {
    localPlayer.id = payload.playerId;
    localPlayer.x = payload.spawnPoint.x;
    localPlayer.y = payload.spawnPoint.y;
    console.log(`Joined channel successfully. Player ID: ${localPlayer.id}`);
  });

  ws.on(MessageTypes.PLAYER_LIST, (payload) => {
    console.log(`Received player list: ${payload.players.length} players`);
    payload.players.forEach((playerData) => {
      const player = new Player(playerData.id, playerData.username, playerData.color);
      player.setState(playerData);
      remotePlayers.set(player.id, player);
    });
  });

  ws.on(MessageTypes.PLAYER_JOINED, (payload) => {
    console.log(`Player joined: ${payload.username}`);
    const player = new Player(payload.id, payload.username, payload.color);
    player.setState(payload);
    remotePlayers.set(player.id, player);
  });

  ws.on(MessageTypes.PLAYER_LEFT, (payload) => {
    console.log(`Player left: ${payload.id}`);
    remotePlayers.delete(payload.id);
  });

  ws.on(MessageTypes.PLAYER_UPDATE, (payload) => {
    const player = remotePlayers.get(payload.id);
    if (player) {
      player.setState({
        x: payload.x,
        y: payload.y,
        velocityX: payload.vx,
        velocityY: payload.vy,
        currentAnimation: payload.a,
        facingRight: payload.d,
        isGrounded: payload.g,
      });
    }
  });

  ws.on(MessageTypes.CHAT_MESSAGE, (payload) => {
    console.log('Received chat message:', payload);

    // Find player (could be local or remote)
    let player = remotePlayers.get(payload.playerId);
    let isLocal = false;

    if (payload.playerId === localPlayer.id) {
      player = localPlayer;
      isLocal = true;
      console.log('Chat is for local player');
    } else {
      console.log('Chat is for remote player:', payload.playerId, 'Found:', !!player);
    }

    if (player) {
      // Set chat bubble above player
      player.chatBubble = {
        text: payload.text,
        timestamp: payload.timestamp,
      };
      console.log(`Set chat bubble on player: "${payload.text}"`);

      // Add to chat window (only add remote messages, local already added)
      if (!isLocal) {
        chatWindow.addMessage(player.username, payload.text, player.color, false);
      }
    } else {
      console.error('Could not find player for chat message:', payload.playerId);
    }
  });

  ws.on(MessageTypes.EMOJI_REACTION, (payload) => {
    console.log('Received emoji reaction:', payload);

    // Find player (could be local or remote)
    let player = remotePlayers.get(payload.playerId);
    if (payload.playerId === localPlayer.id) {
      player = localPlayer;
      console.log('Emoji is for local player');
    } else {
      console.log('Emoji is for remote player:', payload.playerId, 'Found:', !!player);
    }

    if (player) {
      // Add to emojis array (continuous reactions)
      player.emojis.push({
        emoji: payload.emoji,
        timestamp: payload.timestamp,
        id: Math.random(), // Unique ID for this emoji
      });

      console.log(`Added emoji to player. Total emojis: ${player.emojis.length}`);

      // Limit emoji array size (remove oldest)
      if (player.emojis.length > constants.RENDERING.MAX_EMOJIS_PER_PLAYER) {
        player.emojis.shift(); // Remove oldest emoji
      }
    } else {
      console.error('Could not find player for emoji reaction:', payload.playerId);
    }
  });

  // Connect to server
  ws.connect();

  // Wait for connection before joining
  ws.on('open', () => {
    console.log('WebSocket connected, joining channel...');
    ws.send(MessageTypes.JOIN_CHANNEL, {
      channelId,
      username,
      color,
    });
  });

  // Initialize chat window
  const chatWindow = new window.ChatWindow((text) => {
    console.log('Sending chat message:', text);
    ws.send(MessageTypes.SEND_CHAT, { text });

    // Add own message to chat window
    chatWindow.addMessage(localPlayer.username, text, localPlayer.color, true);
  });
  chatWindow.initialize();

  // Initialize input handler
  const inputHandler = new InputHandler(localPlayer, constants, constants.PRESET_EMOJIS, chatWindow);

  // Set up emoji callback
  inputHandler.onEmojiSend = (emoji) => {
    console.log('Sending emoji:', emoji);
    ws.send(MessageTypes.SEND_EMOJI, { emoji });
  };

  inputHandler.attachListeners();

  // Initialize renderer
  const renderer = new Renderer(overlay.ctx, spriteManager, constants);

  // Initialize and start game loop
  const gameLoop = new GameLoop(localPlayer, remotePlayers, level, constants);

  gameLoop.onUpdate = () => {
    inputHandler.updatePlayer();

    // Send position update to server (throttled)
    if (gameLoop.shouldSendNetworkUpdate()) {
      ws.send(MessageTypes.PLAYER_MOVE, {
        x: Math.round(localPlayer.x),
        y: Math.round(localPlayer.y),
        vx: localPlayer.velocityX,
        vy: localPlayer.velocityY,
        a: localPlayer.currentAnimation,
        d: localPlayer.facingRight,
        g: localPlayer.isGrounded,
      });
    }
  };

  gameLoop.onRender = (alpha) => {
    renderer.render(localPlayer, Array.from(remotePlayers.values()), level);
  };

  gameLoop.start();

  console.log('Multiplayer extension started successfully');

  // Cleanup function
  function cleanup() {
    console.log('Cleaning up multiplayer extension...');
    gameLoop.stop();
    ws.disconnect();
    overlay.destroy();
    inputHandler.destroy();
    chatWindow.destroy();

    // Remove floating menu
    if (floatingMenu && floatingMenu.parentNode) {
      floatingMenu.parentNode.removeChild(floatingMenu);
    }

    // Reset active flag
    window.MULTIPLAYER_ACTIVE = false;

    console.log('Multiplayer extension closed');
  }

  // Wire up close button
  const closeBtn = document.getElementById('multiplayer-close-btn');
  if (closeBtn) {
    closeBtn.addEventListener('click', cleanup);
  }

  // Cleanup on page unload
  window.addEventListener('beforeunload', cleanup);
})();
