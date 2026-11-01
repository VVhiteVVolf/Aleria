import assert from 'node:assert/strict';
const copy=value=>value==null?value:JSON.parse(JSON.stringify(value));
function firestoreCopy(value, path) {
  function validate(entry, field) {
    if (entry === undefined) throw new TypeError(`Undefined Firestore value at ${field}`);
    if (Array.isArray(entry)) for (const [index, child] of entry.entries()) validate(child, `${field}[${index}]`);
    else if (entry && typeof entry === 'object') for (const [key, child] of Object.entries(entry)) validate(child, `${field}.${key}`);
  }
  validate(value, path);
  return copy(value);
}
export function database(initial) {
  const data=new Map(Object.entries(copy(initial)));let id=0,queue=Promise.resolve();
  const doc=path=>({path,id:path.split('/').at(-1)});
  const query=source=>({...source,orderBy:(sortField,sortDirection)=>query({...source,sortField,sortDirection}),limit:count=>query({...source,count})});
  return {data,doc,collection:path=>({...query({collection:path}),doc:key=>doc(`${path}/${key || `comment-${++id}`}`),where:(field,operator,value)=>query({collection:path,field,value})}),
    runTransaction(work){const task=queue.catch(()=>{}).then(async()=>{const writes=[];
      const result=await work({async get(ref){assert.equal(writes.length,0,'reads precede writes');
        const snapshot=(path,value)=>({id:path.split('/').at(-1),exists:value!=null,data:()=>copy(value)});
        if(ref.collection){let rows=[...data].filter(([key,value])=>key.startsWith(ref.collection+'/') && (!ref.field || value[ref.field]===ref.value));
          if(ref.sortField)rows.sort((a,b)=>(ref.sortDirection==='desc'?-1:1)*(a[1][ref.sortField]-b[1][ref.sortField]));
          if(ref.count)rows=rows.slice(0,ref.count);
          return {docs:rows.map(([key,value])=>snapshot(key,value)),size:rows.length,empty:!rows.length};}
        return snapshot(ref.path,data.get(ref.path));},
        create(ref,value){const next=firestoreCopy(value,ref.path);writes.push(()=>{assert.equal(data.has(ref.path),false);data.set(ref.path,next);});},
        set(ref,value,options){const next=firestoreCopy(value,ref.path);writes.push(()=>data.set(ref.path,options?.merge ? {...copy(data.get(ref.path)),...next} : next));},
        delete(ref){writes.push(()=>data.delete(ref.path));},
        update(ref,value){const next=firestoreCopy(value,ref.path);writes.push(()=>{const current=copy(data.get(ref.path));assert.ok(current);for(const [path,entry]of Object.entries(next)){const parts=path.split('.');let node=current;for(const key of parts.slice(0,-1))node=node[key] ||= {};node[parts.at(-1)]=entry;}data.set(ref.path,current);});}
      });writes.forEach(write=>write());return result;});queue=task;return task;}};
}
