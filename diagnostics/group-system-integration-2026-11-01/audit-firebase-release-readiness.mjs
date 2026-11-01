// Read-only production metadata audit. Tokens stay in memory; report contains
// no credentials, account identities, document data or secret values.
import { createRequire } from 'node:module';
import { readFile, writeFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve, relative, dirname, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../../', import.meta.url));
const require = createRequire(new URL('../../firebase/package.json', import.meta.url));
const project = 'aleriaprojekt', report = { checkedAt: new Date().toISOString(), project, readOnly: true };
const json = async path => JSON.parse(await readFile(resolve(root, path), 'utf8'));
const sha = content => createHash('sha256').update(content.replaceAll('\r\n', '\n')).digest('hex');
const indexSource = await readFile(resolve(root, 'firebase/functions/src/index.js'), 'utf8');
report.localExports = [...indexSource.matchAll(/export\s*\{([^}]+)\}/g)].flatMap(match => match[1].split(',').map(name => name.trim())).sort();
report.config = await json('firebase.json');
report.cliSelectors = {};
const cliPackages = [['projectLocal', require]];
if (process.env.APPDATA) {
  try { cliPackages.push(['pathGlobal', createRequire(resolve(process.env.APPDATA, 'npm/node_modules/firebase-tools/package.json'))]); }
  catch { /* The project-local CLI remains authoritative when no global CLI exists. */ }
}
for (const [label, cliRequire] of cliPackages) {
  try {
    const helper = cliRequire('firebase-tools/lib/firestore/fsConfig.js');
    report.cliSelectors[label] = { version: cliRequire('firebase-tools/package.json').version,
      defaultOnly: helper.getFirestoreConfig(project, { only: 'firestore:(default)', config: { src: report.config } }).map(config => config.database) };
  } catch { report.cliSelectors[label] = { available: false }; }
}
const pkg = await json('firebase/functions/package.json'), lock = await json('firebase/functions/package-lock.json');
report.runtime = { node: pkg.engines.node, localNode: process.version, dependencies: pkg.dependencies,
  lockedRootDependenciesMatch: JSON.stringify(pkg.dependencies) === JSON.stringify(lock.packages[''].dependencies), installed: {} };
