import { readFile, readdir } from 'node:fs/promises';
import { homedir } from 'node:os';
import path from 'node:path';
import { RELEASE_SITE } from './config.mjs';

async function authentication() {
  if (process.env.NETLIFY_AUTH_TOKEN) return process.env.NETLIFY_AUTH_TOKEN;
  const file = process.env.APPDATA ? path.join(process.env.APPDATA, 'netlify/Config/config.json')
    : path.join(homedir(), '.config/netlify/config.json');
  const config = JSON.parse(await readFile(file, 'utf8'));
  const token = config.users?.[config.userId]?.auth?.token;
  if (!token) throw Error('Netlify login required. Run the installed CLI login command.');
  return token;
}

export async function netlifyRequest(endpoint) {
  const token = await authentication();
  const response = await fetch('https://api.netlify.com/api/v1' + endpoint, {
    headers: { Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(60000),
  });
  if (!response.ok) throw Error(`Netlify ${endpoint}: HTTP ${response.status}`);
  return response.json();
}

export async function verifyRelease(root, prepared, deployId) {
  const site = await netlifyRequest('/sites/' + RELEASE_SITE.id);
  if (site.published_deploy?.id !== deployId || site.published_deploy?.state !== 'ready') throw Error('Deploy is not the ready production release.');
  const response = await fetch(RELEASE_SITE.origin + '/build-meta/validation.json?release=' + prepared.commit,
    { cache: 'no-store', signal: AbortSignal.timeout(30000) });
  if (!response.ok || (await response.json()).commit !== prepared.commit) throw Error('Public release receipt mismatch.');
  const files = await netlifyRequest('/sites/' + RELEASE_SITE.id + '/files');
  const normalize = file => decodeURIComponent(file.replace(/^\//, '')).toLowerCase();
  const actual = new Map(files.map(file => [normalize(file.path), file.sha]));
  for (const file of prepared.files) {
    if (actual.get(normalize(file.file)) !== file.sha) throw Error(`Published file mismatch: ${file.file}`);
  }
  const functions = await netlifyRequest('/sites/' + RELEASE_SITE.id + '/functions');
  const available = (Array.isArray(functions) ? functions : functions.functions).map(fn => fn.name || fn.n);
  const expected = (await readdir(path.join(root, 'netlify/functions'))).filter(name => name.endsWith('.mjs')).map(name => name.slice(0, -4));
  for (const name of expected) if (!available.includes(name)) throw Error(`Missing function: ${name}`);
  return { deployId, commit: prepared.commit, verifiedFiles: prepared.files.length,
    functions: expected, url: RELEASE_SITE.origin, verifiedAt: new Date().toISOString() };
}
