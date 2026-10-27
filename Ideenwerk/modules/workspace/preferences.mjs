const KEY='ideenwerk-view-v1';
export function loadPreferences() {
  try{const data=JSON.parse(localStorage.getItem(KEY));return {boardId:typeof data?.boardId==='string'?data.boardId:null,view:['board','grid','list'].includes(data?.view)?data.view:'board',zoom:typeof data?.zoom==='number'?Math.max(.5,Math.min(1.3,data.zoom)):1};}catch{return {boardId:null,view:'board',zoom:1};}
}
export function savePreferences(preferences) {try{localStorage.setItem(KEY,JSON.stringify(preferences));}catch{/* The document itself is stored separately in IndexedDB. */}}
