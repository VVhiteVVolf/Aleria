import {uid} from '../ui/html.mjs';
import {FORMAT, VERSION} from './schema.mjs';

export function createWorkspace() {
  return {format:FORMAT,version:VERSION,id:uid(),name:'Patricks Ideenwerk',updatedAt:new Date().toISOString(),boards:[{id:uid(),name:'Dein Ideenraum',example:false,modules:[]}]};
}
