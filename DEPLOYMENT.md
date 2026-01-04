# Deployment Guide

This guide will help you deploy the multiplayer WebSocket server to production so you can test with real users.

## Recommended Hosting Platforms

Both platforms offer free tiers and work great with WebSocket:

### Option 1: Railway (Recommended)
- Free tier: $5/month credit (enough for testing)
- Automatic SSL/TLS (wss://)
- Easy deployment from GitHub
- Great for WebSocket applications

### Option 2: Render
- Free tier available
- Automatic SSL/TLS (wss://)
- Easy deployment from GitHub
- Includes `render.yaml` config

---

## Deployment Steps

### A. Deploy to Railway

1. **Create Railway Account**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Connect your GitHub account if needed
   - Select your repository

3. **Configure Service**
   - Railway will auto-detect Node.js
   - It will automatically use `npm start` from package.json
   - No additional configuration needed!

4. **Get WebSocket URL**
   - Once deployed, go to Settings tab
   - Click "Generate Domain"
   - Your URL will be something like: `your-app-name.up.railway.app`
   - Note: Railway provides SSL automatically, so use `wss://` protocol

5. **Update Extension**
   - Open `src/shared/constants.js`
   - Update line 10: `const PRODUCTION_WS_URL = 'wss://your-app-name.up.railway.app';`
   - Update line 11: `const USE_PRODUCTION = true;`
   - Reload extension in Chrome

---

### B. Deploy to Render

1. **Create Render Account**
   - Go to [render.com](https://render.com)
   - Sign up with GitHub

2. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the repository

3. **Configure Service**
   - Name: `multiplayer-server`
   - Environment: `Node`
   - Build Command: `cd server && npm install`
   - Start Command: `cd server && npm start`
   - Plan: Free

4. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment (2-3 minutes)

5. **Get WebSocket URL**
   - Your URL will be: `your-app-name.onrender.com`
   - Note: Render provides SSL automatically, so use `wss://` protocol

6. **Update Extension**
   - Open `src/shared/constants.js`
   - Update line 10: `const PRODUCTION_WS_URL = 'wss://your-app-name.onrender.com';`
   - Update line 11: `const USE_PRODUCTION = true;`
   - Reload extension in Chrome

---

## Testing Production Deployment

1. **Reload Extension**
   - Go to `chrome://extensions/`
   - Click the reload icon on your extension

2. **Test Connection**
   - Open DevTools (F12)
   - Click the extension icon
   - Enter a channel name and username
   - Click "Join"
   - Check console for: "WebSocket connected, joining channel..."

3. **Test Multiplayer**
   - Share the extension with a friend
   - Both join the same channel
   - You should see each other's characters!

4. **Check Server Logs**
   - Railway: Go to Deployments → Click latest → View Logs
   - Render: Go to Logs tab
   - You should see "Client connected" messages

---

## Troubleshooting

### "WebSocket connection failed"
- Make sure you're using `wss://` (not `ws://`) in production
- Check that `USE_PRODUCTION = true` in constants.js
- Verify the server is running in Railway/Render dashboard

### "Server not responding"
- Check server logs for errors
- Render free tier may sleep after inactivity (takes 30s to wake up)
- Railway should be instant

### "Extension not connecting to production"
- Make sure you reloaded the extension after changing constants.js
- Clear browser cache and reload
- Check DevTools console for WebSocket errors

---

## Switching Between Dev and Production

**For Local Testing:**
```javascript
// In src/shared/constants.js
const USE_PRODUCTION = false; // Use localhost:8080
```

**For Production Testing:**
```javascript
// In src/shared/constants.js
const USE_PRODUCTION = true; // Use Railway/Render
```

---

## Important Notes

1. **SSL/TLS**: Both Railway and Render provide automatic SSL certificates, so always use `wss://` for production

2. **Free Tier Limits**:
   - Railway: $5/month credit (~100-200 hours)
   - Render: Free tier may sleep after 15 minutes of inactivity

3. **Scaling**: For production with many users, consider:
   - Railway Pro plan ($20/month)
   - Render paid plans
   - Or deploy to your own VPS (DigitalOcean, Linode, etc.)

4. **Security**: For production, consider adding:
   - Rate limiting
   - Channel password protection
   - User authentication

---

## Next Steps

Once deployed:
1. Share the extension with friends to test multiplayer
2. Monitor server logs for any issues
3. Consider adding features like:
   - Channel passwords
   - User profiles
   - Custom sprite selection
   - Leaderboards

Happy multiplayer coding! 🎮
