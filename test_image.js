const fs = require('fs');
const { loadImage } = require('canvas');

async function check() {
  const img = await loadImage('/Users/suryapratapsingh/.gemini/antigravity/brain/6b818a91-b559-4ac0-ba30-34d88974d736/crumpled_paper_seamless_1782384140509.png');
  console.log(`Image loaded: ${img.width}x${img.height}`);
}
check();
