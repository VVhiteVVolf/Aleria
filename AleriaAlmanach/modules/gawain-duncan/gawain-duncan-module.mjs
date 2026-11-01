import { normalizeLandingData } from '../landing/landing-model.js';
import { GAWAIN_ID, DUNCAN_ID, GAWAIN_PORTRAIT, DUNCAN_PORTRAIT, GAWAIN_PUBLIC_BIOGRAPHY } from './gawain-public-biography.mjs';

export const GAWAIN_DUNCAN_ID = 'gawain-duncan';
export const GAWAIN_DUNCAN_CONTENT_VERSION = 2;
export const GAWAIN_DUNCAN_TRAINING_THREAD = 'modul-1781469771512::session:p-mqe96jum-izzv8';
const mountGuests = [
  {id:'gawain-duncan-mount-tanor',kind:'creature',creatureId:'companion-tanor',name:'Tanor',portrait:'https://i.imgur.com/TuGHu7s.png',
    role:'Gawains Rhyfelhengst',note:'Gehört Gawain. Sir Owain schenkte ihm den eigenwilligen Hengst zu seinem achtzehnten Geburtstag.',assignment:'active',temporary:false},
  {id:'gawain-duncan-mount-carreg',kind:'creature',creatureId:'companion-duncan-carreg',name:'Carreg',portrait:'/AleriaAlmanach/assets/companions/haus-gafyr/carreg.png',
    role:'Duncans Ritterschimmer',note:'Gehört Sir Duncan Gafyr und begleitet ihn als Reittier. Bleibt in seinem persönlichen Besitz.',assignment:'active',temporary:false}
];

function appendMissingGuests(current = [], defaults) {
  const guests = [...(Array.isArray(current) ? current : [])];
  for (const guest of defaults) {
    if (guests.some(row=>guest.creatureId ? row.creatureId===guest.creatureId : row.characterId===guest.characterId)) continue;
    let id=guest.id,index=2;
    while (guests.some(row=>row.id===id)) id=`${guest.id}-${index++}`;
    guests.push({...guest,id});
  }
  return guests;
}

function upgradeMountGuests(entry) {
  return { ...entry, gawainDuncanContentVersion:GAWAIN_DUNCAN_CONTENT_VERSION, pages:entry.pages.map(page=>{
    if (!page.landingPage) return page;
    const landing=page.landing || {},group=landing.group || {};
    return {...page,landing:{...landing,group:{...group,guests:appendMissingGuests(group.guests,mountGuests)}}};
  }) };
}
const blank = value => !String(value || '').replace(/<[^>]*>/g, '').replace(/[.\s…]/g, '');
const replaceText = (target, key, next, old = '') => { if (blank(target[key]) || target[key] === old) target[key] = next; };
const narrative = '<p>Gawain besitzt bereits den Ritterschlag seines Vaters. Was ihm fehlt, ist nicht der Titel, sondern die Erfahrung, ihn auch dann auszufüllen, wenn kein Becher gereicht, kein Diener gerufen und keine Bewunderung gewonnen werden kann. Er will reisen, Geschichten erleben und die Menschen kennenlernen, über deren Sorgen er am Hof bisher meistens nur zuhörte. Seine Mutter will wissen, ob aus diesem Wunsch auch Verantwortung werden kann.</p>'
  + '<p>So fiel im Offenen Gericht die Entscheidung: Bis zu Tudwals Hochzeit soll Gawain zwei Wochen Dienst in Gwynthor und seinen Vororten tun. Der Rat gab ihm keine ferne Heldentat auf. Patrouillen, Streitigkeiten und gewöhnliche Bürgeranliegen sollen zeigen, ob er aufmerksam bleibt, wenn eine Aufgabe unscheinbar ist. Sir Duncan Gafyr führt ihn. Taliesin, sein Kammerdiener und Vertrauter, darf ihm diese Arbeit ausdrücklich nicht abnehmen.</p>'
  + '<p>Duncan war schon während der Knappenzeit sein Rittervater. Er kennt Gawains Talent und seine bequemen Ausflüchte, seinen Stolz und die Freude, die ein ernst gemeintes Lob in ihm weckt. Der alte Waffenmeister muss deshalb nicht erst herausfinden, ob der Prinz ein Schwert halten kann. Er will sehen, ob Gawain urteilt, zuhört und eine begonnene Pflicht auch ohne Beifall zu Ende bringt.</p>'
  + '<p>Ihre Gemeinschaft lebt von diesem Unterschied. Gawain sucht den besonderen Augenblick; Duncan achtet darauf, was davor und danach getan werden muss. Der eine antwortet schnell und glänzend, der andere braucht bisweilen nur einen Blick. Gawains Witz verschwindet darunter nicht. Aber er trifft auf einen Mann, der ihn lange genug kennt, um zwischen einer guten Antwort und einer erledigten Aufgabe zu unterscheiden.</p>';
