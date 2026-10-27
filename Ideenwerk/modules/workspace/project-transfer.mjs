import {uid,downloadJson} from '../ui/html.mjs';
import {MAX_FILE_BYTES,parseProjectText} from './schema.mjs';
export function createProjectTransfer({input,store,ask,toast,onImported}) {
  input.addEventListener('change',async()=>{
    const file=input.files[0];input.value='';if(!file)return;
    try{
      if(file.size>MAX_FILE_BYTES)throw new Error('Die Projektdatei darf höchstens 32 MB groß sein.');
      const project=parseProjectText(await file.text());
      if(store.get().boards.length+project.boards.length>30)throw new Error('Es sind maximal 30 Pinnwände möglich.');
      const confirmed=await ask({title:'Ideen hereinlassen?',description:`${project.boards.length} Pinnwände aus „${project.name}“ hinzufügen. Deine vorhandenen Pinnwände bleiben erhalten.`,input:false,confirm:'Pinnwände importieren'});
      if(!confirmed)return;
      const boards=project.boards.map(board=>({...board,id:uid(),name:`${board.name} · Import`.slice(0,120),example:false}));
      store.change(workspace=>workspace.boards.push(...boards),{reason:'import'});onImported(boards[0].id);toast('Importiert – einschließlich Bildern, Seiten und Mindmap-Verbindungen.');
    }catch(error){toast(error.message);}
  });
  return {
    import:()=>input.click(),
    export:()=>{const workspace=store.get();downloadJson(workspace,`Ideenwerk-${new Date().toISOString().slice(0,10)}.json`);toast('Projektdatei mit allen Pinnwänden und Bildern exportiert.');}
  };
}
