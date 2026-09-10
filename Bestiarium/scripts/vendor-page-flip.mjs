// Reproduce the local lifecycle fixes from the unmodified npm 2.0.7 module.
// First extract package/dist/js/page-flip.module.js and package/LICENSE from
// https://registry.npmjs.org/page-flip/-/page-flip-2.0.7.tgz into an input directory.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';

const input = resolve(process.argv[2] || '.codex-temp/book-reader');
let code = await readFile(resolve(input, 'page-flip.module.js'), 'utf8');
const upstreamSha256 = createHash('sha256').update(code).digest('hex');
if (upstreamSha256 !== 'b718faafca6856bff51629baedeff601e2cc59482e951105bdbd6e46978cca38') throw new Error('Unexpected upstream module checksum');
const replacements = [
  ['start(){this.update();const t=e=>{this.render(e),requestAnimationFrame(t)};requestAnimationFrame(t)}',
    'start(){this.update();const t=e=>{this.render(e),this.frame=requestAnimationFrame(t)};this.frame=requestAnimationFrame(t)}destroy(){cancelAnimationFrame(this.frame);this.animation=null}'],
  ['destroy(){this.app.getSettings().useMouseEvents&&this.removeHandlers(),this.distElement.remove(),this.wrapper.remove()}',
    'destroy(){this.removeHandlers(),this.distElement.remove(),this.wrapper.remove()}'],
  ['destroy(){this.ui.destroy(),this.block.remove()}',
    'destroy(){clearTimeout(this.initTimer),this.render.destroy(),this.ui.destroy(),this.block.remove()}'],
  ['setTimeout(()=>{this.ui.update(),this.trigger("init",this,{page:this.setting.startPage,mode:this.render.getOrientation()})},1)',
    'this.initTimer=setTimeout(()=>{this.ui.update(),this.trigger("init",this,{page:this.setting.startPage,mode:this.render.getOrientation()})},1)']
];
for (const [before, after] of replacements) {
  const expected = before.startsWith('setTimeout') ? 2 : 1;
  if (code.split(before).length - 1 !== expected) throw new Error('Unexpected upstream module; review the lifecycle patch.');
  code = code.replaceAll(before, after);
}
const directory = new URL('../modules/book-reader/vendor/', import.meta.url);
await mkdir(directory, { recursive: true });
const license = await readFile(resolve(input, 'LICENSE'), 'utf8');
if (!license.startsWith('MIT License') || !license.includes('2020 Nodlik')) throw new Error('Unexpected license');
await writeFile(new URL('page-flip.mjs', directory), `/*! StPageFlip 2.0.7, Copyright (c) 2020 Nodlik, MIT.\n * Local lifecycle patch: see README.md and vendor-page-flip.mjs.\n${license.split('\n').map(line => ` * ${line}`).join('\n')}\n */\n${code}`);
await writeFile(new URL('LICENSE', directory), license);
await writeFile(new URL('provenance.json', directory), JSON.stringify({ name: 'page-flip', version: '2.0.7', license: 'MIT', upstream: 'https://registry.npmjs.org/page-flip/-/page-flip-2.0.7.tgz', upstreamModuleSha256: upstreamSha256, patch: 'aleria-lifecycle-1' }, null, 2) + '\n');
console.log('Vendored StPageFlip 2.0.7 with explicit lifecycle cleanup.');
