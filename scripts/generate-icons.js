/* eslint-disable @typescript-eslint/no-require-imports -- standalone Node
   tooling script run directly via `node`, outside the app's ESM/bundler
   setup, so plain require() rather than import is intentional here. */
// Regenerates every derived icon asset from assets/brand/logo-source.png.
// Requires sharp and png-to-ico, which aren't project dependencies (only
// needed for this one-off/occasional task) — install them first:
//   npm install --no-save sharp png-to-ico
// Then: node scripts/generate-icons.js
const path = require("path");
const fs = require("fs");
const sharp = require("sharp");
const pngToIco = require("png-to-ico").default;

const ROOT = path.join(__dirname, "..");
const SRC = path.join(ROOT, "assets/brand/logo-source.png");
const APP_DIR = path.join(ROOT, "src/app");
const PUBLIC_ICONS_DIR = path.join(ROOT, "public/icons");
const PORCELAIN = { r: 0xfd, g: 0xff, b: 0xfc, alpha: 1 };

fs.mkdirSync(PUBLIC_ICONS_DIR, { recursive: true });

// Square, transparent-background master with the flame centered and padded
// (content ~80% of canvas) — used for general favicon/PWA "any"-purpose icons.
async function squareTransparent(size, contentRatio) {
  const contentSize = Math.round(size * contentRatio);
  const flame = await sharp(SRC)
    .resize(contentSize, contentSize, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();
  return sharp({
    create: { width: size, height: size, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite([{ input: flame, gravity: "center" }])
    .png()
    .toBuffer();
}

// Square, solid-background version — for apple-icon (iOS dislikes transparency)
// and maskable PWA icons (need a solid fill + extra safe-zone padding so the
// OS's circle/squircle mask never clips into transparent nothingness).
async function squareSolid(size, contentRatio, background) {
  const contentSize = Math.round(size * contentRatio);
  const flame = await sharp(SRC)
    .resize(contentSize, contentSize, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();
  return sharp({
    create: { width: size, height: size, channels: 4, background },
  })
    .composite([{ input: flame, gravity: "center" }])
    .png()
    .toBuffer();
}

async function main() {
  // src/app/icon.png — Next.js auto-detects, generates <link rel="icon">.
  fs.writeFileSync(path.join(APP_DIR, "icon.png"), await squareTransparent(512, 0.82));

  // src/app/apple-icon.png — solid background, no transparency.
  fs.writeFileSync(path.join(APP_DIR, "apple-icon.png"), await squareSolid(180, 0.78, PORCELAIN));

  // src/app/favicon.ico — real multi-resolution ICO, not a renamed PNG.
  const fav16 = await squareTransparent(16, 0.82);
  const fav32 = await squareTransparent(32, 0.82);
  const fav48 = await squareTransparent(48, 0.82);
  fs.writeFileSync(path.join(APP_DIR, "favicon.ico"), await pngToIco([fav16, fav32, fav48]));

  // public/icons — PWA manifest icons.
  fs.writeFileSync(path.join(PUBLIC_ICONS_DIR, "icon-192.png"), await squareTransparent(192, 0.82));
  fs.writeFileSync(path.join(PUBLIC_ICONS_DIR, "icon-512.png"), await squareTransparent(512, 0.82));
  // Maskable: extra padding (content well within the ~80% safe-zone circle) + solid bg.
  fs.writeFileSync(
    path.join(PUBLIC_ICONS_DIR, "icon-maskable-512.png"),
    await squareSolid(512, 0.6, PORCELAIN),
  );

  // A slightly larger square transparent source for the inline wordmark icon
  // (rendered small via CSS, but a crisp source avoids upscaling blur).
  fs.writeFileSync(path.join(PUBLIC_ICONS_DIR, "wordmark-icon.png"), await squareTransparent(256, 0.92));

  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