const relationship = '<p>Duncan führt diese kleine Gemeinschaft als Waffenmeister und früherer Rittervater. Gawain folgt ihm als bereits geschlagener Ritter, nicht als Knappe. Die alte Bindung besteht weiter, doch die Aufgabe hat sich verändert: Duncan soll ihm nicht die Grundlagen neu beibringen. Er soll dem jungen Ritter Gelegenheit geben, seinen eigenen Ansprüchen gerecht zu werden.</p>'
  + '<p>Gawain fällt es leicht, Duncans Strenge für eine weitere Zumutung zu halten. Gleichzeitig richtet er sich auf, sobald der Waffenmeister ihn ernsthaft lobt. Duncan weiß das und spart weder mit Anerkennung noch mit einer genauen Korrektur. Nach Gawains erstem Sieg gegen Gildas würdigte er die erkannte Öffnung und benannte im selben Atemzug die unkontrollierten Hiebe danach. Für ihn beginnt ein guter Unterricht gerade dort, wo ein junger Sieger am liebsten aufhören würde zuzuhören.</p>'
  + '<p>Auch Duncan hört zu. Auf dem Übungsplatz verfolgt er die Kampfweise der Wolfshorn mit wirklichem Interesse, lässt sich andere Erfahrungen erklären und misst einen Krieger nicht allein an der Härte seines Schlages. Als Nudd schwer getroffen wurde, hatte dessen Versorgung Vorrang vor jedem Wettstreit. Dass ein Kamerad nach der Übung wieder aufstehen kann, gehört für Duncan zur Kunst des Kämpfens.</p>'
  + '<p>Ylva Wolfshorn kommt als Gast an Gawains Seite. Sie ist weder seine Untergebene noch Teil dieser Rangfolge. Ihr Gramnir Freki bleibt ihr eigener Gefährte. Dass sie Gawains Spott zurückwies und seine Entschuldigung annahm, gibt ihrer Anwesenheit besonderes Gewicht: Hier geht jemand mit, dessen Achtung er sich durch sein Verhalten verdienen muss. Tanor und Carreg begleiten ihre jeweiligen Besitzer; aus ihren Tieren wird dadurch kein gemeinsamer Warenbestand.</p>';

function hierarchyContent(hierarchy) {
  const levels = [
    { label: 'Führung & Urteil', nodes: [{ title: 'Rittervater · Waffenmeister', subtitle: 'Sir Duncan Gafyr', portrait: DUNCAN_PORTRAIT,
      text: 'Leitet die Bewährung. Früherer Marschall, erfahrener Ausbilder und Gawains ehemaliger Rittervater. Er erwartet Dienst am Menschen, Aufmerksamkeit und Urteilskraft.' }] },
    { label: 'Ritter in der Bewährung', nodes: [{ title: 'Ritter des Hauses Draig', subtitle: 'Sir Gawain Draig', portrait: GAWAIN_PORTRAIT,
      text: 'Bereits von Galahad zum Ritter geschlagen; während der Knappenzeit von Duncan ausgebildet. Nun soll er unter dessen Aufsicht Verantwortung in Gwynthor tragen.' }] }
  ];
  return { ...hierarchy, layoutMode: 'vertical', treeDisplayMode: 'tabs', eyebrow: 'Ritterlicher Dienst', subtitle: 'Ein alter Rittervater und sein ehemaliger Knappe',
    centerLabel: 'Gawain & Duncan', organizationTitle: 'Gawains Bewährung', motto: 'Den Namen trägt man. Den Dienst verrichtet man.',
    description: 'Sir Duncan führt. Sir Gawain lernt, seinen eigenen Rang mit verlässlichem Handeln auszufüllen. Gäste und Tiere begleiten die Gemeinschaft außerhalb dieser Rangfolge.',
    detailsTitle: 'Ihr Auftrag', details: [{ label:'Zeitraum',value:'Zwei Wochen bis zur Hochzeit Tudwals.' },{label:'Weg',value:'Gwynthor und die Vororte; Patrouillen und Bürgeranliegen.'}],
    quoteLabel:'Der Maßstab', quote:'Einen guten Ritter erkennt man daran, wie er den Menschen dient.',
    chartTitle:'Rittervater & ehemaliger Knappe', chartIntro:'Duncans Weisung gilt für die gemeinsame Bewährung. Gawains Ritterschlag bleibt davon unberührt.',
    trees:[{id:'aufbau',parentTreeId:'',label:'Ritterlicher Dienst',levels}], levels:structuredClone(levels), footerNote:'Ylva und Freki sind Gäste der Gemeinschaft. Sie stehen nicht in dieser Hierarchie.' };
}

