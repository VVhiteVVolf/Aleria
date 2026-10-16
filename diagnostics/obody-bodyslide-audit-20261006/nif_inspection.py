import hashlib
import io
import struct

def inspect_nif(path):
    with (io.BytesIO(path) if isinstance(path,bytes) else open(path,'rb')) as stream:
        if not stream.readline().startswith(b'Gamebryo File Format'):raise ValueError('Not a Gamebryo NIF')
        def read(fmt):
            count=struct.calcsize('<'+fmt); data=stream.read(count)
            if len(data)!=count:raise ValueError('Truncated NIF')
            values=struct.unpack('<'+fmt,data)
            return values[0] if len(values)==1 else values
        def string(fmt):
            count=read(fmt)
            return stream.read(count).rstrip(b'\0').decode('utf-8',errors='replace')
        version=read('I');endian=read('B');user=read('I');count=read('I');bs=read('I')
        if version!=0x14020007 or endian!=1 or user!=12 or bs not in {83,100}:raise ValueError('Unsupported NIF version')
        for _ in range(3):string('B')
        types=[string('I') for _ in range(read('H'))]
        ids=[read('H') for _ in range(count)];sizes=[read('I') for _ in range(count)]
        nstrings=read('I');read('I');strings=[string('I') for _ in range(nstrings)]
        for _ in range(read('I')):read('I')
        morphs=[];shapes=[]
        for type_id,size in zip(ids,sizes):
            start=stream.tell();type_name=types[type_id]
            if type_name=='NiStringExtraData':
                data=stream.read(min(size,8))
                if len(data)==8:
                    name,value=struct.unpack('<II',data)
                    if name<len(strings) and strings[name]=='BODYTRI' and value<len(strings):morphs.append(strings[value])
            elif type_name in {'BSTriShape','BSDynamicTriShape','BSSubIndexTriShape','NiTriShape'}:
                data=stream.read(size)
                name=struct.unpack_from('<I',data)[0]
                record={'name':strings[name] if name<len(strings) else str(name),'type':type_name}
                # SSE BSTriShape vertex buffer. NiTriShape and LE shapes are explicitly left unknown.
                if bs==100 and type_name in {'BSTriShape','BSDynamicTriShape','BSSubIndexTriShape'}:
                    try:
                        extra_count=struct.unpack_from('<I',data,4)[0]
                        position=8+extra_count*4+4+2+12+36+4+4+16+12
                        vertex_desc=struct.unpack_from('<Q',data,position)[0];position+=8
                        triangles,vertices,buffer_size=struct.unpack_from('<IHI',data,position);position+=10
                        stride=(vertex_desc & 0xF)*4
                        if vertices and stride>=12 and buffer_size>=vertices*stride and position+vertices*stride<=len(data):
                            digest=hashlib.sha256()
                            for vertex in range(vertices):digest.update(data[position+vertex*stride:position+vertex*stride+12])
                            record.update(vertices=vertices,triangles=triangles,position_sha256=digest.hexdigest())
                    except (struct.error,IndexError):pass
                shapes.append(record)
            stream.seek(start+size)
        return {'version':version,'bs_version':bs,'shapes':shapes,'bodytri':morphs,'bones':[s for s in strings if s.startswith(('NPC ','HDT ','CME ','L Breast','R Breast'))]}

def inspect_tri(path):
    with open(path,'rb') as file:
        header=file.read(16)
    return {'signature':header[:4].decode('ascii',errors='replace'),'valid_bodymorph_signature':header.startswith(b'PIRT')}
