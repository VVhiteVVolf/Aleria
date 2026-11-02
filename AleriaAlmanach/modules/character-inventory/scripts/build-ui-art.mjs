// Technical UI derivatives only. Original illustrations remain untouched.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const root = new URL('../../../../', import.meta.url);
const almanach = new URL('AleriaAlmanach/', root);
const outputRoot = new URL('public/assets/inventory-ui/', almanach);
const manifestUrl = new URL('assets/inventory-ui/2026-11-02/ui-derivatives.json', almanach);
const check = process.argv.includes('--check');
const quality = 0.9;
const inputs = [
  ['rucksack', 'assets/pendrwn-general-store/goods/rucksack.png', ['all']],
  ['waffen', 'public/assets/item-register/categories/waffen.png', ['weapon']],
  ['ruestung', 'public/assets/item-register/categories/ruestungen-v3.png', ['armor']],
  ['werkzeuge', 'public/assets/item-register/categories/werkzeuge.png', ['equipment']],
  ['alchemie', 'public/assets/item-register/categories/alchemie.png', ['potions', 'consumable']],
  ['notizbuch', 'assets/pendrwn-general-store/goods/notizbuch.png', ['documents', 'document', 'register']],
  ['arkanes', 'public/assets/item-register/categories/arkanes.png', ['artifact']],
  ['pferde', 'public/assets/item-register/categories/pferde.png', ['companion']],
  ['sonstiges', 'public/assets/item-register/categories/sonstiges.png', ['other']],
  ['interaktion', 'public/assets/comment-icons/interact.png', ['open']],
  ['feder-tinte', 'assets/pendrwn-general-store/goods/feder-tinte.png', ['edit']],
  ['goldtaler', 'assets/currency/aleria-goldtaler-v1.webp', ['wallet']],
  ['dark-hide', 'public/assets/inventory-ui/dark-hide-v1.png', ['material'], 512]
].map(([name, path, roles, maxEdge = 256]) => ({ name, path, roles, maxEdge }));

const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const relative = url => fileURLToPath(url).replaceAll('\\', '/').slice(fileURLToPath(root).replaceAll('\\', '/').length);

function webpDimensions(bytes) {
  assert.equal(bytes.toString('ascii', 0, 4), 'RIFF', 'Invalid WebP RIFF header.');
  assert.equal(bytes.toString('ascii', 8, 12), 'WEBP', 'Invalid WebP format.');
  assert.equal(bytes.readUInt32LE(4) + 8, bytes.length, 'Truncated WebP container.');
  for (let offset = 12; offset + 8 <= bytes.length;) {
    const type = bytes.toString('ascii', offset, offset + 4);
    const length = bytes.readUInt32LE(offset + 4), data = offset + 8;
    assert(data + length <= bytes.length, 'Truncated WebP chunk.');
    if (type === 'VP8X' && length >= 10) return { width: bytes.readUIntLE(data + 4, 3) + 1, height: bytes.readUIntLE(data + 7, 3) + 1 };
    if (type === 'VP8L' && length >= 5) {
      assert.equal(bytes[data], 0x2f, 'Invalid lossless WebP signature.');
      const bits = bytes.readUInt32LE(data + 1);
      return { width: (bits & 0x3fff) + 1, height: ((bits >>> 14) & 0x3fff) + 1 };
    }
    if (type === 'VP8 ' && length >= 10) {
      assert.equal(bytes.toString('hex', data + 3, data + 6), '9d012a', 'Invalid WebP key frame.');
      return { width: bytes.readUInt16LE(data + 6) & 0x3fff, height: bytes.readUInt16LE(data + 8) & 0x3fff };
    }
    offset = data + length + (length % 2);
  }
  throw Error('WebP dimensions missing.');
}

function sourceDimensions(bytes, path) {
  if (path.endsWith('.webp')) return webpDimensions(bytes);
  assert.equal(bytes.toString('hex', 0, 8), '89504e470d0a1a0a', 'Invalid PNG signature.');
  assert.equal(bytes.toString('ascii', 12, 16), 'IHDR', 'PNG header missing.');
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
}

