import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import vm from 'node:vm';
import { shouldPublish } from '../../../netlify/build/site-publish.mjs';

const app = 'AleriaAlmanach/';
// These pure source dependencies are also consumed by build-quest-catalog.
// Their order comes from the selected committed browser HTML, not this set.
const prerequisites = new Set([
  'Fonts/Rheunwaith-Font-1.000/rheunwaith.js', 'Fonts/Karnrith-Font-2.000/karnrith.js', 'Fonts/Arkanes-Alphabet/arcane.js',
  ...['name-list/name-list-data.js', 'script-table/script-table-data.js',
    'language/morgar/morgar-data.js', 'language/morgar/morgar-tables.js', 'language/morgar/morgar-entry.js',
    'language/laerelis/laerelis-data.js', 'language/laerelis/laerelis-tables.js', 'language/laerelis/laerelis-entry.js',
    'language/package-language-tables.js', 'language/tlapanui/tlapanui-data.js', 'language/tlapanui/tlapanui-entry.js',
    'language/ishtaran/ishtaran-data.js', 'language/ishtaran/ishtaran-entry.js',
    'language/language-reference-entries.js', 'language/arcane-alphabet-entry.js',
    'religion/nimuiten/nimuiten-entry.js', 'religion/gruener-bund/gruener-bund-entry.js', 'piracy/piracy-entries.js',
    'landing/landing-model.global.js', 'group-adventures/group-adventures.global.js',
    'gwynthor-geography/gwynthor-geography.global.js', 'module-store/module-entry-migrations.js'].map(file => app + 'modules/' + file),
]);

export function classicSourceScripts(html) {
  return [...html.matchAll(/<script\b([^>]*)>/gi)].flatMap(([, attributes]) => {
    if (/\btype\s*=\s*['"]module['"]/i.test(attributes)) return [];
    const source = attributes.match(/\bsrc\s*=\s*['"]([^'"]+)['"]/i)?.[1];
    if (!source || !/^\.\.?\//.test(source)) return [];
    const file = path.posix.normalize(app + decodeURI(source.split(/[?#]/)[0]));
    assert(shouldPublish(file), `Section source is outside the public publication policy: ${file}`);
    return [file];
  });
}

/** Read exactly one committed source tree. Working files and browser drafts
 * cannot be included even when the command is run in the full private workspace. */
export async function readCommittedTradeSections(root) {
  const git = args => execFileSync('git', args, { cwd: root, stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 16 * 1024 * 1024 });
  const commit = git(['rev-parse', 'HEAD']).toString().trim();
  const sources = new Map();
  const read = file => {
    assert(shouldPublish(file), `Refusing non-public section source: ${file}`);
    if (!sources.has(file)) sources.set(file, git(['show', `${commit}:${file}`]));
    return sources.get(file).toString();
  };
  const scripts = classicSourceScripts(read(app + 'AleriaAlmanach.html'));
  const start = scripts.indexOf(app + 'data/sections.js');
  const end = scripts.indexOf(app + 'modules/core/content-safety.js');
  assert(start >= 0 && end > start, 'The canonical browser section-registration block is missing.');
  const context = vm.createContext({ structuredClone });
  context.window = context;
  const execute = file => vm.runInContext(read(file), context, { filename: file, timeout: 15000 });
  for (const file of scripts.slice(0, start).filter(file => prerequisites.has(file))) execute(file);
  execute(scripts[start]);
  // The browser data-registration block includes generated *-data sources and
  // older named registrations (for example newspapers), in their real order.
  for (const file of scripts.slice(start + 1, end)) if (read(file).includes('SECTIONS')) execute(file);
  const policyFile = app + 'modules/module-store/module-section-policy.js';
  assert(scripts.includes(policyFile), 'The canonical browser section privacy policy is missing.');
  execute(policyFile);
  const policy = context.AleriaModuleSectionPolicy;
  assert(policy?.isRemoved && policy?.isHidden, 'The browser section privacy policy is unavailable.');
  const raw = vm.runInContext('SECTIONS', context);
  const sections = structuredClone(context.AleriaGwynthorGeography?.projectGwynthorSections(raw) || raw);
  assert.equal(git(['rev-parse', 'HEAD']).toString().trim(), commit, 'Source HEAD changed while loading builtin shops.');
  const inputBlobs = [...sources].sort(([first], [second]) => first.localeCompare(second, 'en')).map(([file, bytes]) => ({ file,
    blob: createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex') }));
  return { sections, isPublicSection: section => !policy.isRemoved(section) && !policy.isHidden(section),
    sourceFiles: inputBlobs.map(source => source.file),
    inputDigest: createHash('sha256').update(JSON.stringify(inputBlobs)).digest('hex'), sourceCommit: commit };
}
