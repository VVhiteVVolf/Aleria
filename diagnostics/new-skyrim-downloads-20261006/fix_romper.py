"""Correct a stale UBE first-person path in the supplied 3BA plugin."""
from pathlib import Path
import json
import struct
import zlib
from stage import OUT,subrecords
from adapt_adrienne import field

def main():
    p=OUT/"mod-stage/Local - Travelers Romper 3BA 20261006/Traveler's Romper Outfit 3BA.esp";changes=[]
    def walk(blob):
        pos=0;output=[]
        while pos<len(blob):
            h=bytearray(blob[pos:pos+24]);kind=bytes(h[:4]);size=struct.unpack_from('<I',h,4)[0]
            if kind==b'GRUP':
                payload=walk(blob[pos+24:pos+size]);struct.pack_into('<I',h,4,len(payload)+24);output.extend([bytes(h),payload]);pos+=size;continue
            payload=blob[pos+24:pos+24+size];flags=struct.unpack_from('<I',h,8)[0]
            if kind==b'ARMA':
                if flags&0x40000:payload=zlib.decompress(payload[4:])
                fs=list(subrecords(payload));result=[]
                for k,v in fs:
                    if k==b'MOD5' and v.startswith(b'!UBE\\'):
                        replacement=dict(fs)[b'MOD3'];changes.append({'old':v.rstrip(b'\0').decode(),'new':replacement.rstrip(b'\0').decode()});v=replacement
                    result.append(field(k,v))
                payload=b''.join(result)
                if flags&0x40000:payload=struct.pack('<I',len(payload))+zlib.compress(payload)
                struct.pack_into('<I',h,4,len(payload))
            output.extend([bytes(h),payload]);pos+=24+size
        return b''.join(output)
    result=walk(p.read_bytes());assert len(changes)==1;p.write_bytes(result)
    (OUT/'romper-path-fix.json').write_text(json.dumps(changes,indent=2),encoding='utf-8');print(json.dumps(changes,indent=2))

if __name__=='__main__':main()
