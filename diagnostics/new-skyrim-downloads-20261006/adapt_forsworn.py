"""Keep Madmen NPC behavior and apply the downloaded Forsworn outfits at runtime."""
from pathlib import Path
import json
import struct
import zlib
from stage import OUT,subrecords
from adapt_adrienne import field

def main():
    plan=json.loads((OUT/'install-plan.json').read_text());mod=next(m for m in plan['mods'] if m['index']==39);base=Path(mod['directory']);plugin=base/'ForswornVarietyArmorPack.esp';data=plugin.read_bytes();rules=[]
    def walk(blob):
        result=[];pos=0
        while pos<len(blob):
            h=bytearray(blob[pos:pos+24]);kind=bytes(h[:4]);size=struct.unpack_from('<I',h,4)[0]
            if kind==b'GRUP':
                inner=walk(blob[pos+24:pos+size]);pos+=size
                if not inner:continue
                struct.pack_into('<I',h,4,len(inner)+24);result.extend([bytes(h),inner]);continue
            payload=blob[pos+24:pos+24+size];pos+=24+size
            if kind==b'NPC_':
                if struct.unpack_from('<I',h,8)[0]&0x40000:payload=zlib.decompress(payload[4:])
                fs=dict(subrecords(payload));form=struct.unpack_from('<I',h,12)[0]
                assert form>>24==0 and b'DOFT' in fs
                outfit=struct.unpack('<I',fs[b'DOFT'])[0];assert outfit>>24==1
                rules.append('filterByNpcs=Skyrim.esm|%06X:outfitDefault=ForswornVarietyArmorPack.esp|%03X'%(form,outfit&0xffffff));continue
            result.extend([bytes(h),payload])
        return b''.join(result)
    rewritten=walk(data);assert len(rules)==12
    # Recompute HEDR record count after removing only the twelve NPC override records.
    size=struct.unpack_from('<I',rewritten,4)[0];fs=[]
    for k,v in subrecords(rewritten[24:24+size]):
        if k==b'HEDR':v=v[:4]+struct.pack('<I',struct.unpack_from('<I',v,4)[0]-12)+v[8:]
        fs.append(field(k,v))
    payload=b''.join(fs);head=bytearray(rewritten[:24]);struct.pack_into('<I',head,4,len(payload));plugin.write_bytes(bytes(head)+payload+rewritten[24+size:])
    ini=base/'SKSE/Plugins/SkyPatcher/npc/Local Fashions of Forsworn 20261006.ini';ini.parent.mkdir(parents=True,exist_ok=True)
    ini.write_text('; Original outfit distribution, preserving Madmen and Nolvus NPC data.\n'+'\n'.join(rules)+'\n',encoding='utf-8')
    (OUT/'forsworn-compatibility.json').write_text(json.dumps({'NPC_overrides_removed':12,'outfit_rules':rules,'own_armor_outfit_and_leveled_records_preserved':True},indent=2),encoding='utf-8')
    print('Preserved Madmen NPCs; prepared 12 SkyPatcher outfit rules')

if __name__=='__main__':main()
