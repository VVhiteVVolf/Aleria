import struct
import zlib

def lz4_decode(data,expected=None,dictionary=b''):
    output=bytearray(dictionary);initial=len(output);pos=0
    while pos<len(data):
        token=data[pos];pos+=1;literal=token>>4
        if literal==15:
            while True:
                value=data[pos];pos+=1;literal+=value
                if value!=255:break
        output.extend(data[pos:pos+literal]);pos+=literal
        if pos==len(data):break
        offset=data[pos]|data[pos+1]<<8;pos+=2
        if not offset or offset>len(output):raise ValueError('Invalid LZ4 offset')
        length=(token&15)+4
        if token&15==15:
            while True:
                value=data[pos];pos+=1;length+=value
                if value!=255:break
        for _ in range(length):output.append(output[-offset])
    if expected is not None and len(output)-initial!=expected:raise ValueError('LZ4 decompressed size mismatch')
    return bytes(output[initial:])

def lz4_frame(data):
    """Decode independent or linked blocks in SSE BSA LZ4 frames."""
    if data[:4]!=b'\x04\x22\x4d\x18':raise ValueError('Invalid LZ4 frame magic')
    flags=data[4];pos=6
    if flags>>6!=1 or flags&1:raise ValueError('Unsupported LZ4 frame version/dictionary ID')
    if flags&8:pos+=8
    if flags&1:pos+=4
    pos+=1  # Header checksum; archive integrity is checked separately.
    output=bytearray()
    while True:
        block=struct.unpack_from('<I',data,pos)[0];pos+=4
        if block==0:break
        length=block&0x7fffffff
        content=data[pos:pos+length];pos+=length
        if len(content)!=length:raise ValueError('Truncated LZ4 frame')
        history=b'' if flags&0x20 else bytes(output[-65536:])
        output.extend(content if block&0x80000000 else lz4_decode(content,dictionary=history))
        if flags&0x10:pos+=4
    if flags&4:pos+=4
    if pos!=len(data):raise ValueError('Unexpected trailing LZ4 frame bytes')
    return bytes(output)

def read_entry(entry):
    with open(entry['archive'],'rb') as file:
        file.seek(entry['offset']);payload=file.read(entry['size'])
    if entry['embedded_names']:
        payload=payload[1+payload[0]:]
    if entry['compressed']:
        size=struct.unpack_from('<I',payload)[0]
        payload=lz4_frame(payload[4:]) if entry['version']==105 and payload[4:8]==b'\x04\x22\x4d\x18' else lz4_decode(payload[4:],size) if entry['version']==105 else zlib.decompress(payload[4:])
        if len(payload)!=size:raise ValueError('BSA decompressed size mismatch')
    return payload
