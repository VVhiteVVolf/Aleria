"""Fast Zstandard/TAR capture with per-file independent SHA-256 verification."""
import csv
import hashlib
import json
import os
import shutil
import sys
import tarfile
import time
from pathlib import Path
import zstandard

BLOCK=4*1024*1024


class HashReader:
    def __init__(self,stream):
        self.stream=stream
        self.digest=hashlib.sha256()
        self.count=0

    def read(self,size=-1):
        block=self.stream.read(size)
        self.digest.update(block)
        self.count+=len(block)
        return block


def capture(specfile,output):
    output=Path(output)
    spec=json.loads(Path(specfile).read_text(encoding='utf-8'))
    items=spec['entries'] if isinstance(spec,dict) else spec
    if output.exists():raise FileExistsError(output)
    entries=[];empty=[];names=set()
    for item in items:
        source=Path(item['source'])
        if not source.exists():raise FileNotFoundError(source)
        if source.is_symlink() or source.is_junction():raise RuntimeError('Unreviewed source link: '+str(source))
        if source.is_file():
            found=[(source,item['prefix'])]
        else:
            found=[]
            for directory,dirs,files in os.walk(source,followlinks=False,onerror=lambda e:(_ for _ in ()).throw(e)):
                for name in dirs+files:
                    f=Path(directory)/name
                    if f.is_symlink() or f.is_junction():raise RuntimeError('Unreviewed link: '+str(f))
                if not dirs and not files:
                    rel=Path(directory).relative_to(source).as_posix()
                    empty.append((Path(directory),item['prefix'].rstrip('/')+('/'+rel if rel!='.' else '')))
                for name in files:
                    f=Path(directory)/name
                    found.append((f,item['prefix'].rstrip('/')+'/'+f.relative_to(source).as_posix()))
        for f,relative in found:
            if relative.casefold() in names:raise RuntimeError('Duplicate path: '+relative)
            names.add(relative.casefold());entries.append((f,relative))
    total=sum(f.stat().st_size for f,_ in entries)
    manifest=output.with_suffix('').with_suffix('.manifest.csv')
    state=output.with_suffix('').with_suffix('.status.json')
    last=0
    def progress(stage,index,done):
        nonlocal last
        if time.monotonic()-last>15:
            state.write_text(json.dumps({'stage':stage,'files_done':index,'files_total':len(entries),'bytes_done':done,'bytes_total':total}),encoding='utf-8')
            last=time.monotonic()
    print(json.dumps({'stage':'start','format':'tar.zst','files':len(entries),'logical_gib':round(total/2**30,2),'output':str(output)}),flush=True)
    done=0
    with manifest.open('x',newline='',encoding='utf-8') as mf,output.open('xb') as raw:
        writer=csv.DictWriter(mf,fieldnames=['path','source','bytes','mtime_ns','sha256'])
        writer.writeheader()
        with zstandard.ZstdCompressor(level=1,write_checksum=True).stream_writer(raw,closefd=False) as compressed:
            with tarfile.open(fileobj=compressed,mode='w|',format=tarfile.PAX_FORMAT,bufsize=1024*1024,copybufsize=BLOCK) as archive:
                for directory,relative in empty:archive.addfile(archive.gettarinfo(str(directory),relative))
                for index,(source,relative) in enumerate(entries,1):
                    if shutil.disk_usage(output.parent).free<5*1024**3:raise RuntimeError('Less than 5 GiB free; stopped without deleting anything')
                    before=source.stat()
                    with source.open('rb') as src:
                        reader=HashReader(src)
                        archive.addfile(archive.gettarinfo(str(source),relative),reader)
                    after=source.stat()
                    if (before.st_size,before.st_mtime_ns)!=(after.st_size,after.st_mtime_ns) or reader.count!=before.st_size:
                        raise RuntimeError('Source changed: '+str(source))
                    writer.writerow({'path':relative,'source':str(source),'bytes':before.st_size,'mtime_ns':before.st_mtime_ns,'sha256':reader.digest.hexdigest()})
                    done+=before.st_size;progress('capture',index,done)
    checked=done=0;last=0;seen_dirs=set()
    with output.open('rb') as raw,manifest.open(newline='',encoding='utf-8') as mf:
        expected=iter(csv.DictReader(mf))
        compressed_source=HashReader(raw)
        with zstandard.ZstdDecompressor().stream_reader(compressed_source,closefd=False) as decoded:
            with tarfile.open(fileobj=decoded,mode='r|',bufsize=1024*1024) as archive:
                for member in archive:
                    if member.isdir():seen_dirs.add(member.name.rstrip('/'));continue
                    if not member.isfile():raise RuntimeError('Unexpected archived entry type')
                    row=next(expected)
                    if member.name!=row['path'] or member.size!=int(row['bytes']):raise RuntimeError('Manifest mismatch: '+member.name)
                    digest=hashlib.sha256();count=0
                    with archive.extractfile(member) as src:
                        while block:=src.read(BLOCK):digest.update(block);count+=len(block)
                    if count!=int(row['bytes']) or digest.hexdigest()!=row['sha256']:raise RuntimeError('SHA-256 mismatch: '+member.name)
                    checked+=1;done+=count;progress('verify',checked,done)
            # Consume frame footer too, validating the Zstandard frame checksum.
            while decoded.read(BLOCK):pass
        if next(expected,None) is not None or checked!=len(entries):raise RuntimeError('Missing archive entries')
    if seen_dirs!={relative.rstrip('/') for _,relative in empty}:raise RuntimeError('Empty directory mismatch')
    if compressed_source.count!=output.stat().st_size:raise RuntimeError('Compressed archive was not read completely')
    result={'stage':'verified','format':'tar.zst','archive':output.name,'archive_sha256':compressed_source.digest.hexdigest(),'files':checked,'source_bytes':total,'archive_bytes':output.stat().st_size,'verification':'Every archived file decompressed and SHA-256 compared to source during capture'}
    state.write_text(json.dumps(result,indent=2),encoding='utf-8');print(json.dumps(result),flush=True)


if __name__=='__main__':capture(sys.argv[1],sys.argv[2])
