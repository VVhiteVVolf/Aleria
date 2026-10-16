import mmap
import struct
import zlib
import json
from inventory import OUT

def subrecords(data):
    pos=0;extended=None
    while pos+6<=len(data):
        kind=data[pos:pos+4];size=struct.unpack_from('<H',data,pos+4)[0];pos+=6
        if kind==b'XXXX':extended=struct.unpack_from('<I',data,pos)[0];pos+=size;continue
        if extended is not None:size=extended;extended=None
        value=data[pos:pos+size];pos+=size
        if len(value)!=size:raise ValueError('Truncated subrecord')
        yield kind,value

def decode(value):return value.rstrip(b'\0').decode('utf-8',errors='replace')

def scan(path):
    masters=[];records=[]
    with open(path,'rb') as file,mmap.mmap(file.fileno(),0,access=mmap.ACCESS_READ) as data:
        pos=0
        while pos+24<=len(data):
            kind=data[pos:pos+4];size=struct.unpack_from('<I',data,pos+4)[0]
            if kind==b'GRUP':pos+=24;continue
            if pos+24+size>len(data):raise ValueError('Record outside file')
            if kind in {b'TES4',b'ARMA',b'ARMO'}:
                flags,form=struct.unpack_from('<II',data,pos+8)
                payload=data[pos+24:pos+24+size]
                if flags&0x40000:payload=zlib.decompress(payload[4:])
                fields=list(subrecords(payload))
                if kind==b'TES4':masters=[decode(value) for key,value in fields if key==b'MAST']
                else:
                    record={'signature':kind.decode(),'form_id':form,'flags':flags,'models':{},'addons':[]}
                    for key,value in fields:
                        if key==b'EDID':record['editor_id']=decode(value)
                        if key in {b'BOD2',b'BODT'} and len(value)>=4:record['slot_mask']=struct.unpack_from('<I',value)[0]
                        if kind==b'ARMA' and key in {b'MOD2',b'MOD3',b'MOD4',b'MOD5'}:record['models'][key.decode()]=decode(value)
                        if kind==b'ARMO' and key==b'MODL' and len(value)==4:record['addons'].append(struct.unpack('<I',value)[0])
                    records.append(record)
            pos+=24+size
    return masters,records

def main():
    inventory=json.loads((OUT/'inventory.json').read_text(encoding='utf-8'))
    effective={};headers={};errors=[]
    for index,plugin in enumerate(inventory['plugins']):
        source=inventory['plugin_providers'].get(plugin.lower())
        if not source:errors.append({'plugin':plugin,'error':'Missing plugin provider'});continue
        try:masters,records=scan(source['path'])
        except Exception as error:errors.append({'plugin':plugin,'error':str(error)});continue
        headers[plugin]={'masters':masters,'provider':source['mod']}
        def identifier(form):
            owner=masters[form>>24] if form>>24<len(masters) else plugin
            return owner.lower()+':'+format(form&0xffffff,'06X')
        for record in records:
            record.update(plugin=plugin,provider=source['mod'],identity=identifier(record['form_id']))
            record['addon_identities']=[identifier(form) for form in record['addons']]
            effective[record['identity']]=record
        if index%500==0:print('Plugin record scan',index,flush=True)
    arms=[r for r in effective.values() if r['signature']=='ARMA' and not r['flags']&0x20]
    armor=[r for r in effective.values() if r['signature']=='ARMO' and not r['flags']&0x20]
    result={'headers':headers,'armor_addons':arms,'armor_records':armor,'errors':errors}
    (OUT/'plugin-records.json').write_text(json.dumps(result,ensure_ascii=False),encoding='utf-8')
    print(json.dumps({'plugin_headers':len(headers),'winning_ARMA':len(arms),'winning_ARMO':len(armor),'errors':errors[:15]},indent=2))

if __name__=='__main__':main()
