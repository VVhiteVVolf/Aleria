import { execFileSync } from 'node:child_process';

export function git(root, args, options = {}) {
  return execFileSync('git', args, { cwd: root, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024, ...options });
}

export function releaseCommit(root) {
  return git(root, ['rev-parse', 'HEAD']).trim();
}

export function assertLocalReleaseMessage(message) {
  if (!/\[skip netlify\]/i.test(message)) {
    throw Error('The pushed HEAD commit must contain [skip netlify]. Create a release commit with that marker; do not amend published history.');
  }
}

export function assertReleaseWorkspace(root, { generated = [], expectedCommit } = {}) {
  if (expectedCommit && releaseCommit(root) !== expectedCommit) throw Error('HEAD changed during release. Prepare again.');
  const changed = [...new Set([
    ...git(root, ['diff', '--name-only', '-z', 'HEAD']).split('\0'),
    ...git(root, ['ls-files', '--others', '--exclude-standard', '-z']).split('\0'),
  ].filter(Boolean))];
  const blocked = changed.filter(file => !file.startsWith('diagnostics/') && !generated.includes(file));
  if (blocked.length) throw Error('Commit application changes before releasing:\n' + blocked.join('\n'));
  return releaseCommit(root);
}
