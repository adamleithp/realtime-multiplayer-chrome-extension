// Generate extension icons using Node.js canvas
// Run: node generate-icons.js

const fs = require('fs');
const path = require('path');

// Create a simple SVG icon
function createSVGIcon(size) {
  const scale = size / 128;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="${size}" height="${size}" fill="url(#grad)" rx="${4 * scale}"/>

  <!-- Character 1 -->
  <circle cx="${40 * scale}" cy="${50 * scale}" r="${15 * scale}" fill="#FFD93D"/>
  <rect x="${32 * scale}" y="${65 * scale}" width="${16 * scale}" height="${24 * scale}" fill="#4ECDC4" rx="${2 * scale}"/>
  <circle cx="${36 * scale}" cy="${47 * scale}" r="${2 * scale}" fill="#333"/>
  <circle cx="${44 * scale}" cy="${47 * scale}" r="${2 * scale}" fill="#333"/>

  <!-- Character 2 -->
  <circle cx="${88 * scale}" cy="${50 * scale}" r="${15 * scale}" fill="#FFD93D"/>
  <rect x="${80 * scale}" y="${65 * scale}" width="${16 * scale}" height="${24 * scale}" fill="#FF6B6B" rx="${2 * scale}"/>
  <circle cx="${84 * scale}" cy="${47 * scale}" r="${2 * scale}" fill="#333"/>
  <circle cx="${92 * scale}" cy="${47 * scale}" r="${2 * scale}" fill="#333"/>
</svg>`;
}

// Create icons directory if it doesn't exist
const iconsDir = path.join(__dirname, 'src', 'assets', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Generate SVG files (can be used as placeholders)
[16, 48, 128].forEach(size => {
  const svg = createSVGIcon(size);
  const filename = path.join(iconsDir, `icon${size}.svg`);
  fs.writeFileSync(filename, svg);
  console.log(`Created ${filename}`);
});

console.log('\nSVG icons created!');
console.log('To convert to PNG, you can:');
console.log('1. Open create-icons.html in a browser and download PNG versions');
console.log('2. Use an online SVG to PNG converter');
console.log('3. Use ImageMagick: convert icon.svg icon.png');
console.log('\nFor now, you can rename the .svg files to .png to test the extension.');
