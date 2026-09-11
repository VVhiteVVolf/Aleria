import { readFile, mkdir, copyFile } from 'node:fs/promises';
import { dirname, resolve, relative, isAbsolute } from 'node:path';

// Der Kalender kann jedes registrierte Icon wählen. Nur die katalogisierten
// Bilddateien kopieren, nicht die großen ungenutzten Quell-/Spieldateiverzeichnisse.
export async function copyCalendarIconAssets({ workspaceRoot, almanachRoot, buildRoot }) {
  const source = await readFile(resolve(almanachRoot, 'modules/icon-directory/icon-directory-data.js'), 'utf8');
  const entries = JSON.parse(source.slice(source.indexOf('['), source.lastIndexOf(']') + 1));
  const paths = [...new Set(entries.map(entry => entry.path))];
  for (let index = 0; index < paths.length; index += 40) {
    await Promise.all(paths.slice(index, index + 40).map(async path => {
      const input = resolve(almanachRoot, path);
      const withinIcons = relative(resolve(workspaceRoot, 'IconOrdner'), input);
      if (withinIcons.startsWith('..') || isAbsolute(withinIcons)) throw new Error(`Icon außerhalb des Verzeichnisses: ${path}`);
      const output = resolve(buildRoot, 'IconOrdner', withinIcons);
      await mkdir(dirname(output), { recursive: true });
      await copyFile(input, output);
    }));
  }
}
