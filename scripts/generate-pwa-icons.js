import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const svgPath = path.resolve('public/vodafone-icon.svg');
const svgBuffer = fs.readFileSync(svgPath);

// Maskable SVG with safe margin (80% scale centered on #E60000 background)
const maskableSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <rect width="512" height="512" fill="#E60000" />
  <g transform="translate(64, 64) scale(3.84)">
    <circle cx="50" cy="50" r="48" fill="#E60000" />
    <path d="M 22.13 47.41 c 0.29 18.97 14.37 30.75 28.16 30.75 16.95 -0.29 27.01 -14.08 26.72 -27.01 0 -12.64 -6.9 -21.84 -22.13 -25.57 0 0 0 -0.29 0 -0.86 0 -9.48 7.18 -18.1 16.38 -19.83 -0.86 -0.29 -2.3 -0.57 -3.74 -0.57 -10.34 0.29 -21.84 4.6 -30.17 11.49 -8.33 7.18 -15.23 19.25 -15.23 31.61 z" fill="#FFFFFF" />
  </g>
</svg>
`;

async function generateIcons() {
  // 192x192
  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile(path.resolve('public/pwa-192x192.png'));
  console.log('Generated public/pwa-192x192.png');

  // 512x512
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.resolve('public/pwa-512x512.png'));
  console.log('Generated public/pwa-512x512.png');

  // 512x512 maskable
  await sharp(Buffer.from(maskableSvg))
    .resize(512, 512)
    .png()
    .toFile(path.resolve('public/pwa-maskable-512x512.png'));
  console.log('Generated public/pwa-maskable-512x512.png');

  // 180x180 apple touch icon
  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile(path.resolve('public/apple-touch-icon.png'));
  console.log('Generated public/apple-touch-icon.png');
}

generateIcons().catch(err => {
  console.error(err);
  process.exit(1);
});
