"""Create and independently verify a new ZIP snapshot; never alters sources."""
import argparse
import csv
import hashlib
import json
import os
import shutil
import time
import zipfile
from pathlib import Path

CHUNK = 4 * 1024 * 1024


def capture(specfile, output):
    spec = json.loads(Path(specfile).read_text(encoding='utf-8'))
    output = Path(output)
    output.parent.mkdir(parents=True, exist_ok=True)
    if output.exists():
        raise FileExistsError(output)
    manifest = output.with_suffix('.manifest.csv')
    state = output.with_suffix('.status.json')
    entries = []
    empty_directories = []
    seen = set()
    for item in spec:
        source = Path(item['source'])
        if not source.exists():
            if item.get('optional'):
                continue
            raise FileNotFoundError(source)
        if source.is_symlink() or source.is_junction():
            raise RuntimeError(f'Unreviewed source link: {source}')
        if source.is_file():
            paths = [(source, item['prefix'])]
        else:
            paths = []
            for directory, dirs, files in os.walk(source, followlinks=False):
                if not dirs and not files:
                    relative_dir=Path(directory).relative_to(source).as_posix()
                    empty_directories.append((Path(directory),item['prefix'].rstrip('/')+('/'+relative_dir if relative_dir!='.' else '')+'/'))
                for name in dirs + files:
                    p = Path(directory) / name
                    if p.is_symlink() or p.is_junction():
                        raise RuntimeError(f'Unreviewed link: {p}')
                for name in files:
                    p = Path(directory) / name
                    paths.append((p, item['prefix'].rstrip('/')+'/'+p.relative_to(source).as_posix()))
        for path, relative in paths:
            if relative.casefold() in seen:
                raise RuntimeError(f'Duplicate target: {relative}')
            seen.add(relative.casefold())
            entries.append((path,relative))
    total = sum(p.stat().st_size for p, _ in entries)
    print(json.dumps({'stage':'start','files':len(entries),'logical_gib':round(total/2**30,2),'output':str(output)}),flush=True)
    with manifest.open('x',newline='',encoding='utf-8') as mf, zipfile.ZipFile(output,'x',compression=zipfile.ZIP_DEFLATED,compresslevel=1,allowZip64=True) as archive:
        writer=csv.DictWriter(mf,fieldnames=['path','source','bytes','mtime_ns','sha256'])
        writer.writeheader()
        for directory,relative in empty_directories:
            archive.write(directory,relative)
        done=0
        last=0
        for index,(path,relative) in enumerate(entries,1):
            if shutil.disk_usage(output.parent).free < 5 * 1024**3:
                raise RuntimeError('Less than 5 GiB free on backup disk; stopped without deleting anything')
            before=path.stat()
            digest=hashlib.sha256()
            info=zipfile.ZipInfo.from_file(path,arcname=relative,strict_timestamps=False)
            info.compress_type=zipfile.ZIP_DEFLATED
            info._compresslevel=1
            with path.open('rb') as src,archive.open(info,'w',force_zip64=True) as dest:
                while block:=src.read(CHUNK):
                    digest.update(block)
                    dest.write(block)
            after=path.stat()
            if (before.st_size,before.st_mtime_ns)!=(after.st_size,after.st_mtime_ns):
                raise RuntimeError(f'Source changed during capture: {path}')
            writer.writerow({'path':relative,'source':str(path),'bytes':before.st_size,'mtime_ns':before.st_mtime_ns,'sha256':digest.hexdigest()})
            done+=before.st_size
            if time.monotonic()-last>15:
                state.write_text(json.dumps({'stage':'capture','files_done':index,'files_total':len(entries),'bytes_done':done,'bytes_total':total}),encoding='utf-8')
                last=time.monotonic()
    checked=0
    last=0
    verified_bytes=0
    with zipfile.ZipFile(output) as archive,manifest.open(newline='',encoding='utf-8') as mf:
        for row in csv.DictReader(mf):
            digest=hashlib.sha256()
            count=0
            with archive.open(row['path']) as src:
                while block:=src.read(CHUNK):
                    digest.update(block);count+=len(block)
            if digest.hexdigest()!=row['sha256'] or count!=int(row['bytes']):
                raise RuntimeError(f'Backup verification failed: {row["path"]}')
            checked+=1
            verified_bytes+=count
            if time.monotonic()-last>15:
                state.write_text(json.dumps({'stage':'verify','files_done':checked,'files_total':len(entries),'bytes_done':verified_bytes,'bytes_total':total}),encoding='utf-8')
                last=time.monotonic()
        if checked!=sum(not info.is_dir() for info in archive.infolist()):
            raise RuntimeError('Archive/manifest file count mismatch')
        if {info.filename for info in archive.infolist() if info.is_dir()}!={relative for _,relative in empty_directories}:
            raise RuntimeError('Empty directory verification failed')
    result={'stage':'verified','files':checked,'source_bytes':total,'archive_bytes':output.stat().st_size,'verification':'Every archived file decompressed and SHA-256 compared to source during capture'}
    state.write_text(json.dumps(result,indent=2),encoding='utf-8')
    print(json.dumps(result),flush=True)


if __name__=='__main__':
    parser=argparse.ArgumentParser()
    parser.add_argument('spec');parser.add_argument('output')
    args=parser.parse_args()
    spec=json.loads(Path(args.spec).read_text(encoding='utf-8'))
    if isinstance(spec,dict) and spec.get('format')=='tar.zst':
        import subprocess
        interpreter=spec['python']
        target=Path(args.output).with_suffix('.tar.zst')
        raise SystemExit(subprocess.call([interpreter,str(Path(__file__).with_name('capture_tar.py')),args.spec,str(target)]))
    capture(args.spec,args.output)
