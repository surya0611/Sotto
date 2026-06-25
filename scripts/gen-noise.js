const fs = require('fs');
const { createCanvas } = require('canvas');

// Generate 128x128 noise texture
const size = 128;
const canvas = createCanvas(size, size);
const ctx = canvas.getContext('2d');
const imgData = ctx.createImageData(size, size);
const data = imgData.data;

for (let i = 0; i < data.length; i += 4) {
  // Simple monochrome noise
  const value = Math.floor(Math.random() * 256);
  data[i] = value;     // R
  data[i + 1] = value; // G
  data[i + 2] = value; // B
  data[i + 3] = 255;   // A
}

ctx.putImageData(imgData, 0, 0);

const buffer = canvas.toBuffer('image/png', { compressionLevel: 9 }); // Max compression
console.log('data:image/png;base64,' + buffer.toString('base64'));
