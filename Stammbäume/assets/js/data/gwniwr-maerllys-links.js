import { HOUSE_MAERLLYS_PORTRAITS } from './house-maerllys-portraits.js';
import { preserveSourceMetadataBoundaries, sourceManagedFields } from './source-family-field-upgrade.js';

export const GWNIWR_EMBLEM = 'assets/images/houses/Llamreis Ankunft/Bürgerliche/Gwynthor/Gwniwr/gwniwr-emblem.png';
export const MAERLLYS_EMBLEM = 'assets/images/houses/Llamreis Ankunft/Bürgerliche/Gwynthor/Maerllys/maerllys-emblem.png';
export const GWNIWR_ELERI_WORLD_ID = 'person--gwniwr--person-cf831497';
export const CRAIGDDU_HYWEL_WORLD_ID = 'person--craigddu--person-28b0e0a3';
const INVENTORY = 'gwniwr-maerllys-20261108';
const TAILORING_SOURCE_REVISIONS = Object.freeze({
  'haus-maerllys':13, 'haus-swyll':17, 'haus-tonnarth':6,
  'haus-ysgrif':7, 'haus-falchdyn':5, craigddu:5
});

const NEW_MAERLLYS_PORTRAITS = new Set([
  'cadfan-maerllys','eira-spouse-maerllys','owain-maerllys','gwenllian-ysgrif',
  'geraint-maerllys','llio-falchdyn','rhoswen-maerllys','madoc-tonnarth',
  'iorwerth-maerllys','bronwen-swyll'
]);

function tailoringRevision(source) {
  const minimum = TAILORING_SOURCE_REVISIONS[source.document.id];
  if (!minimum) throw Error('Unbekannte Schneider-Gegenakte: ' + source.document.id);
  return Math.max(Number(source.extensions?.sourceRevision || 0) + 1, minimum);
}

function newGwniwrHouse(revision) {
  return {id:'house-gwniwr',name:'Familie Gwniwr',motto:'',emblem:GWNIWR_EMBLEM,status:'active',
    extensions:{...sourceManagedFields({},['name','motto','emblem','status'],revision),registryManagedSourceRevision:revision}};
}

function tailoringEntity(entity, fields, revision) {
  if (!fields || !Object.keys(fields).length) return entity;
  const extensions = sourceManagedFields(entity.extensions, Object.keys(fields), revision);
  if (Object.hasOwn(fields, 'portrait')) extensions.registryManagedFieldFillOnlyRevisions = {
    ...extensions.registryManagedFieldFillOnlyRevisions, portrait:revision
  };
  return {...entity, ...fields, extensions};
}

function withTailoringFields(source, {revision, persons, houses}) {
  const bounded = preserveSourceMetadataBoundaries(source);
  return {...bounded,
    persons:source.persons.map(person=>tailoringEntity(person,persons[person.id],revision)),
    houses:source.houses.map(house=>tailoringEntity(house,houses[house.id],revision)),
    extensions:{...bounded.extensions, sourceRevision:revision,
      registryManagedEntitySourceRevision:source.extensions?.registryManagedEntitySourceRevision
        ?? Number(source.extensions?.sourceRevision || 0),
      tailoringContentInventory:INVENTORY,
      registryManagedExtensionFields:[...new Set([...(bounded.extensions.registryManagedExtensionFields||[]),'tailoringContentInventory'])],
      registryManagedExtensionFieldRevisions:{...bounded.extensions.registryManagedExtensionFieldRevisions,tailoringContentInventory:revision}
    }
  };
}

const titles = {
  'iorwerth-maerllys': 'Schneidermeister · Leitung von Naht & Siegel',
  'bronwen-swyll': 'Anprobe und Qualitätskontrolle · Naht & Siegel',
  'geraint-maerllys': 'Werkstattleitung und Livreeschnitt · Naht & Siegel',
  'llio-falchdyn': 'Nähstube und Serienfertigung · Naht & Siegel',
  'nia-maerllys': 'Persönliche Zofe der Prinzessin Isobel Draig'
};

