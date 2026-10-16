"""Restore verified files into a new directory; TAR.ZST requires zstandard."""
import argparse
import csv
import hashlib
import json
import os
import shutil
import tarfile
import zipfile
from pathlib import Path, PurePosixPath

CHUNK=4*1024*1024


def safe_relative(value):
    if '\\' in value or ':' in value:
        raise ValueError('Invalid archive path: '+value)
    path=PurePosixPath(value)
    if path.is_absolute() or '..' in path.parts or not path.parts:
        raise ValueError('Unsafe archive path: '+value)
    return path


def selected(name,scope,custom,mods):
    parts=safe_relative(name).parts
    if scope=='all':
        return True
    if scope=='profiles':
        return parts[:3]==('instance','MODS','profiles')
    return (len(parts)>=4 and parts[:3]==('instance','MODS','mods')
            and parts[3] in custom and (not mods or parts[3] in mods))


def write_verified(src,row,destination):
    target=destination.joinpath(*safe_relative(row['path']).parts)
    target.parent.mkdir(parents=True,exist_ok=True)
    digest=hashlib.sha256();size=0
    with target.open('xb') as out:
        while block:=src.read(CHUNK):
            out.write(block);digest.update(block);size+=len(block)
    if digest.hexdigest()!=row['sha256'] or size!=int(row['bytes']):
        raise RuntimeError('RESTORE FAILED checksum: '+row['path'])
    timestamp=int(row['mtime_ns'])
    os.utime(target,ns=(timestamp,timestamp))


def extract_package(archive,rows,destination,scope,custom,mods):
    if archive.suffix=='.zip':
        with zipfile.ZipFile(archive) as source:
            for row in rows:
                with source.open(row['path']) as src:write_verified(src,row,destination)
            for info in source.infolist():
                if info.is_dir() and selected(info.filename,scope,custom,mods):
                    destination.joinpath(*safe_relative(info.filename).parts).mkdir(parents=True,exist_ok=True)
        return len(rows)
    import zstandard
    pending={row['path']:row for row in rows}
    with archive.open('rb') as raw,zstandard.ZstdDecompressor().stream_reader(raw) as decoded:
        with tarfile.open(fileobj=decoded,mode='r|',bufsize=1024*1024) as source:
            for member in source:
                if member.isdir() and selected(member.name,scope,custom,mods):
                    destination.joinpath(*safe_relative(member.name).parts).mkdir(parents=True,exist_ok=True)
                if member.name not in pending:continue
                if not member.isfile():raise RuntimeError('Selected archive entry is not a regular file')
                row=pending.pop(member.name)
                with source.extractfile(member) as src:write_verified(src,row,destination)
        while decoded.read(CHUNK):pass
    if pending:raise RuntimeError('Missing selected archive entries')
    return len(rows)


def restore(backup,destination,scope,mods):
    if destination.exists():
        raise RuntimeError('Destination must not exist. Choose a new staging directory; no existing installation will be overwritten.')
    summary=json.loads((backup/'BACKUP_COMPLETE.json').read_text(encoding='utf-8'))
    if summary.get('status')!='VERIFIED':
        raise RuntimeError('Backup is not marked complete and verified.')
    custom=set(json.loads((backup/'metadata'/'added-mod-folders.json').read_text(encoding='utf-8')))
    if mods and (scope!='custom' or not set(mods)<=custom):
        raise ValueError('--mod must name an additional mod folder and requires --scope custom')
    packages=[]
    total=0
    names=set()
    for package in summary['packages']:
        archive=backup/package['archive']
        manifest=backup/package['manifest']
        rows=[]
        with manifest.open(newline='',encoding='utf-8') as stream:
            for row in csv.DictReader(stream):
                if selected(row['path'],scope,custom,mods):
                    if row['path'].casefold() in names:
                        raise RuntimeError('Duplicate restore path: '+row['path'])
                    names.add(row['path'].casefold())
                    rows.append(row)
                    total+=int(row['bytes'])
        if rows:
            packages.append((archive,rows))
    if not names:
        raise RuntimeError('No files matched the selection.')
    if any(archive.name.endswith('.tar.zst') for archive,_ in packages):
        try:import zstandard
        except ImportError:raise RuntimeError('Use Python with zstandard installed (tested: Miniconda Python 3.13, zstandard 0.23.0), or use bundled 7-Zip.') from None
    ancestor=destination.parent
    while not ancestor.exists():
        ancestor=ancestor.parent
    if shutil.disk_usage(ancestor).free<total+2*1024**3:
        raise RuntimeError(f'Not enough space: selected files need {total/2**30:.2f} GiB plus 2 GiB reserve.')
    destination.mkdir(parents=True,exist_ok=False)
    count=0
    for archive,rows in packages:
        print('Restoring',archive.name,flush=True)
        count+=extract_package(archive,rows,destination,scope,custom,mods)
    (destination/'RESTORE_VERIFIED.json').write_text(json.dumps({'scope':scope,'mods':mods,'files':count,'bytes':total,'backup':str(backup)},indent=2),encoding='utf-8')
    print(f'Verified {count} restored files ({total/2**30:.2f} GiB). No existing installation was modified.',flush=True)


if __name__=='__main__':
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--backup',type=Path,default=Path(__file__).resolve().parent.parent)
    parser.add_argument('--destination',type=Path,required=True)
    parser.add_argument('--scope',choices=['custom','profiles','all'],default='custom')
    parser.add_argument('--mod',action='append',default=[])
    args=parser.parse_args()
    restore(args.backup,args.destination,args.scope,args.mod)
