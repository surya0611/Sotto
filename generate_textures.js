const fs = require('fs');
const { createCanvas } = require('canvas');

function generatePaper() {
  const canvas = createCanvas(256, 256);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, 256, 256);
  // generate a fake crumpled paper texture
  for(let i=0; i<100; i++) {
    ctx.beginPath();
    ctx.moveTo(Math.random()*256, Math.random()*256);
    ctx.lineTo(Math.random()*256, Math.random()*256);
    ctx.strokeStyle = `rgba(0,0,0,${Math.random()*0.05})`;
    ctx.lineWidth = Math.random()*3;
    ctx.stroke();
  }
  const buf = canvas.toBuffer('image/png', { compressionLevel: 9 });
  console.log(`Paper (256x256, 9 compression) size: ${(buf.length/1024).toFixed(2)} KB`);
  return buf.toString('base64');
}

function generateGrain() {
  const canvas = createCanvas(128, 128);
  const ctx = canvas.getContext('2d');
  const imgData = ctx.createImageData(128, 128);
  for (let i = 0; i < imgData.data.length; i += 4) {
    const val = Math.random() * 255;
    imgData.data[i] = val;
    imgData.data[i+1] = val;
    imgData.data[i+2] = val;
    imgData.data[i+3] = 25; // low opacity noise
  }
  ctx.putImageData(imgData, 0, 0);
  const buf = canvas.toBuffer('image/png', { compressionLevel: 9, filters: canvas.PNG_FILTER_NONE });
  console.log(`Grain (128x128 pure noise) size: ${(buf.length/1024).toFixed(2)} KB`);
  return buf.toString('base64');
}

generatePaper();
generateGrain();
