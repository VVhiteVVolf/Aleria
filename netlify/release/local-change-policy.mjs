// Discovery rules only. These records never authorize a build, copy or deployment.
const OBJECT_ID = /^[a-f0-9]{40}$/;
const SHA256 = /^[a-f0-9]{64}$/;
const INTERNAL_ROOTS = ['diagnostics/', '.release-state/', '.tmp/', '.vscode/', '.agents/', '.codex/', 'output/'];

export function assertLocalChangePath(file) {
  if (typeof file !== 'string' || !file || file.length > 2048 || /[\\:\x00-\x1f\x7f]/.test(file)
    || file.split('/').some(part => !part || part === '.' || part === '..')) {
    throw Error('Invalid local-change path.');
  }
  return file;
}

export function parseLocalInputReceipt(value) {
  if (value?.owner !== 'aleria-local-publication-inputs-v1' || !OBJECT_ID.test(value.publicCommit)
    || !Array.isArray(value.records) || value.records.length > 100000) throw Error('Invalid local publication-input receipt.');
  if (value.reviewedMainCommit !== undefined && !OBJECT_ID.test(value.reviewedMainCommit)) throw Error('Invalid reviewed Main commit.');
  const records = new Map();
  for (const record of value.records) {
    assertLocalChangePath(record.path);
    if (records.has(record.path) || !SHA256.test(record.reviewedLocalSha256)
      || !OBJECT_ID.test(record.reconciledPublicBlob)) throw Error('Invalid or duplicate local publication-input record.');
    records.set(record.path, { ...record });
  }
  return { publicCommit: value.publicCommit, reviewedMainCommit: value.reviewedMainCommit, records };
}

export function parseLocalChangeScope(value) {
  if (value?.owner !== 'aleria-local-change-scope-v1') throw Error('Invalid local-change scope.');
  if (value.reviewedMainCommit !== undefined && !OBJECT_ID.test(value.reviewedMainCommit)) throw Error('Invalid reviewed Main commit.');
  assertLocalChangePath(value.publicRoot);
  const exclusions = new Map();
  if (!Array.isArray(value.excludedPaths) || value.excludedPaths.length > 100000) throw Error('Invalid scope exclusions.');
  for (const row of value.excludedPaths) {
    assertLocalChangePath(row.path);
    if (exclusions.has(row.path) || typeof row.reason !== 'string' || !row.reason || row.reason.length > 500) throw Error('Invalid scope exclusion.');
    exclusions.set(row.path, row.reason);
  }
  for (const field of ['excludedPrefixes', 'excludedNameFragments']) {
    if (!Array.isArray(value[field]) || value[field].length > 1000) throw Error('Invalid scope rules.');
    for (const item of value[field]) {
      assertLocalChangePath(field === 'excludedPrefixes' ? item.replace(/\/$/, '') : item);
      if (field === 'excludedPrefixes' && !item.endsWith('/')) throw Error('Scope prefixes must end in /.');
    }
  }
  return { ...value, exclusions };
}

export function localChangeExclusion(file, scope) {
  // Git reports an untracked nested repository as a directory with a trailing
  // slash. Technical evidence is excluded before I/O, just like its files.
  const directory = typeof file === 'string' && file.endsWith('/');
  assertLocalChangePath(directory ? file.slice(0, -1) : file);
  if (INTERNAL_ROOTS.some(prefix => file.startsWith(prefix))
    || file.split('/').some(part => ['.git', 'node_modules', '__pycache__', '.cache', 'test-results', 'playwright-report'].includes(part))
    || /(?:^|\/)\.env(?:\.|$)|\.(?:log|pyc|pyo)$/.test(file)
    || /(?:^|\/)AGENTS\.md$/.test(file)) return { reason: 'local-tools-and-evidence', technical: true };
  if (directory) assertLocalChangePath(file);
  if (scope.exclusions.has(file)) return { reason: scope.exclusions.get(file), technical: false };
  if (scope.excludedPrefixes.some(prefix => file.startsWith(prefix))) return { reason: 'local-authoring-scope', technical: false };
  if (scope.excludedNameFragments.some(fragment => file.toLowerCase().includes(fragment.toLowerCase()))) {
    return { reason: 'explicit-user-exclusion', technical: false };
  }
  return null;
}

export function classifyLocalChange({ record, currentBlob, local }) {
  if (local.blocked) return { status: 'blocked', reason: local.blocked };
  if (local.missing) return { status: 'deleted', reason: 'local-file-missing; manual review only' };
  if (record && local.sha256 === record.reviewedLocalSha256) {
    return { status: 'reconciled', reason: 'local-input-already-reviewed', publicRefined: currentBlob !== record.reconciledPublicBlob };
  }
  if (currentBlob && [local.blob, local.normalizedBlob].includes(currentBlob)) {
    return { status: 'public-equivalent', reason: local.blob === currentBlob ? 'exact-public-bytes' : 'line-ending-equivalent' };
  }
  if (record) return currentBlob === record.reconciledPublicBlob
    ? { status: 'local-change', reason: 'local-input-changed-since-review' }
    : { status: 'conflict', reason: 'local-and-public-changed-since-review' };
  return currentBlob ? { status: 'conflict', reason: 'different-public-file-without-reviewed-local-base' }
    : { status: 'new', reason: 'not-in-verified-public-tree; review required' };
}
