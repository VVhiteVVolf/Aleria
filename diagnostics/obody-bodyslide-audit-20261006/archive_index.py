import json
import struct
from pathlib import Path
from inventory import OUT, normalized

def read_index(path):
    with open(path,'rb') as f:
        magic,version,offset,flags,folder_count,file_count,folder_bytes,file_bytes,file_flags=struct.unpack('<4s8I',f.read(36))
        if magic!=b'BSA\0' or version not in {103,104,105}:raise ValueError('Unsupported BSA header')
        if not flags&1 or not flags&2:raise ValueError('BSA lacks names')
        f.seek(offset)
        folders=[]
        for _ in range(folder_count):
            if version==105:hash_value,count,unused,blockoffset=struct.unpack('<QIIQ',f.read(24))
            else:hash_value,count,blockoffset=struct.unpack('<QII',f.read(16))
            folders.append(count)
        entries=[]
        for count in folders:
            length=struct.unpack('<B',f.read(1))[0];folder=f.read(length).rstrip(b'\0').decode('utf-8',errors='replace')
            for _ in range(count):
                hash_value,size,entryoffset=struct.unpack('<QII',f.read(16))
                entries.append({'folder':folder,'size':size&0x3fffffff,'offset':entryoffset,'compressed':bool(flags&4)^bool(size&0x40000000)})
        names=f.read(file_bytes).split(b'\0')
        if names and not names[-1]:names.pop()
        if len(names)!=file_count or len(entries)!=file_count:raise ValueError('BSA table/name count mismatch')
        result=[]
        for entry,name in zip(entries,names):
            relative=normalized(entry['folder']+'/'+name.decode('utf-8',errors='replace'))
            if relative.startswith('meshes/') and relative.endswith(('.nif','.tri')):
                entry.update(relative=relative,archive=str(path),version=version,embedded_names=bool(flags&0x100));entry.pop('folder')
                result.append(entry)
        return result

def main():
    inv=json.loads((OUT/'inventory.json').read_text(encoding='utf-8'))
    active={Path(p).stem.lower():i for i,p in enumerate(inv['plugins'])}
    archives={}
    for source in inv['archives']:archives.setdefault(Path(source['path']).name.lower(),source)
    records=[];errors=[];status=[]
    for filename,source in archives.items():
        stem=Path(filename).stem
        matched=[index for plugin,index in active.items() if stem==plugin or stem.startswith(plugin+' - ')]
        preload=filename.startswith('skyrim - meshes')
        enabled=bool(matched) or preload
        try:entries=read_index(source['path'])
        except Exception as error:errors.append({'archive':source['path'],'error':str(error)});continue
        status.append({'archive':source['path'],'mod':source['mod'],'mesh_entries':len(entries),'loaded_by_active_plugin_or_stock_preload':enabled})
        if enabled:
            for entry in entries:entry.update(mod=source['mod'],load_index=max(matched) if matched else -1)
            records.extend(entries)
    winners={}
    for record in sorted(records,key=lambda r:r['load_index']):winners[record['relative']]=record
    result={'winning_archive_files':winners,'archives':status,'errors':errors}
    (OUT/'archives.json').write_text(json.dumps(result,ensure_ascii=False),encoding='utf-8')
    print(json.dumps({'archives_indexed':len(status),'mesh_bearing_archives':sum(bool(a['mesh_entries']) for a in status),'winning_paths':len(winners),'errors':errors[:10]},indent=2))

if __name__=='__main__':main()
