// Canvas overlay manager

window.OverlayManager = class OverlayManager {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.isActive = false;
  }

  initialize() {
    this.createCanvas();
    this.attachEventListeners();
    this.isActive = true;
  }

  createCanvas() {
    this.canvas = document.createElement('canvas');
    this.canvas.id = 'multiplayer-overlay-canvas';

    // Fixed position overlay
    this.canvas.style.position = 'fixed';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.canvas.style.width = '100vw';
    this.canvas.style.height = '100vh';
    this.canvas.style.zIndex = '2147483647'; // Maximum z-index
    this.canvas.style.pointerEvents = 'none'; // Clicks pass through

    // Set canvas dimensions
    this.updateDimensions();

    // Get context
    this.ctx = this.canvas.getContext('2d');

    // Append to body
    document.body.appendChild(this.canvas);
  }

  updateDimensions() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  attachEventListeners() {
    window.addEventListener('resize', () => this.handleResize());
  }

  handleResize() {
    this.updateDimensions();
  }

  destroy() {
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
    this.isActive = false;
  }
}
