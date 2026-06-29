const fs = require('fs');
const { createCanvas, loadImage } = require('canvas');

async function processImage() {
  const imagePath = '/Users/suryapratapsingh/.gemini/antigravity/brain/6b818a91-b559-4ac0-ba30-34d88974d736/micro_paper_texture_1782717099634.png';
  const img = await loadImage(imagePath);
  
  const SIZE = 128; // Smaller tile size!
  const canvas = createCanvas(SIZE, SIZE);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, SIZE, SIZE);
  
  const imgData = ctx.getImageData(0, 0, SIZE, SIZE);
  
  let min = 255;
  let max = 0;
  for (let i = 0; i < imgData.data.length; i += 4) {
    const avg = (imgData.data[i] + imgData.data[i + 1] + imgData.data[i + 2]) / 3;
    if (avg < min) min = avg;
    if (avg > max) max = avg;
  }
  
  for (let i = 0; i < imgData.data.length; i += 4) {
    const avg = (imgData.data[i] + imgData.data[i + 1] + imgData.data[i + 2]) / 3;
    const normalized = (avg - min) / (max - min); 
    
    imgData.data[i] = 0;
    imgData.data[i+1] = 0;
    imgData.data[i+2] = 0;
    
    // Aggressive curve: anything above 0.5 becomes 0 (completely transparent)
    let alpha = 0;
    if (normalized < 0.8) {
       alpha = (0.8 - normalized) * 255 * 1.5;
       if (alpha > 255) alpha = 255;
    }
    
    // Quantize alpha to 4 levels (0, 85, 170, 255)
    alpha = Math.round(alpha / 85) * 85;
    
    imgData.data[i+3] = alpha; 
  }
  ctx.putImageData(imgData, 0, 0);
  
  const buf = canvas.toBuffer('image/png', { compressionLevel: 9 });
  console.log(`Compressed Size: ${(buf.length/1024).toFixed(2)} KB`);
  fs.writeFileSync('src/lib/textures.ts', `export const PAPER_TEXTURE = "data:image/png;base64,${buf.toString('base64')}";\n`);
}

processImage();
