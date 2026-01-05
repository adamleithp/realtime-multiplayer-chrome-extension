// Chat window component

window.ChatWindow = class ChatWindow {
  constructor(onSendMessage) {
    this.onSendMessage = onSendMessage;
    this.isOpen = false;
    this.messages = [];
    this.container = null;
    this.messagesList = null;
    this.input = null;
  }

  initialize() {
    this.createWindow();
  }

  createWindow() {
    this.container = document.createElement('div');
    this.container.id = 'multiplayer-chat-window';
    this.container.style.cssText = `
      position: fixed;
      right: 20px;
      bottom: 20px;
      width: 300px;
      height: 400px;
      background: rgba(0, 0, 0, 0.85);
      border: 2px solid rgba(102, 126, 234, 0.8);
      border-radius: 12px;
      z-index: 2147483647;
      display: none;
      flex-direction: column;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      backdrop-filter: blur(10px);
      pointer-events: auto;
    `;

    // Header
    const header = document.createElement('div');
    header.style.cssText = `
      padding: 12px 16px;
      background: rgba(102, 126, 234, 0.3);
      border-bottom: 1px solid rgba(102, 126, 234, 0.5);
      color: white;
      font-weight: 600;
      font-size: 14px;
      border-radius: 10px 10px 0 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    `;
    header.innerHTML = `
      <span>Chat</span>
      <span style="font-size: 11px; opacity: 0.7;">ESC to close</span>
    `;

    // Messages list
    this.messagesList = document.createElement('div');
    this.messagesList.style.cssText = `
      flex: 1;
      overflow-y: auto;
      padding: 12px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    `;

    // Input container
    const inputContainer = document.createElement('div');
    inputContainer.style.cssText = `
      padding: 12px;
      border-top: 1px solid rgba(102, 126, 234, 0.3);
    `;

    this.input = document.createElement('input');
    this.input.type = 'text';
    this.input.placeholder = 'Type a message... (Enter to send)';
    this.input.maxLength = 200;
    this.input.style.cssText = `
      width: 100%;
      padding: 10px;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 6px;
      color: white !important;
      font-size: 13px;
      outline: none;
      box-sizing: border-box;
    `;

    // Placeholder styling
    const style = document.createElement('style');
    style.textContent = `
      #multiplayer-chat-window input::placeholder {
        color: rgba(255, 255, 255, 0.5) !important;
      }
      #multiplayer-chat-window::-webkit-scrollbar {
        width: 6px;
      }
      #multiplayer-chat-window::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.05);
        border-radius: 3px;
      }
      #multiplayer-chat-window::-webkit-scrollbar-thumb {
        background: rgba(102, 126, 234, 0.5);
        border-radius: 3px;
      }
    `;
    document.head.appendChild(style);

    inputContainer.appendChild(this.input);

    this.container.appendChild(header);
    this.container.appendChild(this.messagesList);
    this.container.appendChild(inputContainer);

    document.body.appendChild(this.container);

    // Event listeners
    this.input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.sendMessage();
      }
    });
  }

  toggle() {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.show();
    } else {
      this.hide();
    }
  }

  show() {
    this.isOpen = true;
    this.container.style.display = 'flex';
    this.input.focus();
    this.scrollToBottom();
  }

  hide() {
    this.isOpen = false;
    this.container.style.display = 'none';
    this.input.value = '';
  }

  sendMessage() {
    const text = this.input.value.trim();
    if (text && this.onSendMessage) {
      this.onSendMessage(text);
      this.input.value = '';
    }
  }

  addMessage(username, text, color, isLocal = false) {
    const messageEl = document.createElement('div');
    messageEl.style.cssText = `
      padding: 8px 10px;
      background: ${isLocal ? 'rgba(102, 126, 234, 0.3)' : 'rgba(255, 255, 255, 0.1)'};
      border-radius: 6px;
      border-left: 3px solid ${color};
      animation: slideIn 0.2s ease-out;
    `;

    const usernameEl = document.createElement('div');
    usernameEl.style.cssText = `
      font-weight: 600;
      font-size: 12px;
      color: ${color};
      margin-bottom: 4px;
    `;
    usernameEl.textContent = username;

    const textEl = document.createElement('div');
    textEl.style.cssText = `
      font-size: 13px;
      color: rgba(255, 255, 255, 0.95);
      word-wrap: break-word;
    `;
    textEl.textContent = text;

    messageEl.appendChild(usernameEl);
    messageEl.appendChild(textEl);

    this.messagesList.appendChild(messageEl);
    this.messages.push({ username, text, color, timestamp: Date.now() });

    // Limit message history
    if (this.messages.length > 50) {
      this.messages.shift();
      if (this.messagesList.firstChild) {
        this.messagesList.removeChild(this.messagesList.firstChild);
      }
    }

    this.scrollToBottom();
  }

  scrollToBottom() {
    this.messagesList.scrollTop = this.messagesList.scrollHeight;
  }

  destroy() {
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
  }
};