for (const name of Object.keys(pkg.dependencies)) report.runtime.installed[name] = (await json(`firebase/functions/node_modules/${name}/package.json`)).version;
const unresolved = [], outside = [];
async function inspect(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) { await inspect(path); continue; }
    if (!/\.m?js$/.test(path)) continue;
    const source = await readFile(path, 'utf8');
    for (const match of source.matchAll(/(?:\bfrom\s*|\bimport\s*\(\s*|\bimport\s*)['"]([^'"]+)['"]/g)) {
      const specifier = match[1].split(/[?#]/)[0];
      if (!specifier.startsWith('.')) continue;
      const target = resolve(dirname(path), specifier), within = relative(resolve(root, 'firebase/functions'), target);
      if (within.startsWith('..') || isAbsolute(within)) outside.push({ file: relative(root, path), specifier });
      try { await readFile(target); } catch { unresolved.push({ file: relative(root, path), specifier }); }
    }
  }
}
await inspect(resolve(root, 'firebase/functions/src'));
report.runtime.unresolvedRelativeImports = unresolved; report.runtime.importsOutsideFunctions = outside;
const auth = require('firebase-tools/lib/auth.js');
const account = auth.getProjectDefaultAccount(root);
report.auth = { configuredAccount: Boolean(account), refreshCredentialPresent: Boolean(account?.tokens?.refresh_token),
  localToolsVersion: require('firebase-tools/package.json').version };
if (report.auth.refreshCredentialPresent) {
  try {
    const token = await auth.getAccessToken(account.tokens.refresh_token, ['https://www.googleapis.com/auth/cloud-platform']);
    report.auth.accessAvailable = Boolean(token.access_token);
    async function get(url) {
      const response = await fetch(url, { headers: { Authorization: `Bearer ${token.access_token}` }, signal: AbortSignal.timeout(30000) });
      if (!response.ok) throw Object.assign(Error('Metadata read failed.'), { httpStatus: response.status });
      return response.json();
    }
    const calls = [
      ['functions', `https://cloudfunctions.googleapis.com/v2/projects/${project}/locations/-/functions`],
      ['databases', `https://firestore.googleapis.com/v1/projects/${project}/databases`],
      ['indexes', `https://firestore.googleapis.com/v1/projects/${project}/databases/(default)/collectionGroups/-/indexes`],
      ['rulesRelease', `https://firebaserules.googleapis.com/v1/projects/${project}/releases/cloud.firestore`]
    ];
    for (const [key, url] of calls) {
      try {
        const response = await get(url);
        if (key === 'functions') {
          report.functions = (response.functions || []).map(fn => ({ name: fn.name.split('/').at(-1), region: fn.name.split('/')[3],
            state: fn.state, environment: fn.environment, runtime: fn.buildConfig?.runtime,
            codebase: fn.labels?.['firebase-functions-codebase'] || '', updatedAt: fn.updateTime })).sort((a, b) => a.name.localeCompare(b.name));
          report.missingFunctions = report.localExports.filter(name => !report.functions.some(fn => fn.name === name));
          report.functionListHasMorePages = Boolean(response.nextPageToken);
        }
        if (key === 'databases') report.databases = (response.databases || []).map(db => ({ id: db.name.split('/').at(-1), type: db.type, location: db.locationId, deleteProtectionState: db.deleteProtectionState }));
        if (key === 'indexes') {
          report.indexes = (response.indexes || []).map(index => ({ collectionGroup: index.name.split('/').at(-3), state: index.state, queryScope: index.queryScope,
            fields: index.fields.filter(field => field.fieldPath !== '__name__') }));
          const signature = value => JSON.stringify([value.collectionGroup, value.queryScope,
            value.fields.map(field => [field.fieldPath, field.order || '', field.arrayConfig || ''])]);
          const local = await json('firebase/firestore.indexes.json');
          report.missingIndexes = local.indexes.filter(index => !report.indexes.some(existing => signature(existing) === signature(index)));
          report.indexListHasMorePages = Boolean(response.nextPageToken);
        }
        if (key === 'rulesRelease') {
          const ruleset = await get(`https://firebaserules.googleapis.com/v1/${response.rulesetName}`);
          const deployed = ruleset.source?.files?.find(file => file.name.endsWith('.rules'))?.content;
          const local = await readFile(resolve(root, 'firebase/firestore.rules'), 'utf8');
          report.rules = { releaseUpdatedAt: response.updateTime, localHash: sha(local), deployedHash: deployed ? sha(deployed) : null,
            matchesLocal: deployed != null && sha(local) === sha(deployed) };
        }
      } catch (error) { report[`${key}ReadError`] = { httpStatus: error.httpStatus || null, code: error.code || null }; }
    }
  } catch (error) { report.auth.accessAvailable = false; report.auth.failureCode = error.code || null; }
}
const output = process.argv.includes('--after') ? 'firebase-release-after.json' : 'firebase-release-readiness.json';
report.releaseReady = Boolean(report.functions && report.localExports.every(name => report.functions.some(fn => fn.name === name
  && fn.state === 'ACTIVE' && fn.region === 'europe-west1' && fn.runtime === 'nodejs22'))
  && report.rules?.matchesLocal && report.missingIndexes?.length === 0 && report.indexes?.every(index => index.state === 'READY')
  && !report.functionListHasMorePages && !report.indexListHasMorePages);
await writeFile(new URL(output, import.meta.url), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ localExports: report.localExports.length, runtime: report.runtime.node, unresolved: unresolved.length, outsideImports: outside.length,
  auth: report.auth, liveFunctions: report.functions?.length, missingFunctions: report.missingFunctions, databases: report.databases,
  missingIndexes: report.missingIndexes?.length, rulesMatch: report.rules?.matchesLocal,
  releaseReady: report.releaseReady, readErrors: Object.keys(report).filter(key => key.endsWith('ReadError')) }, null, 2));
