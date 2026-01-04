// Sprite loading and animation manager

window.SpriteManager = class SpriteManager {
  constructor() {
    this.sprites = {};
    this.config = null;
    this.loaded = false;
    this.frameCache = new Map();
  }

  async load(configPath) {
    try {
      const configUrl = chrome.runtime.getURL(configPath);
      const response = await fetch(configUrl);
      this.config = await response.json();

      const loadPromises = Object.keys(this.config).map(async (animName) => {
        const anim = this.config[animName];
        const img = new Image();
        img.src = chrome.runtime.getURL(`src/assets/sprites/${anim.image}`);
        await img.decode();
        this.sprites[animName] = img;
      });

      await Promise.all(loadPromises);
      this.loaded = true;
      console.log('Sprites loaded successfully');
    } catch (error) {
      console.error('Error loading sprites:', error);
      // Use fallback placeholder sprites
      this.createPlaceholderSprites();
      this.loaded = true;
    }
  }

  createPlaceholderSprites() {
    console.log('Creating placeholder sprites');

    this.config = {
      idle: { frameWidth: 32, frameHeight: 48, frameCount: 4, frameDuration: 200 },
      walk: { frameWidth: 32, frameHeight: 48, frameCount: 6, frameDuration: 100 },
      jump: { frameWidth: 32, frameHeight: 48, frameCount: 2, frameDuration: 150 },
    };

    // Create simple colored rectangle sprites
    Object.keys(this.config).forEach((animName) => {
      const anim = this.config[animName];
      const canvas = document.createElement('canvas');
      canvas.width = anim.frameWidth * anim.frameCount;
      canvas.height = anim.frameHeight;
      const ctx = canvas.getContext('2d');

      // Draw frames
      for (let i = 0; i < anim.frameCount; i++) {
        const x = i * anim.frameWidth;

        // Body (rectangle)
        ctx.fillStyle = '#4ECDC4';
        ctx.fillRect(x + 8, 16, 16, 24);

        // Head (circle)
        ctx.fillStyle = '#FFD93D';
        ctx.beginPath();
        ctx.arc(x + 16, 12, 8, 0, Math.PI * 2);
        ctx.fill();

        // Eyes
        ctx.fillStyle = '#333';
        ctx.fillRect(x + 13, 10, 2, 2);
        ctx.fillRect(x + 17, 10, 2, 2);

        // Legs (animation variation)
        const legOffset = animName === 'walk' ? (i % 2 === 0 ? 2 : -2) : 0;
        ctx.fillStyle = '#4ECDC4';
        ctx.fillRect(x + 10 + legOffset, 40, 4, 8);
        ctx.fillRect(x + 18 - legOffset, 40, 4, 8);
      }

      this.sprites[animName] = canvas;
    });
  }

  getCurrentFrame(animationName, animationTime) {
    if (!this.loaded || !this.config[animationName]) {
      return null;
    }

    const anim = this.config[animationName];
    const frameIndex = Math.floor(animationTime / anim.frameDuration) % anim.frameCount;

    // Check cache
    const cacheKey = `${animationName}_${frameIndex}`;
    if (this.frameCache.has(cacheKey)) {
      return this.frameCache.get(cacheKey);
    }

    // Extract frame from sprite sheet
    const frame = this.extractFrame(animationName, frameIndex);
    this.frameCache.set(cacheKey, frame);

    return frame;
  }

  extractFrame(animationName, frameIndex) {
    const anim = this.config[animationName];
    const img = this.sprites[animationName];

    const canvas = document.createElement('canvas');
    canvas.width = anim.frameWidth;
    canvas.height = anim.frameHeight;
    const ctx = canvas.getContext('2d');

    ctx.drawImage(
      img,
      frameIndex * anim.frameWidth,
      0,
      anim.frameWidth,
      anim.frameHeight,
      0,
      0,
      anim.frameWidth,
      anim.frameHeight
    );

    return canvas;
  }

  getAnimationFrameCount(animationName) {
    return this.config[animationName]?.frameCount || 1;
  }

  getFrameDuration(animationName) {
    return this.config[animationName]?.frameDuration || 200;
  }
}
