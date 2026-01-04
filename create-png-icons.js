// Create minimal PNG icons from base64
// This creates tiny placeholder PNGs that allow the extension to load

const fs = require('fs');
const path = require('path');

// Minimal 16x16 transparent PNG (base64 encoded)
const png16Base64 = 'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH4wECAAsGRLbm7wAAABl0RVh0Q29tbWVudABDcmVhdGVkIHdpdGggR0lNUFeBDhcAAAAkSURBVDjLY/j//z8DJYCJgUIwqmFUw6gGmmkgxwBSNFCkgQEAW40FD8sJLtEAAAAASUVORK5CYII=';

// Minimal 48x48 transparent PNG (base64 encoded)
const png48Base64 = 'iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH4wECAAwIvPjXGAAAABl0RVh0Q29tbWVudABDcmVhdGVkIHdpdGggR0lNUFeBDhcAAAAsSURBVGje7dAxAQAACAMg+DfbA09ASQIAAAAAAAAAAAAAAAAAAAAwUgCbFQAk7UG6xgAAAABJRU5ErkJggg==';

// Minimal 128x128 transparent PNG (base64 encoded)
const png128Base64 = 'iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH4wECAAwXrUtpGwAAABl0RVh0Q29tbWVudABDcmVhdGVkIHdpdGggR0lNUFeBDhcAAAA0SURBVHja7cExAQAAAMKg9U9tCU8gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAeAMeEAABrfZoRwAAAABJRU5ErkJggg==';

const iconsDir = path.join(__dirname, 'src', 'assets', 'icons');

// Create PNG files from base64
const icons = [
  { size: 16, data: png16Base64 },
  { size: 48, data: png48Base64 },
  { size: 128, data: png128Base64 }
];

icons.forEach(icon => {
  const buffer = Buffer.from(icon.data, 'base64');
  const filename = path.join(iconsDir, `icon${icon.size}.png`);
  fs.writeFileSync(filename, buffer);
  console.log(`Created ${filename}`);
});

console.log('\nPlaceholder PNG icons created!');
console.log('The extension should now load in Chrome.');
console.log('For better icons, open create-icons.html in a browser.');
