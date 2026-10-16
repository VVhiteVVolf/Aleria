"""Convert Adrianne's appearance override to a SkyPatcher template, retaining Nolvus AI."""
from pathlib import Path
import json
import shutil
import struct
import zlib
from stage import OUT,subrecords,header

def field(kind,value):
    return kind+struct.pack('<H',len(value))+value if len(value)<=65535 else b'XXXX'+struct.pack('<HI',4,len(value))+kind+b'\0\0'+value

def main():
    plan=json.loads((OUT/'install-plan.json').read_text());mod=next(m for m in plan['mods'] if m['index']==42);base=Path(mod['directory']);plugin=base/'[ZckeZckT_CV01] Adrienne Replacer.esp'
    source=plugin.read_bytes();old=OUT/'unpacked/42'/plugin.name
    if source!=old.read_bytes():raise RuntimeError('Source already modified')
    own=len(header(plugin)['masters']);form=(own<<24)|0x815;edid='LocalAdrienneAppearance20261006';changed=[]
    def walk(blob):
        result=[];pos=0
        while pos<len(blob):
            h=bytearray(blob[pos:pos+24]);kind=bytes(h[:4]);size=struct.unpack_from('<I',h,4)[0]
            if kind==b'GRUP':
                inner=walk(blob[pos+24:pos+size]);struct.pack_into('<I',h,4,24+len(inner));result.extend([bytes(h),inner]);pos+=size;continue
            payload=blob[pos+24:pos+24+size];flags=struct.unpack_from('<I',h,8)[0]
            if kind in {b'TES4',b'NPC_'}:
                if flags&0x40000:payload=zlib.decompress(payload[4:])
                fs=list(subrecords(payload));new=[]
                for k,v in fs:
                    if kind==b'TES4' and k==b'HEDR':v=v[:8]+struct.pack('<I',0x816)
                    if kind==b'TES4' and k==b'ONAM':continue
                    if kind==b'NPC_' and k==b'EDID':v=edid.encode()+b'\0'
                    new.append(field(k,v))
                payload=b''.join(new)
                if kind==b'NPC_':
                    assert struct.unpack_from('<I',h,12)[0]==0x13BB9
                    struct.pack_into('<I',h,12,form);changed.append('NPC override converted to unused local appearance template 00000815')
                if flags&0x40000:payload=struct.pack('<I',len(payload))+zlib.compress(payload)
                struct.pack_into('<I',h,4,len(payload))
            result.extend([bytes(h),payload]);pos+=24+size
        assert pos==len(blob);return b''.join(result)
    converted=walk(source);assert len(changed)==1;plugin.write_bytes(converted)
    mesh=base/'meshes/actors/character/facegendata/facegeom/Skyrim.esm/00013BB9.nif'
    dest=mesh.parent.parent/plugin.name/'00000815.nif';dest.parent.mkdir(parents=True);shutil.copy2(mesh,dest);mesh.unlink()
    tint=base/'textures/actors/character/facegendata/facetint/Skyrim.esm/00013BB9.dds'
    if tint.is_file():
        dest=tint.parent.parent/plugin.name/'00000815.dds';dest.parent.mkdir(parents=True);shutil.copy2(tint,dest)
    ini=base/'SKSE/Plugins/SkyPatcher/npc/Local Adrienne Appearance 20261006.ini';ini.parent.mkdir(parents=True)
    ini.write_text('; Appearance only. Nolvus factions, AI, quests, stats and inventory remain on the original NPC.\nfilterByNpcs=AdrianneAvenicci:copyVisualStyle='+edid+':skin='+edid+'\n',encoding='utf-8')
    receipt={'changes':changed,'original_archive':mod['archive'],'method':'Same visual template / copyVisualStyle mechanism as downloaded 3DNPC SkyPatcher edition','original_NPC_override_removed':True,'original_headpart_records_and_references_unchanged':True,'template_form':hex(form),'facegen_copied':True}
    (OUT/'adrienne-compatibility.json').write_text(json.dumps(receipt,indent=2),encoding='utf-8');print(json.dumps(receipt,indent=2))

if __name__=='__main__':main()
