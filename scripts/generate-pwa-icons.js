/**
 * Generates PWA icons from the brand logo.
 * Run: node scripts/generate-pwa-icons.js
 */
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const SOURCE = path.join(__dirname, "..", "public", "LOGO_DESIGN", "Logo", "Mark Prim.png");
const OUT_DIR = path.join(__dirname, "..", "public", "icons");

const SIZES = [
  { name: "icon-192x192.png", size: 192 },
  { name: "icon-512x512.png", size: 512 },
  { name: "icon-maskable-512x512.png", size: 512 },
];

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const logo = sharp(SOURCE);

  // For maskable icons, the safe zone is the inner 80% of the canvas.
  // Pad the logo so the content sits comfortably inside the safe zone.
  const maskable = sharp(SOURCE)
    .resize(409, 409)
    .extend({
      top: 51,
      bottom: 52,
      left: 51,
      right: 52,
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    })
    .png();

  for (const { name, size } of SIZES) {
    const outPath = path.join(OUT_DIR, name);
    if (name.includes("maskable")) {
      await maskable.clone().resize(size, size).toFile(outPath);
    } else {
      await logo.clone().resize(size, size).toFile(outPath);
    }
    console.log(`Generated ${outPath} (${size}x${size})`);
  }

  // Also generate an apple-touch-icon (180x180, no transparency).
  await logo
    .clone()
    .resize(180, 180)
    .flatten({ background: "#ffffff" })
    .png()
    .toFile(path.join(OUT_DIR, "apple-touch-icon.png"));
  console.log("Generated apple-touch-icon.png (180x180)");

  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});