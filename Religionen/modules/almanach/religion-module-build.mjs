import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { RELIGION_ROOT, readReligionCatalog, entryPagePath, entrySymbolPath, validateLocalPath } from '../content/content-repository.mjs';
import { escapeHtml as h } from '../content/content-html.mjs';

const workspaceRoot = resolve(RELIGION_ROOT, '..');

function validateModule(entry) {
  const module = entry.almanach;
  if (!/^[A-Za-z][A-Za-z0-9]*$/.test(module.factory)) throw new Error(`Ungültige Modulfabrik: ${entry.id}`);
  if (module.output !== `AleriaAlmanach/modules/religion/${entry.id}/${entry.id}-entry.js`) throw new Error(`Ungültiges Modulziel: ${entry.id}`);
  if (!Array.isArray(module.pages) || !module.pages.length) throw new Error(`Modulseiten fehlen: ${entry.id}`);
  const used = new Set();
  for (const page of module.pages) {
    if (typeof page.title !== 'string' || !page.title.trim()) throw new Error(`Seitentitel fehlt: ${entry.id}`);
    validateLocalPath(page.scene);
    if (!existsSync(resolve(RELIGION_ROOT, page.scene))) throw new Error(`Szenenbild fehlt: ${page.scene}`);
    if (!Array.isArray(page.sections) || !page.sections.length) throw new Error(`Seiteninhalt fehlt: ${entry.id}`);
    for (const id of page.sections) {
      const section = entry.sections.find(item => item.id === id);
      if (!section || used.has(id)) throw new Error(`Unbekannter oder doppelter Modulabschnitt: ${entry.id}.${id}`);
      if (section.sharedLore) throw new Error(`Gemeinsame Lehre benötigt eine explizite Modulzuordnung: ${entry.id}.${id}`);
      used.add(id);
    }
  }
  if (used.size !== entry.sections.length) throw new Error(`Unvollständiges Religionsmodul: ${entry.id}`);
}

function storySection(section) {
  const blocks = section.blocks || section.paragraphs.map(text => ({ type: 'paragraph', text }));
  return `<strong>${h(section.title)}</strong><br><br>` + blocks.map(block => {
    if (block.type === 'heading') return `<strong>${h(block.text)}</strong>`;
    if (block.type === 'list') return block.items.map(item => `• ${h(item)}`).join('<br>');
    return h(block.text);
  }).join('<br><br>');
}

export function createReligionModule(entry) {
  validateModule(entry);
  return {
    id: entry.id, title: entry.title, subtitle: entry.epithet,
    type: entry.kind, category: 'Religion · Häresien, Kulte & Sekten',
    image: `../Religionen/${entry.almanach.pages[0].scene}`,
    stamp: entry.epithet.toLocaleUpperCase('de-DE'),
    multipage: true, appendCommentsPage: false, locked: false,
    icon: '✧', symbol: `../${entrySymbolPath(entry)}`,
    pages: entry.almanach.pages.map((page, index) => ({
      pageTitle: page.title, image: `../Religionen/${page.scene}`,
      imageFit: 'contain', imagePosition: 'center', imageWidth: 40,
      description: page.sections.map(id => storySection(entry.sections.find(section => section.id === id))).join('<br><br>')
        + (index === 0 ? `<br><br><a href="../${h(entryPagePath(entry))}">Zum Religionsarchiv: ${h(entry.title)}</a>` : ''),
      ...(index === 0 ? { stats: entry.facts.slice(0, 4).map(fact => [fact.label, fact.value]) } : {})
    }))
  };
}

export function religionModuleFiles(catalog = readReligionCatalog()) {
  return catalog.entries.filter(entry => entry.almanach).map(entry => [entry.almanach.output,
    `// Generated from Religionen/${entry.sourcePath}; edit the canonical religion entry.\nfunction ${entry.almanach.factory}() {\n  return ${JSON.stringify(createReligionModule(entry), null, 2)};\n}\n`]);
}

export async function buildReligionModules({ check = false, catalog = readReligionCatalog() } = {}) {
  const files = religionModuleFiles(catalog);
  for (const [path, content] of files) {
    const destination = resolve(workspaceRoot, path);
    if (check) {
      const current = await readFile(destination, 'utf8').catch(error => {
        if (error.code === 'ENOENT') return null;
        throw error;
      });
      if (current?.replace(/\r\n/g, '\n') !== content) throw new Error(`Religionsmodul nicht aktuell: ${path}. build:religions ausführen.`);
    } else {
      await mkdir(dirname(destination), { recursive: true });
      await writeFile(destination, content, 'utf8');
    }
  }
  return files.length;
}

export async function copyReligionModuleAssets({ buildRoot, catalog = readReligionCatalog() }) {
  const paths = new Set(catalog.entries.filter(entry => entry.almanach).flatMap(entry => {
    validateModule(entry);
    return [entrySymbolPath(entry), ...entry.almanach.pages.map(page => `Religionen/${page.scene}`)];
  }));
  for (const path of paths) {
    const target = resolve(buildRoot, path);
    await mkdir(dirname(target), { recursive: true });
    await copyFile(resolve(workspaceRoot, path), target);
  }
}