async function verifyDerivatives() {
  const manifest = JSON.parse(await readFile(manifestUrl, 'utf8'));
  assert.equal(manifest.schema, 'aleria.inventory-ui-derivatives');
  assert.equal(manifest.schemaVersion, 1);
  assert.equal(manifest.encoder?.quality, quality, 'WebP quality configuration changed.');
  assert.equal(manifest.encoder?.imageSmoothingQuality, 'high');
  assert.equal(manifest.encoder?.originalsPreserved, true);
  assert.equal(manifest.records?.length, inputs.length, 'Derivative input list changed.');
  const names = new Set(), mapping = {};
  let inputBytes = 0, outputBytes = 0;
  for (const input of inputs) {
    const record = manifest.records.find(value => value.name === input.name);
    assert(record && !names.has(record.name), `Missing or duplicate record: ${input.name}`);
    names.add(record.name);
    assert.deepEqual(record.roles, input.roles, `Icon roles changed: ${input.name}`);
    assert.equal(record.maxEdge, input.maxEdge, `Icon size configuration changed: ${input.name}`);
    const sourceUrl = new URL(input.path, almanach);
    const outputUrl = input.roles.includes('material')
      ? new URL('dark-hide-v1.webp', outputRoot)
      : new URL(`icons/${input.name}-v1.webp`, outputRoot);
    const source = await readFile(sourceUrl), output = await readFile(outputUrl);
    assert.equal(record.input.path, relative(sourceUrl));
    assert.equal(record.input.url, './' + input.path);
    assert.equal(record.output.path, relative(outputUrl));
    assert.equal(record.output.url, './' + relative(outputUrl).replace(/^AleriaAlmanach\//, ''));
    for (const [kind, bytes] of [['input', source], ['output', output]]) {
      assert.equal(bytes.length, record[kind].bytes, `Outdated ${kind} size: ${input.name}`);
      assert.equal(hash(bytes), record[kind].sha256, `Outdated ${kind} hash: ${input.name}`);
    }
    const originalSize = sourceDimensions(source, input.path), outputSize = webpDimensions(output);
    assert.deepEqual(originalSize, { width: record.input.width, height: record.input.height }, `Input dimensions changed: ${input.name}`);
    assert.deepEqual(outputSize, { width: record.output.width, height: record.output.height }, `Output dimensions changed: ${input.name}`);
    const scale = Math.min(1, input.maxEdge / Math.max(originalSize.width, originalSize.height));
    assert.deepEqual(outputSize, { width: Math.max(1, Math.round(originalSize.width * scale)), height: Math.max(1, Math.round(originalSize.height * scale)) }, `Derivative dimensions/configuration mismatch: ${input.name}`);
    assert.equal(record.output.alphaMatchesResizedSource, true, `Alpha verification missing: ${input.name}`);
    mapping[record.input.url] = record.output.url;
    inputBytes += source.length; outputBytes += output.length;
  }
  assert.deepEqual(manifest.urlMapping, mapping, 'Derivative URL mapping changed.');
  assert.equal(manifest.inputBytes, inputBytes);
  assert.equal(manifest.outputBytes, outputBytes);
  assert.equal(manifest.savedBytes, inputBytes - outputBytes);
  console.log(JSON.stringify({ verified: true, derivatives: inputs.length, inputBytes, outputBytes, browserRequired: false }));
}

if (process.argv.includes('--verify')) {
  await verifyDerivatives();
} else {
const { chromium } = await import('../../../../Stammbäume/node_modules/playwright-core/index.mjs');
const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.PLAYWRIGHT_EXECUTABLE || 'C:/Program Files/Google/Chrome/Application/chrome.exe'
});
const records = [], previews = [];
try {
  const page = await browser.newPage();
  await page.route('**/*', route => route.abort());
  for (const input of inputs) {
    const sourceUrl = new URL(input.path, almanach), sourceBytes = await readFile(sourceUrl);
    const mime = input.path.endsWith('.webp') ? 'image/webp' : 'image/png';
    const converted = await page.evaluate(async ({ data, maxEdge, quality }) => {
      const decode = async source => {
        const image = new Image(); image.src = source; await image.decode(); return image;
      };
      const alpha = pixels => {
        let transparent = 0, partial = 0, opaque = 0;
        for (let index = 3; index < pixels.length; index += 4) {
          if (pixels[index] === 0) transparent++;
          else if (pixels[index] === 255) opaque++;
          else partial++;
        }
        return { transparent, partial, opaque };
      };
      const image = await decode(data), original = document.createElement('canvas');
      original.width = image.naturalWidth; original.height = image.naturalHeight;
      const sourceContext = original.getContext('2d', { willReadFrequently: true });
      sourceContext.drawImage(image, 0, 0);
      const inputAlpha = alpha(sourceContext.getImageData(0, 0, original.width, original.height).data);
      const scale = Math.min(1, maxEdge / Math.max(original.width, original.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(original.width * scale));
      canvas.height = Math.max(1, Math.round(original.height * scale));
      const context = canvas.getContext('2d', { willReadFrequently: true });
      context.imageSmoothingEnabled = true; context.imageSmoothingQuality = 'high';
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      const before = context.getImageData(0, 0, canvas.width, canvas.height).data;
      const output = canvas.toDataURL('image/webp', quality);
      if (!output.startsWith('data:image/webp;base64,')) throw Error('WebP encoding unavailable.');
      const decoded = await decode(output), validation = document.createElement('canvas');
      validation.width = decoded.naturalWidth; validation.height = decoded.naturalHeight;
      const validationContext = validation.getContext('2d', { willReadFrequently: true });
      validationContext.drawImage(decoded, 0, 0);
      const after = validationContext.getImageData(0, 0, validation.width, validation.height).data;
      let alphaDifferences = 0;
      for (let index = 3; index < before.length; index += 4) if (before[index] !== after[index]) alphaDifferences++;
      return { output, width: canvas.width, height: canvas.height,
        inputWidth: original.width, inputHeight: original.height, inputAlpha,
        alpha: alpha(after), alphaDifferences };
    }, { data: `data:${mime};base64,${sourceBytes.toString('base64')}`, maxEdge: input.maxEdge, quality });
    const outputBytes = Buffer.from(converted.output.split(',')[1], 'base64');
    const outputUrl = input.roles.includes('material')
      ? new URL('dark-hide-v1.webp', outputRoot)
      : new URL(`icons/${input.name}-v1.webp`, outputRoot);
    assert.equal(outputBytes.toString('ascii', 0, 4), 'RIFF');
    assert.equal(outputBytes.toString('ascii', 8, 12), 'WEBP');
    assert(Math.max(converted.width, converted.height) <= input.maxEdge, input.name);
    assert.equal(converted.alphaDifferences, 0, `Alpha changed during WebP encoding: ${input.name}`);
    if (converted.inputAlpha.transparent) assert(converted.alpha.transparent, `Transparent silhouette lost: ${input.name}`);
    assert(outputBytes.length < sourceBytes.length, `Derivative is not smaller: ${input.name}`);
    if (check) assert.equal(hash(await readFile(outputUrl)), hash(outputBytes), `Derivative outdated: ${input.name}`);
    else {
      await mkdir(new URL('./', outputUrl), { recursive: true });
      await writeFile(outputUrl, outputBytes);
    }
    assert.equal(hash(await readFile(sourceUrl)), hash(sourceBytes), `Original changed: ${input.name}`);
    records.push({
      name: input.name, roles: input.roles, maxEdge: input.maxEdge,
      input: { path: relative(sourceUrl), url: `./${input.path}`, width: converted.inputWidth,
        height: converted.inputHeight, bytes: sourceBytes.length, sha256: hash(sourceBytes), alpha: converted.inputAlpha },
      output: { path: relative(outputUrl), url: './' + relative(outputUrl).replace(/^AleriaAlmanach\//, ''),
        width: converted.width, height: converted.height, bytes: outputBytes.length, sha256: hash(outputBytes),
        alpha: converted.alpha, alphaMatchesResizedSource: true }
    });
    if (!input.roles.includes('material')) previews.push({ name: input.name, image: converted.output });
  }
  const inputBytes = records.reduce((sum, record) => sum + record.input.bytes, 0);
  const outputBytes = records.reduce((sum, record) => sum + record.output.bytes, 0);
  const manifest = {
    schema: 'aleria.inventory-ui-derivatives', schemaVersion: 1,
    generatedBy: 'AleriaAlmanach/modules/character-inventory/scripts/build-ui-art.mjs',
    encoder: { engine: browser.version(), method: 'Canvas 2D drawImage + image/webp', quality,
      imageSmoothingQuality: 'high', originalsPreserved: true },
    inputBytes, outputBytes, savedBytes: inputBytes - outputBytes,
    urlMapping: Object.fromEntries(records.map(record => [record.input.url, record.output.url])), records
  };
  const text = JSON.stringify(manifest, null, 2) + '\n';
  if (check) assert.equal(await readFile(manifestUrl, 'utf8'), text, 'Derivative manifest outdated.');
  else {
    await mkdir(new URL('./', manifestUrl), { recursive: true });
    await writeFile(manifestUrl, text);
  }
  if (process.argv.includes('--preview')) {
    const previewDirectory = new URL('diagnostics/inventory-theme-20261102/', root);
    await mkdir(previewDirectory, { recursive: true });
    await page.setViewportSize({ width: 1040, height: 820 });
    await page.setContent(`<html><head><style>body{background:#201d16;color:#dfcda7;font:16px Georgia;margin:20px}.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}figure{margin:0;border:1px solid #8b754a;padding:12px;text-align:center;background:#14130f}figure>img{width:130px;height:130px;object-fit:contain}.small img{width:32px;height:32px;object-fit:contain}figcaption{margin:8px 0}</style></head><body><div class="grid">${previews.map(item => `<figure><img src="${item.image}"><figcaption>${item.name}</figcaption><div class="small"><img src="${item.image}"> 32 px</div></figure>`).join('')}</div></body></html>`);
    await page.screenshot({ path: fileURLToPath(new URL('ui-derivatives-contact-sheet.png', previewDirectory)), fullPage: true });
  }
  console.log(JSON.stringify({ derivatives: records.length, inputBytes, outputBytes,
    savedPercent: Number(((1 - outputBytes / inputBytes) * 100).toFixed(2)), manifest: relative(manifestUrl) }));
} finally { await browser.close(); }
}