function prepareLanding(page) {
  const old = page.landing || {}, group = old.group || {};
  const members = [...(group.members || [])];
  for (const [id,characterId] of [['hierarchy:duncan gafyr',DUNCAN_ID],['hierarchy:gawain draig',GAWAIN_ID]]) {
    if (!members.some(member=>member.id===id)) members.push({id,characterId,kind:'character',linkMode:'manual',assignment:'active',status:'auto'});
  }
  const guests = appendMissingGuests(group.guests,[
    {id:'gawain-duncan-guest-ylva',kind:'character',characterId:'bSYZYAEOwiRgy44f6OmO',name:'Ylva Wolfshorn',portrait:'https://i.imgur.com/zQmDv85.png',role:'Gast · Kriegerin der Wolfshorn',note:'Begleitet die Gemeinschaft als eigenständiger Gast.',assignment:'active',temporary:true},
    {id:'gawain-duncan-guest-freki',kind:'creature',creatureId:'companion-ylva-freki',name:'Freki',portrait:'https://i.imgur.com/jO6WUgH.png',role:'Ylvas Gramnir-Gefährte',note:'Gehört Ylva. Seine Bindung und sein Kreaturbogen bleiben eigenständig.',assignment:'active',temporary:true},
    ...mountGuests
  ]);
  const emptyRow = (row, expression) => expression.test(row.title || '') && blank(row.text) && !row.time && !row.aleriaDate?.year;
  const info = (old.info || []).filter(row=>!emptyRow(row,/^Information \d+$/) && !(['Gildenruf','Aktuelles Gold','Vorräte'].includes(row.title) && ['Angesehen','12 GM','Gut versorgt'].includes(row.text)));
  if (!info.length) info.push({title:'Bewährung',text:'Zwei Wochen Dienst bis zu Tudwals Hochzeit.'},{title:'Unterwegs',text:'Gwynthor und seine Vororte.'},{title:'Gäste & Gefährten',text:'Ylva und Freki; Tanor bei Gawain, Carreg bei Duncan.'});
  page.landing = normalizeLandingData({ ...old, presentation:'folio', title:old.title || 'Gawain & Duncan',
    subtitle:!old.subtitle || old.subtitle==='Gawain & Duncan' ? 'Ein Ritter lernt, wofür er das Schwert trägt.' : old.subtitle,
    bannerImage:old.bannerImage || '/Stammbäume/assets/images/houses/Llamreis Ankunft/haus-draig.png',
    memberTitle:old.memberTitle==='Abenteurer' ? 'Ritter, Gäste & Gefährten' : old.memberTitle,
    questTitle:old.questTitle==='Quests' ? 'Was noch getan werden muss' : old.questTitle,
    members:(old.members || []).filter(member=>!/^Abenteurer \d+$/.test(member.name || '')),
    quests:(old.quests || []).filter(row=>!emptyRow(row,/^Quest \d+$/)), notes:(old.notes || []).filter(row=>!emptyRow(row,/^Notiz \d+$/)),
    events:(old.events || []).filter(row=>!emptyRow(row,/^Ereignis \d+$/)), info,
    group:{...group,location:group.location || 'Gwynthor',activity:group.activity || 'Ritterlicher Dienst unter Sir Duncan',status:group.status || 'Bewährung',
      threadId:group.threadId || GAWAIN_DUNCAN_TRAINING_THREAD,sceneThreads:[...new Set([...(group.sceneThreads || []),GAWAIN_DUNCAN_TRAINING_THREAD,'gawain-duncan::session:4'])],members,guests}
  });
}

