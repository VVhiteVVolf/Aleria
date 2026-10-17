import { readFile, writeFile, mkdir, copyFile } from 'node:fs/promises';
import { resolve, dirname, relative, isAbsolute, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const root = fileURLToPath(new URL('../../', import.meta.url));
const directory = new URL(process.argv.includes('--items')?'../assets/gofrann-schmiede/items/':'../assets/gofrann-schmiede/', import.meta.url);
const manifest = JSON.parse(await readFile(new URL('image-prompts.json', directory), 'utf8'));
const resultUrl = new URL('image-results.json', directory);
const previous = await readFile(resultUrl, 'utf8').then(JSON.parse).catch(error => {
  if (error.code !== 'ENOENT') throw error;
  return { tool: 'built-in image_gen', status: 'local-only', images: [] };
});
let input = '';
for await (const chunk of process.stdin) input += chunk;
const imports = JSON.parse(input);
for (const item of imports) {
  const job = manifest.entries.find(job => job.id === item.id);
  if (!job) throw new Error(`Unbekannter Bildauftrag ${item.id}`);
  const source = resolve(item.source);
  if (!source.toLowerCase().split(sep).includes('generated_images')) {
    throw new Error('Die Quelle muss aus dem Bildwerkzeug stammen.');
  }
  const destination = resolve(root, job.destination);
  const local = relative(root, destination);
  if (local.startsWith('..') || isAbsolute(local)) throw new Error('Bildziel außerhalb des Projekts.');
  const data = await readFile(source);
  if (!data.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]))) throw new Error('Kein PNG.');
  await mkdir(dirname(destination), { recursive: true });
  await copyFile(source, destination);
  const record = { id: job.id, destination: job.destination, source, width: data.readUInt32BE(16), height: data.readUInt32BE(20),
    sha256: createHash('sha256').update(data).digest('hex'), ...(item.correctionPrompt ? { correctionPrompt: item.correctionPrompt } : {}) };
  previous.images = previous.images.filter(image => image.id !== job.id);
  previous.images.push(record);
  console.log(JSON.stringify({ imported: item.id, destination: job.destination }));
}
await writeFile(resultUrl, `${JSON.stringify(previous, null, 2)}\n`);