/** A bounded media/occupation update shared by the existing counterpart trees. */
export function withMaerllysTailoringContent(source) {
  const revision = tailoringRevision(source);
  const persons = Object.fromEntries(source.persons.flatMap(person=>{
    const fields = {};
    const portrait = HOUSE_MAERLLYS_PORTRAITS[person.id];
    if (NEW_MAERLLYS_PORTRAITS.has(person.id) && portrait
      && (!person.portrait || person.portrait === portrait)) fields.portrait = portrait;
    if (titles[person.id] && titles[person.id] !== person.title) fields.title = titles[person.id];
    return Object.keys(fields).length ? [[person.id,fields]] : [];
  }));
  const houses = Object.fromEntries(source.houses.filter(h=>h.id==='house-maerllys'&&h.emblem!==MAERLLYS_EMBLEM)
    .map(h=>[h.id,{emblem:MAERLLYS_EMBLEM}]));
  let family = withTailoringFields(source, {revision,persons,houses});
  if(family.document.id !== 'haus-maerllys') return family;
  family = structuredClone(family);
  family.document.emblem = MAERLLYS_EMBLEM;
  family.document.description = 'Gwynthorer Schneiderfamilie mit dem auf Dienstkleidung und Livreen spezialisierten Haus Naht & Siegel. Der ältere Maerllys-Zweig spaltete sich vor der Überlieferungslücke von Gwniwr ab. Gwenora und Matteo begründeten später die Raves-Linie; die jüngere Hauptlinie führt bis Nia und ihren Geschwistern.';
  family.lineage.originHouse = { enabled:true,id:'lineage-origin-gwniwr-maerllys',houseId:'house-gwniwr',name:'Familie Gwniwr',
    subtitle:'Historischer Ursprung vor dem Zeitsprung',emblem:GWNIWR_EMBLEM,emblemScale:.86,crestFrame:'iron',frameScale:1,
    childIds:[family.view.focusPersonId],targetFamilyId:'gwniwr',notes:'Die Maerllys spalteten sich vor den namentlich überlieferten Generationen von Gwniwr ab. Die Hausverbindung ist ein Herkunftsverweis, keine biologische Elternschaft. Zeitpunkt, einzelne Ahnen und genaue Verwandtschaftsgrade sind nicht überliefert.',
    timeGap:{enabled:false,years:0,fromYear:'',toYear:'',label:''} };
  if(!family.houses.some(h=>h.id==='house-gwniwr')) family.houses.push(newGwniwrHouse(revision));
  family.extensions = {...family.extensions, sourceRevision:revision,
    registryManagedDocumentFields:[...new Set([...(family.extensions.registryManagedDocumentFields||[]),'emblem','description'])],
    registryManagedDocumentFieldRevisions:{...family.extensions.registryManagedDocumentFieldRevisions,emblem:revision,description:revision},
    registryManagedLineageFields:[...new Set([...(family.extensions.registryManagedLineageFields||[]),'originHouse'])],
    registryManagedLineageFieldRevisions:{...family.extensions.registryManagedLineageFieldRevisions,originHouse:revision},
    sourceNote: `${family.extensions.sourceNote||''} Nutzerauftrag vom 8. November 2026: Maerllys ist der vor dem Zeitsprung abgespaltene Gwniwr-Zweig. Naht & Siegel fertigt Dienstkleidung für Arbeitgeber und kooperiert mit der Göttlichen Eleganz. Nias Dienst bei Prinzessin Isobel, Rhys’ Verkaufstätigkeit in der Eleganz und Elowens Ehe/Dienst in der Letzten Rast bleiben erhalten.`};
  return Object.freeze(family);
}

/** Same Eleri/Hywel marriage: retain each chart's old card and relationship IDs. */
export function withGwniwrCraigdduLink(source) {
  const family=structuredClone(preserveSourceMetadataBoundaries(source)), revision=tailoringRevision(source);
  const entityBoundary=source.extensions?.registryManagedEntitySourceRevision ?? Number(source.extensions?.sourceRevision||0);
  const eleri=family.persons.find(p=>p.id==='person-0774c56b');
  const hywel=family.persons.find(p=>p.id==='person-28b0e0a3');
  if(!eleri||!hywel)throw Error('Bestehendes Craigddu-Paar fehlt.');
  const oldWorld=eleri.worldPersonId;
  Object.assign(eleri,{worldPersonId:GWNIWR_ELERI_WORLD_ID,portrait:'assets/images/portraits/gwniwr/person-cf831497.jpg',
    title:'Ehefrau Hywel Craigddu’s · geborene Gwniwr',
    notes:'Eleri ist die 1708 geborene Tochter Emyr Gwniwrs und Gwenllians. Sie heiratete Hywel Craigddu und hilft mit ihren Kindern im elterlichen Laden Nadel & Faden. Die sieben Töchter werden ausschließlich hier in Craigddu fortgeführt.',
    extensions:{...sourceManagedFields(eleri.extensions,['worldPersonId','portrait','title','notes'],revision),
      legacyWorldPersonIds:[...new Set([...(eleri.extensions?.legacyWorldPersonIds||[]),oldWorld].filter(Boolean))],
      registryManagedFieldPreviousValues:{...eleri.extensions?.registryManagedFieldPreviousValues,worldPersonId:[oldWorld].filter(Boolean)}}});
  const marriage=family.partnerships.find(m=>m.id==='partnership-8ce5d0c5');
  marriage.extensions={...sourceManagedFields(marriage.extensions,['crossFamilyRelationship'],revision),
    crossFamilyRelationship:{linkId:'marriage-hywel-craigddu-eleri-gwniwr',counterpartFamilyId:'gwniwr'}};
  if(!family.houses.some(h=>h.id==='house-gwniwr'))family.houses.push(newGwniwrHouse(revision));
  family.extensions={...family.extensions,sourceRevision:revision,registryManagedEntitySourceRevision:entityBoundary,gwniwrMarriageInventory:INVENTORY,
    sourceNote:`${family.extensions.sourceNote||''} Eleris Gwniwr-Herkunft und dieselbe Ehe mit Hywel sind seit 8. November 2026 beidseitig verknüpft; alte Karten- und Ehekennungen bleiben erhalten.`};
  return Object.freeze(family);
}
