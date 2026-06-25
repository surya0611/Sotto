const fs = require('fs');
const { createCanvas } = require('canvas');

const size = 64; // Smaller size
const canvas = createCanvas(size, size);
const ctx = canvas.getContext('2d');
const imgData = ctx.createImageData(size, size);
const data = imgData.data;

for (let i = 0; i < data.length; i += 4) {
  // Grayscale noise, fewer distinct values (quantized)
  const val = Math.floor(Math.random() * 4) * 64; // 0, 64, 128, 192
  data[i] = val;
  data[i+1] = val;
  data[i+2] = val;
  data[i+3] = 120; // Semi-transparent
}

ctx.putImageData(imgData, 0, 0);

const buffer = canvas.toBuffer('image/png', { compressionLevel: 9, filters: canvas.PNG_FILTER_NONE });
const base64 = 'data:image/png;base64,' + buffer.toString('base64');
console.log(base64.length + " bytes");
fs.writeFileSync('noise_small.txt', base64);
