import sharp from 'sharp';
import { mkdir, writeFile, copyFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const originals = path.join(root, 'docs/concepts');
const images = path.join(root, 'public/images');
const brand = path.join(root, 'public/brand');
const licenses = path.join(root, 'public/licenses');
await Promise.all([images, brand, licenses].map(dir => mkdir(dir, { recursive: true })));

const crops = [
  ['palm-court-light', 'palm-court', 0, 60, 800, 600],
  ['palm-court-layout', 'palm-court', 360, 50, 800, 600],
  ['palm-court-material', 'palm-court', 850, 40, 686, 514],
  ['bay-window-light', 'bay-window', 530, 120, 494, 1000],
  ['bay-window-table', 'bay-window', 20, 680, 720, 720],
  ['bay-window-shelf', 'bay-window', 0, 0, 360, 900],
  ['tide-house-island', 'tide-house', 90, 300, 890, 600],
  ['tide-house-table', 'tide-house', 700, 540, 836, 484],
  ['tide-house-frame', 'tide-house', 860, 0, 520, 800],
];
const ledger = [];
async function record(destination, source, rectangle = null) {
  const meta = await sharp(destination).metadata();
  const file = path.relative(path.join(root, 'public'), destination).replaceAll('\\', '/');
  ledger.push({ file: `/${file}`, width: meta.width, height: meta.height, bytes: (await stat(destination)).size, source, rectangle });
}
async function variants(name, source, rectangle = null) {
  const sourceFile = path.join(originals, `${source}.png`);
  const meta = await sharp(sourceFile).metadata();
  const width = rectangle?.width ?? meta.width;
  for (const size of [null, 640, 960].filter(size => size === null || size < width)) {
    let pipeline = sharp(sourceFile).rotate();
    if (rectangle) pipeline = pipeline.extract(rectangle);
    if (size) pipeline = pipeline.resize({ width: size, withoutEnlargement: true });
    const destination = path.join(images, `${name}${size ? `-${size}` : ''}.webp`);
    await pipeline.webp({ quality: rectangle ? 86 : 84, effort: 6 }).toFile(destination);
    await record(destination, `docs/concepts/${source}.png`, rectangle);
  }
}
for (const source of ['palm-court', 'bay-window', 'tide-house', 'materials']) await variants(source, source);
for (const [source, sizes] of [['arrival', [640, 960, 1536]], ['materials-daylight', [640, 1024]]]) {
  for (const width of sizes) {
    const destination = path.join(images, `${source}-${width}.webp`);
    await sharp(path.join(originals, `${source}.png`)).rotate().resize({ width, withoutEnlargement: true }).webp({quality:86, effort:6}).toFile(destination);
    await record(destination, `docs/concepts/${source}.png`);
  }
}
for (const [name, source, left, top, width, height] of crops) await variants(name, source, { left, top, width, height });

// Original open-line joinery construction from BRAND-SYSTEM.md. No external fonts or assets.
const shape = '<path d="M4 34 14 6 24 34M8.3 22H19.7M24 6V34M36 6V34M24 22H36"/>';
const mark = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" fill="none" stroke="#2e2118" stroke-width="1.75" stroke-linecap="square" stroke-linejoin="miter">${shape}</svg>`;
const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 56 56"><path fill="#f8f6f1" d="M0 0h56v56H0z"/><g transform="translate(8 8)" fill="none" stroke="#2e2118" stroke-width="3" stroke-linecap="square" stroke-linejoin="miter">${shape}</g></svg>`;
await writeFile(path.join(brand, 'ah-mark.svg'), mark);
await writeFile(path.join(brand, 'favicon.svg'), favicon);
for (const size of [16, 32, 48, 180]) {
  const destination = path.join(brand, size === 180 ? 'apple-touch-icon.png' : `favicon-${size}.png`);
  await sharp(Buffer.from(favicon), { density: 384 }).resize(size, size).png().toFile(destination);
  await record(destination, 'Original AH joinery mark, BRAND-SYSTEM.md');
}

for (const [family, filename] of [['gelasio', 'Gelasio-OFL.txt'], ['hanken-grotesk', 'Hanken-Grotesk-OFL.txt']]) {
  await copyFile(path.join(root, `node_modules/@fontsource/${family}/LICENSE`), path.join(licenses, filename));
}

// Use an installed local serif fallback for deterministic raster labels; site fonts remain self-hosted Gelasio/Hanken.
const xml = value => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const socials = [
  ['home', 'arrival', 'Rooms for', 'the life within.'],
  ['palm-court', 'palm-court', 'Palm Court', 'Living, together.'],
  ['bay-window', 'bay-window', 'Bay Window', 'A place to stay.'],
  ['tide-house', 'tide-house', 'Tide House', 'Room to gather.'],
];
for (const [slug, source, first, second] of socials) {
  const photo = await sharp(path.join(originals, `${source}.png`))
    .resize(664, 534, { fit: 'cover', position: 'centre', withoutEnlargement: true }).toBuffer();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
    <rect width="1200" height="630" fill="#e9e1d2"/>
    <g fill="#2e2118"><text x="48" y="85" font-family="Georgia,serif" font-size="38">Alder House</text>
    <text x="48" y="260" font-family="Georgia,serif" font-size="49">${xml(first)}</text>
    <text x="48" y="321" font-family="Georgia,serif" font-style="italic" font-size="43">${xml(second)}</text>
    <text x="48" y="404" font-family="Arial,sans-serif" font-size="19">Residential interiors</text>
    <text x="48" y="528" font-family="Arial,sans-serif" font-size="17">A JBX Web Studio concept</text>
    <text x="48" y="560" font-family="Arial,sans-serif" font-size="15">Fictional studio · Generated imagery</text></g>
    </svg>`;
  const destination = path.join(images, `social-${slug}.jpg`);
  await sharp(Buffer.from(svg)).composite([{ input: photo, left: 488, top: 48 }]).jpeg({ quality: 88, mozjpeg: true }).toFile(destination);
  await record(destination, `docs/concepts/${source}.png + original editorial label composition`);
}

await writeFile(path.join(images, 'asset-manifest.json'), `${JSON.stringify(ledger, null, 2)}\n`);
const rows = ledger.map(item => `| \`${item.file}\` | ${item.width} × ${item.height} | ${(item.bytes / 1024).toFixed(1)} KiB |`).join('\n');
console.log(rows);
