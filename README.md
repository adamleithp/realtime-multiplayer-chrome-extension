# Multiplayer Website Overlay Extension

A Chrome extension that adds a multiplayer experience to any website! See other users' characters, chat, and send emoji reactions - all overlaid on top of any webpage.

![2026-01-05 05 18 03](https://github.com/user-attachments/assets/2d03f66f-0cb2-49ee-a2b1-402dbe84128a)


## Features

- 🎮 **Real-time Multiplayer**: See other users moving around on any website
- 💬 **Chat System**: Persistent chat window with message history
- 😀 **Emoji Reactions**: Send continuous emoji reactions (1-9 keys)
- 🎨 **Customization**: Change your username color with color picker
- ⚡ **Performance Optimized**: Handles 200+ users with viewport culling and LOD
- 🌐 **Works Anywhere**: Overlay works on any website
- 🔒 **Channel-based**: Private rooms for different groups

## Quick Start

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Start Local Server

```bash
npm run dev
```

Server will run on `ws://localhost:8080`

### 3. Load Extension

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (top right)
3. Click "Load unpacked"
4. Select the `multiplayer-extension` folder

### 4. Test It Out

1. Navigate to any website (e.g., `https://example.com`)
2. Click the extension icon
3. Enter a channel name: `test`
4. Enter your username
5. Click "Join"
6. Open another Chrome window/tab and join the same channel to see multiplayer in action!

## Controls

- **Arrow Keys**: Move in any direction (up/down/left/right)
- **Space**: Speed boost (hold while moving for 2x speed)
- **Shift**: Hold to show emoji picker above your character
- **1-9**: Send emoji reactions (can spam continuously!)
  - 1: 👋
  - 2: 😀
  - 3: ❤️
  - 4: 🎉
  - 5: 😂
  - 6: 👍
  - 7: 🔥
  - 8: ⭐
  - 9: 💯
- **Enter**: Open chat window
- **ESC**: Close chat window

## Deploy to Production

Want to test with friends? Deploy the server to Railway or Render for free!

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions.

**Quick Deploy:**
1. Push code to GitHub
2. Deploy to [Railway](https://railway.app) or [Render](https://render.com)
3. Update `PRODUCTION_WS_URL` in `src/shared/constants.js`
4. Set `USE_PRODUCTION = true`
5. Reload extension

## Project Structure

```
multiplayer-extension/
├── manifest.json          # Extension configuration
├── DEPLOYMENT.md          # Deployment guide
├── src/
│   ├── background/       # Service worker
│   ├── content/         # Content scripts (overlay, game loop, rendering)
│   ├── popup/           # Extension popup UI
│   ├── shared/          # Shared code (constants, player, networking)
│   └── assets/          # Icons and sprites
└── server/              # WebSocket server
    ├── server.js          # Entry point
    ├── channel-manager.js # Channel/room management
    └── message-handler.js # Message routing
```

## Tech Stack

- **Frontend**: Chrome Extension (Manifest V3), Canvas API
- **Backend**: Node.js, WebSocket (ws library)
- **Game Loop**: Fixed timestep (60 FPS)
- **Network**: Client-side prediction with server authority
- **Performance**: Viewport culling, distance-based LOD

## Development

### Local Development

```bash
# Terminal 1: Start server
cd server
npm run dev

# Terminal 2: Make changes to extension
# Reload extension in chrome://extensions/
```

### Production Mode

```bash
cd server
npm start  # Sets NODE_ENV=production
```

## Troubleshooting

**Extension not appearing:**
- Check `chrome://extensions/` for errors
- Make sure Developer mode is enabled
- Try reloading the extension

**Can't connect to server:**
- Make sure server is running (`npm run dev`)
- Check console for WebSocket errors
- Verify `WS_URL` in `src/shared/constants.js`

**Characters not syncing:**
- Both users must be in the same channel
- Check server logs for connection messages
- Verify both clients are connected to the same server URL

## Future Enhancements

- [ ] Character sprite customization
- [ ] Multiple level layouts
- [ ] Persistent user profiles
- [ ] Channel passwords
- [ ] Voice chat
- [ ] Particle effects
- [ ] Sound effects
- [ ] Collectibles and power-ups

## License

MIT

## Credits

Built with ❤️ for real-time multiplayer fun
