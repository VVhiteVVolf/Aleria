import { renderWarHub } from './war-hub-render.mjs';
import { renderFactionPage } from './war-faction-render.mjs';
import { renderWarEventPage } from './war-event-render.mjs';

export function renderWarPage(page){
  if(page.kind==='hub')return renderWarHub();
  if(page.kind==='faction')return renderFactionPage(page.faction);
  if(page.kind==='event')return renderWarEventPage(page.id);
  throw new Error(`No completed renderer registered for war page: ${page.id}`);
}
