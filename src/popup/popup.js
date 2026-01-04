// Popup logic for joining a channel

const form = document.getElementById('joinForm');
const channelInput = document.getElementById('channelId');
const usernameInput = document.getElementById('username');
const statusDiv = document.getElementById('status');

// Load saved values
chrome.storage.local.get(['channelId', 'username'], (result) => {
  if (result.channelId) channelInput.value = result.channelId;
  if (result.username) usernameInput.value = result.username;
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const channelId = channelInput.value.trim();
  const username = usernameInput.value.trim();

  if (!channelId || !username) {
    showStatus('Please fill in all fields', 'error');
    return;
  }

  // Generate random color for player
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'];
  const color = colors[Math.floor(Math.random() * colors.length)];

  // Save to storage
  await chrome.storage.local.set({ channelId, username, color });

  try {
    // Get active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab) {
      showStatus('No active tab found', 'error');
      return;
    }

    // Send message to background script to inject content script
    chrome.runtime.sendMessage(
      {
        action: 'injectContentScript',
        tabId: tab.id,
      },
      (response) => {
        if (chrome.runtime.lastError) {
          showStatus('Error: ' + chrome.runtime.lastError.message, 'error');
        } else if (response && response.success) {
          showStatus(`Joined channel "${channelId}"!`, 'success');
          setTimeout(() => window.close(), 1500);
        } else {
          showStatus('Failed to inject content script', 'error');
        }
      }
    );
  } catch (error) {
    showStatus('Error: ' + error.message, 'error');
  }
});

function showStatus(message, type) {
  statusDiv.textContent = message;
  statusDiv.className = `status ${type}`;
}
