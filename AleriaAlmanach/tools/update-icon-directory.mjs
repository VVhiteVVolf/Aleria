import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const almanachRoot = path.resolve(scriptDir, '..');
const projectRoot = path.resolve(almanachRoot, '..');
const iconRoot = path.join(projectRoot, 'IconOrdner');
const outputFile = path.join(almanachRoot, 'modules', 'icon-directory', 'icon-directory-data.js');
const allowedExtensions = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg']);

function readImageDimensions(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const buffer = fs.readFileSync(filePath);
  if (ext === '.png' && buffer.toString('ascii', 1, 4) === 'PNG') {
    return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
  }
  if ((ext === '.jpg' || ext === '.jpeg') && buffer[0] === 0xff && buffer[1] === 0xd8) {
    let offset = 2;
    while (offset < buffer.length) {
      if (buffer[offset] !== 0xff) break;
      const marker = buffer[offset + 1];
      const length = buffer.readUInt16BE(offset + 2);
      if ([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf].includes(marker)) {
        return { width: buffer.readUInt16BE(offset + 7), height: buffer.readUInt16BE(offset + 5) };
      }
      offset += 2 + length;
    }
  }
  if (ext === '.gif' && buffer.toString('ascii', 0, 3) === 'GIF') {
    return { width: buffer.readUInt16LE(6), height: buffer.readUInt16LE(8) };
  }
  if (ext === '.webp' && buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP') {
    const chunk = buffer.toString('ascii', 12, 16);
    if (chunk === 'VP8X') {
      return {
        width: 1 + buffer.readUIntLE(24, 3),
        height: 1 + buffer.readUIntLE(27, 3)
      };
    }
    if (chunk === 'VP8 ') {
      return { width: buffer.readUInt16LE(26) & 0x3fff, height: buffer.readUInt16LE(28) & 0x3fff };
    }
    if (chunk === 'VP8L') {
      const bits = buffer.readUInt32LE(21);
      return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
    }
  }
  if (ext === '.svg') {
    const text = buffer.toString('utf8');
    const viewBox = text.match(/viewBox=["']\s*[-\d.]+\s+[-\d.]+\s+([\d.]+)\s+([\d.]+)\s*["']/i);
    if (viewBox) return { width: Number(viewBox[1]) || 0, height: Number(viewBox[2]) || 0 };
    const width = text.match(/\bwidth=["']([\d.]+)/i);
    const height = text.match(/\bheight=["']([\d.]+)/i);
    if (width && height) return { width: Number(width[1]) || 0, height: Number(height[1]) || 0 };
  }
  return { width: 0, height: 0 };
}

function getRatioClass(width, height) {
  if (!width || !height) return 'unknown';
  const ratio = width / height;
  if (ratio >= 1.85) return 'banner';
  if (ratio >= 1.2) return 'wide';
  if (ratio <= 0.45) return 'tall';
  if (ratio <= 0.78) return 'portrait';
  return 'square';
}

function readIconFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) return readIconFiles(absolutePath);
    if (!entry.isFile() || !allowedExtensions.has(path.extname(entry.name).toLowerCase())) return [];

    const relativePath = path.relative(iconRoot, absolutePath).split(path.sep).join('/');
    const folder = path.dirname(relativePath).split(path.sep).join('/');
    const dimensions = readImageDimensions(absolutePath);
    return [{
      name: path.basename(entry.name, path.extname(entry.name)),
      fileName: entry.name,
      folder: folder === '.' ? 'IconOrdner' : folder,
      path: `../IconOrdner/${relativePath}`,
      width: dimensions.width,
      height: dimensions.height,
      ratio: getRatioClass(dimensions.width, dimensions.height)
    }];
  });
}

if (!fs.existsSync(iconRoot)) {
  throw new Error(`IconOrdner wurde nicht gefunden: ${iconRoot}`);
}

const icons = readIconFiles(iconRoot)
  .sort((a, b) => `${a.folder}/${a.fileName}`.localeCompare(`${b.folder}/${b.fileName}`, 'de'));

const source = `// Generated from ../IconOrdner. Refresh with: node ./AleriaAlmanach/tools/update-icon-directory.mjs\nconst ALERIA_ICON_DIRECTORY = ${JSON.stringify(icons, null, 2)};\nglobalThis.ALERIA_ICON_DIRECTORY = ALERIA_ICON_DIRECTORY;\n`;

fs.mkdirSync(path.dirname(outputFile), { recursive: true });
fs.writeFileSync(outputFile, source, 'utf8');
console.log(`Icon-Verzeichnis aktualisiert: ${icons.length} Icons`);
