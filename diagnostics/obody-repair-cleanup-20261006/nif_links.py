"""Update typed BODYTRI string values, preserving every NIF data block byte-for-byte."""
import io
import struct

def header(data):
    stream=io.BytesIO(data);line=stream.readline()
    if not line.startswith(b'Gamebryo File Format'):raise ValueError('Unsupported NIF header')
    def read(fmt):
        size=struct.calcsize('<'+fmt);raw=stream.read(size)
        if len(raw)!=size:raise ValueError('Truncated NIF header')
        return struct.unpack('<'+fmt,raw)[0]
    def text(fmt):return stream.read(read(fmt))
    if read('I')!=0x14020007 or read('B')!=1 or read('I')!=12:raise ValueError('Unsupported NIF version')
    count=read('I');bs=read('I')
    if bs not in {83,100}:raise ValueError('Unsupported Bethesda NIF version')
    for _ in range(3):text('B')
    types=[text('I').decode('utf-8') for _ in range(read('H'))]
    ids=[read('H') for _ in range(count)];sizes=[read('I') for _ in range(count)]
    string_start=stream.tell();nstrings=read('I');read('I')
    strings=[text('I') for _ in range(nstrings)];string_end=stream.tell()
    for _ in range(read('I')):read('I')
    block_start=stream.tell();blocks=[]
    for index,size in zip(ids,sizes):
        blocks.append((types[index],stream.read(size)))
    return {'strings':strings,'string_start':string_start,'string_end':string_end,'block_start':block_start,'blocks':blocks}

def normalize_bodytri(data,relative):
    info=header(data);strings=list(info['strings']);replacement=relative.removeprefix('meshes/').replace('/','\\').encode('utf-8');changed=[]
    for kind,block in info['blocks']:
        if kind!='NiStringExtraData' or len(block)<8:continue
        name,value=struct.unpack_from('<II',block)
        if name>=len(strings) or value>=len(strings):continue
        if strings[name]!=b'BODYTRI' or strings[value]==replacement:continue
        changed.append({'old':strings[value].decode('utf-8'),'new':replacement.decode('utf-8')});strings[value]=replacement
    if not changed:return data,[]
    table=struct.pack('<II',len(strings),max(map(len,strings),default=0))+b''.join(struct.pack('<I',len(s))+s for s in strings)
    result=data[:info['string_start']]+table+data[info['string_end']:]
    after=header(result)
    if data[info['block_start']:]!=result[after['block_start']:]:raise AssertionError('NIF geometry/data blocks changed during string repair')
    return result,changed
