// Visual QA only. Renders production views with explicit local example data.
// No Firebase connection, persistence or canonical group assignment.
import { html } from '/AleriaAlmanach/modules/landing/group-landing-markup.js';
import { normalizeLandingData } from '/AleriaAlmanach/modules/landing/landing-model.js';
import { renderGroupBody } from '/AleriaAlmanach/modules/landing/group-landing-view.js';
import { mountGroupNavigation } from '/AleriaAlmanach/modules/landing/group-landing-navigation.js';
import { mountLandingQuestJournal, unmountLandingQuestJournal } from '/AleriaAlmanach/modules/landing/landing-quest-journal.js';

Object.assign(window, { sanitizeLandingData: normalizeLandingData,
  getInitialChar: value => value?.slice(0, 1) || '·', buildNav: () => '', buildAleriaDateBadge: () => '', moduleEntries: [], currentPage: 0 });
const root = document.querySelector('[data-preview-root]');
const members = [
  ['Gawain Draig','Haus Draig','Jungritter','haus-draig/gawain-draig.jpg'],
  ['Freya Skald','Stimme der Gemeinschaft','Skald','haus-skald/freya-skald.png'],
  ['Guinevere Neidr','Mit ruhiger Hand','Bogenschützin','haus-draig/guinevere-neidr.jpg'],
  ['Fenrir Varulv','Ein verlässlicher Gefährte','Krieger','haus-varulv/fenrir-varulv.png']
].map(([name,role,className,file],index)=>({id:`member-${index}`,characterId:`example-${index}`,name,role,className,status:'Bereit',portrait:`/Stammbäume/assets/images/portraits/${file}`,badgeIcon:''}));
const source = normalizeLandingData({ presentation:'folio',title:'Vier Wege. Eine Geschichte.',
  subtitle:'Zwischen den Hügeln und dem Meer liegt der nächste Aufbruch. Hier sammeln wir unsere Wege, Versprechen und Erinnerungen.',
  memberTitle:'Unsere Gefährten',questTitle:'Was wir uns vorgenommen haben',notesTitle:'Aus unserem Reisebuch',mapTitle:'Am Rand der Küste',
  infoTitle:'Am Wegesrand',members,
  mapImage:'/Karten/Cenyr/celtigerns-wacht/llamrais-ankunft/gwynthor-bannkreis/Kartenbilder/display/gwynthor-normal-2048-q90.webp',
  mapLink:'/Karten/Cenyr/celtigerns-wacht/llamrais-ankunft/gwynthor-bannkreis/',mapButtonLabel:'Die Karte ausbreiten ↗',
  quests:[{id:'plan-one',title:'Vorräte für die Weiterreise',text:'Vor dem Aufbruch noch beim Markt vorbeischauen. Proviant, ein neuer Führstrick und etwas Papier stehen auf unserer Liste.',kind:'Gemeinsames Vorhaben',progress:35}],
  notes:[{id:'note-one',title:'Ein Platz am Feuer',text:'Manche Wege führen uns weiter als gedacht. Bevor wir morgen aufbrechen, treffen wir uns noch einmal am alten Tor und gehen die Strecke gemeinsam durch.',authorName:'Die Gefährten',createdAt:'2026-11-01'}],
  info:[{title:'Nächster Treffpunkt',text:'Am alten Stadttor, sobald der Morgennebel sich hebt.',icon:'⌖'},{title:'Für unterwegs',text:'Zeit für kleine Umwege und ein trockenes Lager einplanen.',icon:'✧'}]
});
const entry = { id:'design-example-only',title:source.title,symbol:'',pages:[] };
const run = {id:'example-active',title:'Der Städter und sein Pferd',status:'active',groupName:'Vier Wege',party:members.map(row=>({kind:'character',recordId:row.characterId,name:row.name})),links:{modules:[entry.id]},updatedAt:'2026-11-01',started:{date:{year:1740,month:3,day:9},time:'10:25'},rewardStatus:'pending'};
let stopNavigation, context;
function render(kind='normal') {
  stopNavigation?.();if(context)unmountLandingQuestJournal(context);
  const data = kind==='empty' ? normalizeLandingData({presentation:'folio',title:'Ein neues Abenteuer beginnt',memberTitle:'Unsere Gefährten'}) : normalizeLandingData({...source,presentation:kind==='classic'?'classic':'folio',...(kind==='group'?{group:{status:'Aufbruch',location:'Gwynthor',treasury:{openingCopper:50},members:[]}}:{})});
  const page = {landingPage:true,landing:data};entry.pages=[page];window.currentEntry=entry;
  if(kind==='group') {
    const roster=members.map((member,index)=>({...member,source:'hierarchy',assignment:'active',readiness:{known:true,key:'ready',label:'Bereit für den Aufbruch',current:[29,22,25,37][index],maximum:[29,22,25,37][index],temporary:0,defense:15,conditions:[],resources:[]}}));
    const fragments={quests:buildLandingQuests(data),journal:AleriaLandingModel.landingQuestJournalShell(entry.id),notes:buildLandingNotes(data),events:'',info:buildLandingInfo(data),map:buildLandingMap(data)};
    root.innerHTML=renderGroupBody(data,entry,0,roster,[],null,fragments);
    stopNavigation=mountGroupNavigation(root.querySelector('.group-landing'),root,kind);
  } else root.innerHTML=buildLandingPage(page,entry,0,1);
  context={root,entry,page,pageIndex:0,preview:false};
  const quests=kind==='empty'?[]:[{id:'gwynthor-der-staedter-und-sein-pferd',title:'Der Städter und sein Pferd',links:{modules:[entry.id]}}];
  mountLandingQuestJournal(context,{client:async()=>({context(_request,receive){receive({quests,runs:kind==='empty'?[]:[run,{...run,id:'example-archive',title:'Ein Brief über das Meer',status:'completed',ended:{date:{year:1740,month:3,day:8},time:'16:40'},endedKey:'1740-03-08T16:40',rewardStatus:'claimed'}]});return()=>{};}}),catalog:async()=>({quests})});
}
document.querySelector('[data-preview-kind]').addEventListener('change',event=>render(event.target.value));
root.addEventListener('click',event=>{if(event.target.closest('[data-landing-action="edit-settings"],[data-landing-action="edit-note"],[data-landing-action="edit-quest"]')) event.stopImmediatePropagation();});
render();
