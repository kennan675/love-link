import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const SOURCE_IMAGE = 'C:/Users/pc/.gemini/antigravity/brain/1c9c9211-4cb8-4406-99b5-20c4142cd364/.user_uploaded/media_1790329704714.jpg';
const RES_DIR = path.resolve('android/app/src/main/res');

// Density mappings for Android icons
const MIPMAP_CONFIG = [
  { dir: 'mipmap-mdpi', launcher: 48, round: 48, foreground: 108 },
  { dir: 'mipmap-hdpi', launcher: 72, round: 72, foreground: 162 },
  { dir: 'mipmap-xhdpi', launcher: 96, round: 96, foreground: 216 },
  { dir: 'mipmap-xxhdpi', launcher: 144, round: 144, foreground: 324 },
  { dir: 'mipmap-xxxhdpi', launcher: 192, round: 192, foreground: 432 },
];

// Splash screen mappings (width x height)
const SPLASH_CONFIG = [
  { file: 'drawable/splash.png', width: 480, height: 320, isLand: true },
  { file: 'drawable-port-mdpi/splash.png', width: 320, height: 480, isLand: false },
  { file: 'drawable-port-hdpi/splash.png', width: 480, height: 800, isLand: false },
  { file: 'drawable-port-xhdpi/splash.png', width: 720, height: 1280, isLand: false },
  { file: 'drawable-port-xxhdpi/splash.png', width: 960, height: 1600, isLand: false },
  { file: 'drawable-port-xxxhdpi/splash.png', width: 1280, height: 1920, isLand: false },
  { file: 'drawable-land-mdpi/splash.png', width: 480, height: 320, isLand: true },
  { file: 'drawable-land-hdpi/splash.png', width: 800, height: 480, isLand: true },
  { file: 'drawable-land-xhdpi/splash.png', width: 1280, height: 720, isLand: true },
  { file: 'drawable-land-xxhdpi/splash.png', width: 1600, height: 960, isLand: true },
  { file: 'drawable-land-xxxhdpi/splash.png', width: 1920, height: 1280, isLand: true },
];

async function generateAssets() {
  console.log('Generating Android icons and splash screens...');

  // 1. Generate Mipmap Icons
  for (const cfg of MIPMAP_CONFIG) {
    const targetDir = path.join(RES_DIR, cfg.dir);
    if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

    // ic_launcher.png (square with clean white background)
    // Logo takes ~86% of the square
    const squareInnerSize = Math.round(cfg.launcher * 0.88);
    const innerSquareLogo = await sharp(SOURCE_IMAGE)
      .resize(squareInnerSize, squareInnerSize, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
      .toBuffer();

    await sharp({
      create: {
        width: cfg.launcher,
        height: cfg.launcher,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      }
    })
      .composite([{ input: innerSquareLogo, gravity: 'center' }])
      .png()
      .toFile(path.join(targetDir, 'ic_launcher.png'));

    // ic_launcher_round.png (round icon with white circle mask)
    const roundInnerSize = Math.round(cfg.round * 0.72);
    const innerRoundLogo = await sharp(SOURCE_IMAGE)
      .resize(roundInnerSize, roundInnerSize, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
      .toBuffer();

    // Circle SVG mask
    const circleMask = Buffer.from(
      `<svg width="${cfg.round}" height="${cfg.round}"><circle cx="${cfg.round / 2}" cy="${cfg.round / 2}" r="${cfg.round / 2}" fill="black"/></svg>`
    );

    const roundBase = await sharp({
      create: {
        width: cfg.round,
        height: cfg.round,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      }
    })
      .composite([{ input: innerRoundLogo, gravity: 'center' }])
      .png()
      .toBuffer();

    await sharp(roundBase)
      .composite([{ input: circleMask, blend: 'dest-in' }])
      .png()
      .toFile(path.join(targetDir, 'ic_launcher_round.png'));

    // ic_launcher_foreground.png (Adaptive icon foreground)
    // Official Android spec: safe area is center 66% (72dp of 108dp).
    // Let's size logo to 68% of foreground canvas so it fits perfectly in all shapes without clipping.
    const fgInnerSize = Math.round(cfg.foreground * 0.68);
    const innerFgLogo = await sharp(SOURCE_IMAGE)
      .resize(fgInnerSize, fgInnerSize, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
      .toBuffer();

    await sharp({
      create: {
        width: cfg.foreground,
        height: cfg.foreground,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      }
    })
      .composite([{ input: innerFgLogo, gravity: 'center' }])
      .png()
      .toFile(path.join(targetDir, 'ic_launcher_foreground.png'));

    console.log(`Generated icons for ${cfg.dir}`);
  }

  // 2. Generate Splash Screens
  for (const splash of SPLASH_CONFIG) {
    const splashPath = path.join(RES_DIR, splash.file);
    const dir = path.dirname(splashPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    // Logo size: 65% of shorter dimension
    const minDim = Math.min(splash.width, splash.height);
    const logoSize = Math.round(minDim * 0.65);

    const resizedLogo = await sharp(SOURCE_IMAGE)
      .resize(logoSize, logoSize, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
      .toBuffer();

    await sharp({
      create: {
        width: splash.width,
        height: splash.height,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      }
    })
      .composite([{ input: resizedLogo, gravity: 'center' }])
      .png()
      .toFile(splashPath);

    console.log(`Generated splash: ${splash.file} (${splash.width}x${splash.height})`);
  }

  // 3. Web & App Assets
  await sharp(SOURCE_IMAGE)
    .resize(512, 512, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .png()
    .toFile(path.resolve('src/assets/blacklovelink-logo-icon.png'));

  await sharp(SOURCE_IMAGE)
    .resize(512, 512, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .png()
    .toFile(path.resolve('src/assets/blacklovelink-logo.png'));

  await sharp(SOURCE_IMAGE)
    .resize(512, 512, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .png()
    .toFile(path.resolve('public/blacklovelink-logo.png'));

  console.log('Web and app logo assets updated successfully!');
}

generateAssets().catch(err => {
  console.error('Asset generation failed:', err);
  process.exit(1);
});
