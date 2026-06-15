import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const root = process.cwd();
const processedDir = path.join(root, 'src', 'assets', 'characters', 'processed');

const assets = [
  {
    id: 'arauca',
    input: 'src/assets/characters/arauca/arauca-pose-sheet-original.png',
    output: 'src/assets/characters/processed/arauca-pose-sheet-transparent.png',
    frames: 5,
  },
  {
    id: 'buriti',
    input: 'src/assets/characters/buriti/buriti-pose-sheet-original.png',
    output: 'src/assets/characters/processed/buriti-pose-sheet-transparent.png',
    frames: 5,
  },
  {
    id: 'iare',
    input: 'src/assets/characters/iare/iare-pose-sheet-original.png',
    output: 'src/assets/characters/processed/iare-pose-sheet-transparent.png',
    frames: 5,
  },
  {
    id: 'jequi',
    input: 'src/assets/characters/jequi/jequi-pose-sheet-original.png',
    output: 'src/assets/characters/processed/jequi-pose-sheet-transparent.png',
    frames: 5,
  },
  {
    id: 'mandacaru',
    input: 'src/assets/characters/mandacaru/mandacaru-pose-sheet-original.png',
    output: 'src/assets/characters/processed/mandacaru-pose-sheet-transparent.png',
    frames: 5,
  },
];

const logo = {
  input: 'src/assets/logo/logo-geosaga-original.png',
  output: 'src/assets/logo/logo-geosaga.png',
};

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

function colorDistance(r, g, b, expected) {
  const dr = r - expected[0];
  const dg = g - expected[1];
  const db = b - expected[2];
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

function sampleRowBackground(data, width, y, channels, side) {
  const sampleWidth = Math.max(4, Math.min(16, Math.floor(width * 0.01)));
  const startX = side === 'left' ? 0 : width - sampleWidth;
  const total = [0, 0, 0];

  for (let x = startX; x < startX + sampleWidth; x += 1) {
    const offset = (y * width + x) * channels;
    total[0] += data[offset];
    total[1] += data[offset + 1];
    total[2] += data[offset + 2];
  }

  return total.map((value) => value / sampleWidth);
}

async function removeBorderBackground(inputPath, outputPath, options = {}) {
  const transparentAt = options.transparentAt ?? 20;
  const opaqueAt = options.opaqueAt ?? 62;
  const source = sharp(inputPath).ensureAlpha();
  const { data, info } = await source.raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  const leftByRow = [];
  const rightByRow = [];
  let transparentPixels = 0;
  let partialPixels = 0;

  for (let y = 0; y < height; y += 1) {
    leftByRow.push(sampleRowBackground(data, width, y, channels, 'left'));
    rightByRow.push(sampleRowBackground(data, width, y, channels, 'right'));
  }

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const offset = (y * width + x) * channels;
      const progress = width === 1 ? 0 : x / (width - 1);
      const expected = [0, 1, 2].map(
        (channel) => leftByRow[y][channel] * (1 - progress) + rightByRow[y][channel] * progress,
      );
      const distance = colorDistance(data[offset], data[offset + 1], data[offset + 2], expected);
      const matte = clamp((distance - transparentAt) / (opaqueAt - transparentAt), 0, 1);
      data[offset + 3] = Math.round(data[offset + 3] * matte);
      if (data[offset + 3] === 0) transparentPixels += 1;
      else if (data[offset + 3] < 255) partialPixels += 1;
    }
  }

  await mkdir(path.dirname(outputPath), { recursive: true });
  await sharp(data, { raw: info }).png({ compressionLevel: 9 }).toFile(outputPath);
  return {
    width,
    height,
    transparentPixels,
    partialPixels,
    transparentRatio: Number((transparentPixels / (width * height)).toFixed(4)),
  };
}

await mkdir(processedDir, { recursive: true });

const report = {};
for (const asset of assets) {
  const dimensions = await removeBorderBackground(
    path.join(root, asset.input),
    path.join(root, asset.output),
  );
  report[asset.id] = {
    ...dimensions,
    frames: asset.frames,
    approximateFrameWidth: Math.round(dimensions.width / asset.frames),
    source: asset.input,
    processed: asset.output,
  };
  console.log(`Processed ${asset.id}: ${dimensions.width}x${dimensions.height}`);
}

const logoDimensions = await removeBorderBackground(
  path.join(root, logo.input),
  path.join(root, logo.output),
  { transparentAt: 12, opaqueAt: 48 },
);
console.log(`Processed logo: ${logoDimensions.width}x${logoDimensions.height}`);

await writeFile(
  path.join(processedDir, 'sprite-metadata.json'),
  `${JSON.stringify(report, null, 2)}\n`,
  'utf8',
);
