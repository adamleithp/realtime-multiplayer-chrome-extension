// Background service worker for content script injection

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'injectContentScript') {
    // Inject all scripts in order
    const scripts = [
      'src/shared/constants.js',
      'src/shared/message-types.js',
      'src/shared/player.js',
      'src/shared/level.js',
      'src/shared/sprite-manager.js',
      'src/content/overlay.js',
      'src/content/websocket-client.js',
      'src/content/game-loop.js',
      'src/content/renderer.js',
      'src/content/chat-window.js',
      'src/content/input-handler.js',
      'src/content/index.js',
    ];

    chrome.scripting
      .executeScript({
        target: { tabId: request.tabId },
        files: scripts,
      })
      .then(() => {
        sendResponse({ success: true });
      })
      .catch((error) => {
        console.error('Error injecting content script:', error);
        sendResponse({ success: false, error: error.message });
      });

    // Return true to indicate async response
    return true;
  }
});
