import {uid} from '../ui/html.mjs';
import {edgeGeometry} from './mindmap-geometry.mjs';
export function createMindmapController(root,{getModule,updateMap,render,toast}) {
  const state={selected:null,edge:null,connecting:null};
  let drag=null,suppressClick=false;
  function select(nodeId) {
    if(state.connecting&&state.connecting!==nodeId){
      const from=state.connecting,to=nodeId;
      const duplicate=getModule().mindmap.edges.some(edge=>[edge.from,edge.to].includes(from)&&[edge.from,edge.to].includes(to));
      if(!duplicate)updateMap(map=>{if(map.edges.length>=500)throw new Error('Maximal 500 Verbindungen pro Mindmap.');map.edges.push({id:uid(),from,to,label:''});});
      else toast('Diese Gedanken sind bereits verbunden.');
      state.connecting=null;
    }
    state.selected=nodeId;state.edge=null;render();
  }
  const actions={
    'add-node':()=>{const map=getModule().mindmap;if(map.nodes.length>=200){toast('Maximal 200 Gedanken pro Mindmap.');return;}const node={id:uid(),text:'Neuer Gedanke',x:80+(map.nodes.length%5)*220,y:100+(Math.floor(map.nodes.length/5)%6)*120,color:getModule().color};updateMap(item=>item.nodes.push(node));state.selected=node.id;state.edge=null;render();root.querySelector('[data-map-field="text"]')?.select();},
    'connect-nodes':()=>{state.connecting=state.connecting?null:state.selected;render();},
    'delete-node':()=>{const id=state.selected;updateMap(map=>{map.nodes=map.nodes.filter(node=>node.id!==id);map.edges=map.edges.filter(edge=>edge.from!==id&&edge.to!==id);});state.selected=null;state.connecting=null;render();},
    'delete-edge':()=>{const id=state.edge;updateMap(map=>{map.edges=map.edges.filter(edge=>edge.id!==id);});state.edge=null;render();}
  };
  root.addEventListener('click',event=>{
    if(!getModule()||!event.target.closest('.mindmap-editor'))return;
    if(suppressClick){suppressClick=false;return;}
    const node=event.target.closest('[data-node]'),edge=event.target.closest('[data-edge]');
    if(node){select(node.dataset.node);return;}
    if(edge){state.edge=edge.dataset.edge;state.selected=null;state.connecting=null;render();}
  });
  root.addEventListener('input',event=>{
    const field=event.target.dataset.mapField;if(!field)return;
    updateMap(map=>{const target=field==='text'?map.nodes.find(node=>node.id===state.selected):map.edges.find(edge=>edge.id===state.edge);if(target)target[field]=event.target.value;},{groupKey:`map-${state.selected||state.edge}`});
    if(field==='text'){
      const group=root.querySelector(`[data-node="${CSS.escape(state.selected)}"]`);
      group.querySelector('text').textContent=event.target.value.length>19?`${event.target.value.slice(0,18)}…`:event.target.value;
      group.setAttribute('aria-label',`${event.target.value}: auswählen; mit Pfeiltasten verschieben`);
    }else{
      const group=root.querySelector(`[data-edge="${CSS.escape(state.edge)}"]`);
      group.querySelector('text').textContent=event.target.value;
      group.setAttribute('aria-label',`Verbindung ${event.target.value||'ohne Beschriftung'} bearbeiten`);
    }
  });
  root.addEventListener('pointerdown',event=>{
    const nodeElement=event.target.closest('[data-node]');if(!nodeElement||event.button!==0)return;
    const node=getModule().mindmap.nodes.find(item=>item.id===nodeElement.dataset.node),svg=nodeElement.closest('svg');
    drag={nodeElement,svg,id:node.id,x:node.x,y:node.y,startX:event.clientX,startY:event.clientY,pointer:event.pointerId,newX:node.x,newY:node.y,moved:false};
    nodeElement.setPointerCapture(event.pointerId);
  });
  root.addEventListener('pointermove',event=>{
    if(!drag||event.pointerId!==drag.pointer)return;
    const scale=1450/drag.svg.getBoundingClientRect().width;
    const dx=(event.clientX-drag.startX)*scale,dy=(event.clientY-drag.startY)*scale;
    if(Math.abs(dx)+Math.abs(dy)<5&&!drag.moved)return;drag.moved=true;
    drag.newX=Math.min(1300,Math.max(0,Math.round(drag.x+dx)));drag.newY=Math.min(850,Math.max(0,Math.round(drag.y+dy)));
    drag.nodeElement.setAttribute('transform',`translate(${drag.newX},${drag.newY})`);
    const preview=structuredClone(getModule().mindmap);const node=preview.nodes.find(item=>item.id===drag.id);node.x=drag.newX;node.y=drag.newY;
    preview.edges.forEach(edge=>{
      if(edge.from!==drag.id&&edge.to!==drag.id)return;
      const from=preview.nodes.find(item=>item.id===edge.from),to=preview.nodes.find(item=>item.id===edge.to);
      const geometry=edgeGeometry(from,to),group=drag.svg.querySelector(`[data-edge="${CSS.escape(edge.id)}"]`);
      group?.querySelectorAll('path').forEach(path=>path.setAttribute('d',geometry.path));
      const text=group?.querySelector('text');text?.setAttribute('x',geometry.labelX);text?.setAttribute('y',geometry.labelY);
    });
  });
  const finish=event=>{
    if(!drag||event.pointerId!==drag.pointer)return;const done=drag;drag=null;
    if(event.type==='pointercancel'){render();return;}
    if(done.moved){suppressClick=true;updateMap(map=>{const node=map.nodes.find(item=>item.id===done.id);node.x=done.newX;node.y=done.newY;});state.selected=done.id;state.edge=null;render();setTimeout(()=>{suppressClick=false;},0);}
  };
  root.addEventListener('pointerup',finish);root.addEventListener('pointercancel',finish);
  root.addEventListener('keydown',event=>{
    const node=event.target.closest('[data-node]'),edge=event.target.closest('[data-edge]');
    if((node||edge)&&['Enter',' '].includes(event.key)){event.preventDefault();if(node)select(node.dataset.node);else{state.edge=edge.dataset.edge;state.selected=null;render();}}
    if(node&&['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(event.key)){event.preventDefault();const id=node.dataset.node;updateMap(map=>{const target=map.nodes.find(item=>item.id===id);target.x=Math.max(0,Math.min(1300,target.x+({'ArrowLeft':-20,'ArrowRight':20}[event.key]||0)));target.y=Math.max(0,Math.min(850,target.y+({'ArrowUp':-20,'ArrowDown':20}[event.key]||0)));});render();root.querySelector(`[data-node="${CSS.escape(id)}"]`)?.focus();}
  });
  return {state,action:(name)=>{if(!actions[name])return false;actions[name]();return true;},reset(){Object.assign(state,{selected:null,edge:null,connecting:null});drag=null;}};
}
