import sharp from "sharp";
import fs from "fs/promises";
import path from "path";

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

async function generateIcons() {
  try {
    // Ensure icons directory exists
    await fs.mkdir("./public/icons", { recursive: true });

    // Generate PNG icons from SVG
    for (const size of sizes) {
      await sharp("./public/icons/icon.svg")
        .resize(size, size)
        .png({ quality: 90 })
        .toFile(`./public/icons/icon-${size}x${size}.png`);

      console.log(`Generated icon-${size}x${size}.png`);
    }

    // Also generate favicon.ico from multiple sizes
    const images = sizes.map((size) =>
      sharp(`./public/icons/icon-${size}x${size}.png`)
        .resize(size, size)
        .toBuffer()
    );

    const buffers = await Promise.all(images);

    await sharp(buffers[0]).png().toFile("./public/favicon.ico");

    console.log("Generated favicon.ico");

    console.log("All icons generated successfully!");
  } catch (error) {
    console.error("Error generating icons:", error);
  }
}

generateIcons();
