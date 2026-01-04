// Level class with platform data

window.Level = class Level {
  constructor() {
    // Get viewport height
    const viewportHeight = window.innerHeight;
    const groundY = viewportHeight - 60; // Ground 60px from bottom

    this.platforms = [
      // Full-width ground platform at the bottom
      { x: 0, y: groundY, width: window.innerWidth * 3, height: 60 },

      // Mid-level platforms (relative to ground)
      { x: 200, y: groundY - 150, width: 200, height: 20 },
      { x: 500, y: groundY - 200, width: 180, height: 20 },
      { x: 800, y: groundY - 250, width: 200, height: 20 },
      { x: 1100, y: groundY - 200, width: 180, height: 20 },

      // High platforms
      { x: 350, y: groundY - 300, width: 150, height: 20 },
      { x: 650, y: groundY - 350, width: 150, height: 20 },
      { x: 950, y: groundY - 400, width: 150, height: 20 },

      // Very high platform
      { x: 600, y: groundY - 500, width: 200, height: 20 },
    ];

    this.spawnPoints = [
      { x: 100, y: groundY - 100 },
      { x: 300, y: groundY - 100 },
      { x: 500, y: groundY - 100 },
      { x: 700, y: groundY - 100 },
      { x: 900, y: groundY - 100 },
    ];

    this.bounds = {
      minX: 0,
      maxX: window.innerWidth,
      minY: 0,
      maxY: viewportHeight,
    };
  }

  getRandomSpawnPoint() {
    const index = Math.floor(Math.random() * this.spawnPoints.length);
    return { ...this.spawnPoints[index] };
  }

  checkCollision(player, playerWidth, playerHeight) {
    // Check collision with platforms
    for (const platform of this.platforms) {
      // Only check if player is falling
      if (player.velocityY <= 0) continue;

      // Check if player is above platform
      const playerBottom = player.y + playerHeight;
      const playerLeft = player.x;
      const playerRight = player.x + playerWidth;

      const platformTop = platform.y;
      const platformLeft = platform.x;
      const platformRight = platform.x + platform.width;

      // Check horizontal overlap
      const horizontalOverlap = playerRight > platformLeft && playerLeft < platformRight;

      // Check if player is landing on platform
      const previousBottom = playerBottom - player.velocityY;
      const isLanding = previousBottom <= platformTop && playerBottom >= platformTop;

      if (horizontalOverlap && isLanding) {
        player.y = platformTop - playerHeight;
        player.velocityY = 0;
        player.isGrounded = true;
        return true;
      }
    }

    return false;
  }
}
