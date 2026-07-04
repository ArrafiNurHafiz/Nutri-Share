import sharp from "sharp";
import fs from "fs";
import path from "path";

const INPUT_DIR = path.join(process.cwd(), "src", "assets", "images");
const OUTPUT_DIR = path.join(process.cwd(), "src", "assets", "images");

async function compressImages() {
  if (!fs.existsSync(INPUT_DIR)) {
    console.log("No images directory found");
    return;
  }

  const files = fs.readdirSync(INPUT_DIR);
  const imageFiles = files.filter(f => /\.(jpg|jpeg|png)$/i.test(f));

  console.log(`Found ${imageFiles.length} images to compress`);

  for (const file of imageFiles) {
    const inputPath = path.join(INPUT_DIR, file);
    const outputPath = path.join(OUTPUT_DIR, file.replace(/\.(jpg|jpeg|png)$/i, ".webp"));

    try {
      await sharp(inputPath)
        .webp({ quality: 80 })
        .toFile(outputPath);

      const originalSize = fs.statSync(inputPath).size;
      const newSize = fs.statSync(outputPath).size;
      const savings = ((originalSize - newSize) / originalSize * 100).toFixed(1);

      console.log(`✓ ${file} → ${path.basename(outputPath)} (${savings}% smaller)`);

      // Remove original file
      fs.unlinkSync(inputPath);
    } catch (err) {
      console.error(`✗ Failed to compress ${file}:`, err.message);
    }
  }

  console.log("\nCompression complete!");
}

compressImages();
