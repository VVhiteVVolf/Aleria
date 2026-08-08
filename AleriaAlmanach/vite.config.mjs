import { defineConfig } from 'vite';
import { cp, copyFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const classicDirectories = ['modules', 'data', 'vendor', 'licenses'];
const classicRootFiles = ['app.js', 'module-richtext.js', 'module-import-export.js', 'THIRD_PARTY_NOTICES.md'];
const almanachRoot = dirname(fileURLToPath(import.meta.url));
const workspaceRoot = resolve(almanachRoot, '..');
const buildRoot = resolve(almanachRoot, 'dist');
const buildAlmanachRoot = resolve(buildRoot, 'AleriaAlmanach');
const combatIconDirectories = [
  ['Zauber Icons', 'Oblivion Style'],
  ['Zauber Icons', 'Baldurs Gate'],
  ['Traits Icon']
];

function preserveClassicAlmanachScripts() {
  return {
    name: 'preserve-classic-almanach-scripts',
    async closeBundle() {
      await Promise.all(classicDirectories.map(directory => (
        cp(resolve(almanachRoot, directory), resolve(buildAlmanachRoot, directory), { recursive: true, force: true })
      )));
      await mkdir(buildAlmanachRoot, { recursive: true });
      await Promise.all(classicRootFiles.map(file => copyFile(resolve(almanachRoot, file), resolve(buildAlmanachRoot, file))));
      await cp(
        resolve(almanachRoot, 'public/assets'),
        resolve(buildAlmanachRoot, 'public/assets'),
        { recursive: true, force: true }
      );
      await cp(
        resolve(workspaceRoot, 'CharakterDatenbank'),
        resolve(buildRoot, 'CharakterDatenbank'),
        { recursive: true, force: true }
      );
      await Promise.all(combatIconDirectories.map(pathParts => cp(
        resolve(workspaceRoot, 'IconOrdner', ...pathParts),
        resolve(buildRoot, 'IconOrdner', ...pathParts),
        { recursive: true, force: true }
      )));
    }
  };
}

export default defineConfig({
  root: workspaceRoot,
  publicDir: false,
  base: './',
  plugins: [preserveClassicAlmanachScripts()],
  build: {
    outDir: buildRoot,
    emptyOutDir: true,
    rollupOptions: {
      input: resolve(almanachRoot, 'AleriaAlmanach.html')
    }
  }
});