export function withGawainDuncanContent(entry) {
  if (entry?.id !== GAWAIN_DUNCAN_ID || entry.gawainDuncanContentVersion >= GAWAIN_DUNCAN_CONTENT_VERSION || !Array.isArray(entry.pages)) return entry;
  if (entry.gawainDuncanContentVersion >= 1) return upgradeMountGuests(entry);
  const result = structuredClone(entry);
  const intro = result.pages.find(page=>page.commentThreadKey==='0');
  if (intro) {
    replaceText(intro,'description',narrative,'Erzählerischer Einstieg: Was ist geschehen, wer ist betroffen, und warum bleibt dieser Eintrag im Almanach erhalten?');
    replaceText(intro,'quote','Einen guten Ritter erkennt man daran, wie er den Menschen dient.');replaceText(intro,'quoteBy','— Sir Duncan Gafyr');
    if ((intro.stats || []).every(row=>row[1]==='Wert')) intro.stats=[['Gemeinschaft','Gawain & Duncan'],['Führung','Sir Duncan Gafyr'],['Ritter in der Bewährung','Sir Gawain Draig'],['Dienst','Gwynthor und die Vororte'],['Zeitraum','Bis zu Tudwals Hochzeit'],['Rittervater','Duncan · ehemaliger Ausbilder Gawains']];
    if (intro.commentSequence?.length===1 && intro.commentSequence[0].text==='Ein kurzer Kommentar kann die Stimmung bündeln, ohne die Erzählung zu überladen.') intro.commentSequence=[];
  }
  const profile = result.pages.find(page=>page.commentThreadKey==='1' && page.biographyPage);
  if (profile && blank(profile.biography?.biographyText)) {
    // The module carries the same public character portrait as both registers,
    // followed by the relationship specific to this travelling community.
    const biography = structuredClone(GAWAIN_PUBLIC_BIOGRAPHY);
    profile.pageTitle='Sir Gawain Draig';profile.description='Ein junger Ritter zwischen Hof und Burgpforte.';
    profile.stats=biography.stats;profile.quote=biography.quote;profile.quoteBy=biography.quoteBy;
    profile.biography={...profile.biography,...biography.biography,historyTitle:'An Sir Duncans Seite',historyText:relationship};
  }
  const hierarchy = result.pages.find(page=>page.hierarchyPage);
  if (hierarchy) hierarchy.hierarchy=hierarchyContent(hierarchy.hierarchy || {});
  const landing = result.pages.find(page=>page.landingPage);
  if (landing) prepareLanding(landing);
  const scene = result.pages.find(page=>page.commentThreadKey==='4' && page.sessionPage);
  if (scene) {
    replaceText(scene,'sessionIntro','Gwynthors Tore stehen offen. Hinter ihnen warten Wege, auf denen Gawains Name ihm die Arbeit nicht abnimmt. Zwischen Aufbruch und Rückkehr bleibt Zeit, das Erlebte zu besprechen, Ausrüstung zu richten und den nächsten Dienst vorzubereiten.','Einleitung der Szene. Beschreibe Ort, Anlass und Stimmung. Der eigentliche Szenenverlauf entsteht später über Kommentare.');
    replaceText(scene,'sessionHint','Setzt den gemeinsamen Weg hier fort.','Führe diese Szene als Kommentar fort.');
    replaceText(scene,'sessionEmptyTitle','Vor dem nächsten Aufbruch','Die Szene ist offen');replaceText(scene,'sessionEmptyText','Ein freier Augenblick zwischen Burg, Stadt und dem nächsten Auftrag.','Hier kann die Szene im fertigen Modus beginnen.');
  }
  result.gawainDuncanContentVersion=GAWAIN_DUNCAN_CONTENT_VERSION;
  return result;
}
