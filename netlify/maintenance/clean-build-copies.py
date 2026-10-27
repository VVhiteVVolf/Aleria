"""Remove only verified, old files from twelve named throwaway Vite builds.

Plan first; apply rechecks every path, content hash and file identity. No folder
is recursively removed. Source files, instructions, profiles and backups stay.
"""
import argparse
import hashlib
import json
import os
from pathlib import Path
import re
import shutil
import stat
import subprocess
import time

BUILD_NAMES = ('wellenruh-build', 'praetendenten-build',
    *(f'praetendenten-step{i}-build' for i in range(2, 8)),
    'praetendenten-canon-build', 'praetendenten-layout-build',
    'leitheach-timeline-build', 'coastal-history-build')
KEEP_EXTENSIONS = {'.md', '.txt', '.py', '.mjs', '.ps1', '.cmd', '.bat', '.docx', '.pdf'}
BUNDLE = re.compile(r'^assets/[\w.-]+-[\w-]{8,}\.(?:js|css|js\.map|css\.map)$')


def git(root, args):
    executable = shutil.which('git') or 'C:/Program Files/Git/cmd/git.exe'
    return subprocess.check_output([executable, *args], cwd=root).decode('utf-8')


def remote_objects(root):
    commit = git(root, ['rev-parse', 'origin/master']).strip()
    objects = {line.split(' ', 1)[0] for line in git(root,
        ['rev-list', '--objects', commit]).splitlines()}
    return commit, objects


def git_blob_hash(file):
    size = file.stat().st_size
    digest = hashlib.sha1(f'blob {size}\0'.encode())
    with file.open('rb') as source:
        while chunk := source.read(1024 * 1024):
            digest.update(chunk)
    return digest.hexdigest()


def checked_path(root, relative):
    parts = Path(relative).parts
    if len(parts) < 3 or parts[0] != '.tmp' or parts[1] not in BUILD_NAMES:
        raise ValueError('Path is not inside an approved throwaway build')
    if Path(relative).is_absolute() or '..' in parts:
        raise ValueError('Unsafe cleanup path')
    lexical = root / relative
    info = lexical.lstat()
    if lexical.is_symlink() or getattr(info, 'st_file_attributes', 0) & getattr(stat, 'FILE_ATTRIBUTE_REPARSE_POINT', 1024):
        raise ValueError('Reparse points are never cleanup targets')
    resolved = lexical.resolve(strict=True)
    if not resolved.is_relative_to(root / '.tmp') or resolved != lexical:
        raise ValueError('Cleanup path redirects outside its approved location')
    if not resolved.is_file() or resolved.suffix.lower() in KEEP_EXTENSIONS:
        raise ValueError('Protected instruction, method or non-file')
    return resolved


def valid_build(root, name):
    entry = root / '.tmp' / name / 'AleriaAlmanach/AleriaAlmanach.html'
    return entry.is_file() and '../assets/almanach-' in entry.read_text(encoding='utf-8', errors='replace')


def create_plan(root, objects, commit):
    entries, totals = [], []
    cutoff = time.time() - 24 * 3600
    for name in BUILD_NAMES:
        base = root / '.tmp' / name
        if not valid_build(root, name):
            continue
        selected = 0
        retained = 0
        for current, dirs, files in os.walk(base, followlinks=False):
            dirs[:] = [d for d in dirs if not Path(current, d).is_symlink()
                and not os.path.isjunction(Path(current, d))]
            for filename in files:
                candidate = Path(current, filename)
                relative = candidate.relative_to(root).as_posix()
                try:
                    file = checked_path(root, relative)
                except (OSError, ValueError):
                    retained += 1
                    continue
                info = file.stat()
                if info.st_mtime > cutoff:
                    retained += 1
                    continue
                object_id = git_blob_hash(file)
                local = file.relative_to(base).as_posix()
                reason = 'reachable-in-pushed-git' if object_id in objects else 'generated-vite-bundle' if BUNDLE.fullmatch(local) else None
                if not reason:
                    retained += 1
                    continue
                entries.append({'path': relative, 'object': object_id, 'bytes': info.st_size,
                    'mtime_ns': info.st_mtime_ns, 'inode': info.st_ino, 'device': info.st_dev,
                    'links': info.st_nlink, 'reason': reason})
                selected += info.st_size
        totals.append({'build': name, 'selectedBytes': selected, 'retainedFiles': retained})
        print(json.dumps(totals[-1]), flush=True)
    return {'version': 1, 'root': str(root), 'remoteCommit': commit,
        'createdAt': time.time(), 'builds': totals, 'files': entries}


def apply_plan(root, plan, objects):
    if plan.get('version') != 1 or Path(plan['root']).resolve() != root:
        raise ValueError('Foreign cleanup plan')
    removed, removed_bytes, skipped = 0, 0, []
    approved_builds = {name for name in BUILD_NAMES if valid_build(root, name)}
    for entry in plan['files']:
        try:
            file = checked_path(root, entry['path'])
            if Path(entry['path']).parts[1] not in approved_builds:
                raise ValueError('Build identity changed')
            info = file.stat()
            if (info.st_size, info.st_mtime_ns, info.st_ino, info.st_dev) != (
                    entry['bytes'], entry['mtime_ns'], entry['inode'], entry['device']):
                raise ValueError('File changed after planning')
            if git_blob_hash(file) != entry['object']:
                raise ValueError('Content changed after planning')
            local = '/'.join(Path(entry['path']).parts[2:])
            if entry['object'] not in objects and not BUNDLE.fullmatch(local):
                raise ValueError('Not recoverable from pushed Git or a generated bundle')
            file.unlink()
            removed += 1
            removed_bytes += info.st_size
            if removed % 5000 == 0:
                print(json.dumps({'removedFiles': removed, 'removedBytes': removed_bytes}), flush=True)
        except (OSError, ValueError) as error:
            skipped.append({'path': entry['path'], 'reason': str(error)})
    return {'removedFiles': removed, 'removedLogicalBytes': removed_bytes, 'skipped': skipped}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--root', type=Path, default=Path(__file__).resolve().parents[2])
    parser.add_argument('--plan', type=Path, required=True)
    parser.add_argument('--apply', action='store_true')
    args = parser.parse_args()
    root = args.root.resolve(strict=True)
    commit, objects = remote_objects(root)
    if args.apply:
        plan = json.loads(args.plan.read_text(encoding='utf-8'))
        before = shutil.disk_usage(root).free
        result = apply_plan(root, plan, objects)
        result.update({'freeBefore': before, 'freeAfter': shutil.disk_usage(root).free,
            'remoteCommit': commit, 'finishedAt': time.time()})
        output = args.plan.with_suffix('.result.json')
        output.write_text(json.dumps(result, indent=2), encoding='utf-8')
        print(json.dumps({k: v for k, v in result.items() if k != 'skipped'}))
        print('Skipped:', len(result['skipped']))
    else:
        plan = create_plan(root, objects, commit)
        args.plan.parent.mkdir(parents=True, exist_ok=True)
        args.plan.write_text(json.dumps(plan, indent=2), encoding='utf-8')
        print(json.dumps({'selectedFiles': len(plan['files']),
            'selectedGiB': round(sum(f['bytes'] for f in plan['files']) / 1024**3, 2)}))


if __name__ == '__main__':
    main()
