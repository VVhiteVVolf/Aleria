import { createFounderTimeJumpPlaceholderHouseFamily } from './blank-house-family-factory.js';
import { createFamilyPerson, createMarriage, createParentages, createMarriedAwayBranch } from './family-record-builders.js';
import { createHouseProfileFromFolderPath } from '../domain/house-profile.js';
import { VANN_PEOPLE, VANN_MARRIAGES, VANN_EMBLEM, VANN_MOTTO, vannPerson } from '../../../../AleriaAlmanach/modules/letzte-rast/rast-people.mjs';

const familyEmblem = slug => `assets/images/houses/Llamreis Ankunft/Bürgerliche/Gwynthor/${slug[0].toUpperCase()+slug.slice(1)}.png`;
export function vannFamilyPerson(key) {
  const p = vannPerson(key);
  return createFamilyPerson({id:p.id,worldPersonId:p.worldPersonId,name:p.name,sex:p.sex,birth:p.birth,death:p.death,
    houseId:p.unknownOrigin?'':`house-${p.house}`,portrait:`../AleriaAlmanach/${p.portrait.slice(2)}`,title:p.role,notes:p.bio,
    familyRole:p.unknownOrigin||p.originFamily||p.key==='orestian'?'married':'core',lineageRole:p.head?'head':'branch',
    extensions:{registryManagedFields:['name','title','notes','portrait'],portraitAge:Number(p.death||1740)-Number(p.birth)}});
}
export function vannFamilyMarriage(m,counterpart=m.counterpart||'') {
  return createMarriage(m.id,...m.keys.map(key=>vannPerson(key).id),{start:m.start,end:m.end||'',status:m.end?'ended':'active',
    extensions:counterpart?{crossFamilyRelationship:{linkId:m.id,counterpartFamilyId:counterpart}}:{}});
}
const profile=createHouseProfileFromFolderPath(['Cenyr','Celtigerns Wacht','Llamreis Ankunft','Gwynthor'],{rankId:'commoner',liegeHouseId:'haus-draig',liegeHouseName:'Haus Draig'});
const base=createFounderTimeJumpPlaceholderHouseFamily({id:'haus-vann',title:'Haus Vann',emblem:VANN_EMBLEM,houseProfile:profile,toYear:'1644',pendingDescendantReview:false,
  description:'Wohlhabendes Gwynthorer Bürgerhaus und seit 1334 Eigentümer von Celtigerns Letzter Rast. Brenn und Madoc führen das traditionsreiche Gasthaus mit gehobener Küche, Salons und Herberge.'});
const founderMarriage=VANN_MARRIAGES[0];
const localPeople=VANN_PEOPLE.filter(p=>!['cassian','elena'].includes(p.key));
const historicGap={...base.timeJumps[0],parentPartnershipId:founderMarriage.id,childIds:[vannPerson('tudwal').id],fromYear:'1334',toYear:'1644',
  label:'Nicht einzeln überlieferte Vann-Generationen bis Tudwal',extensions:{preparedPlaceholder:false}};
export const HOUSE_VANN_FAMILY=Object.freeze({
  ...base,document:{...base.document,motto:VANN_MOTTO},
  houses:[{...base.houses[0],motto:VANN_MOTTO},...['maerllys','pendrwn','raves'].map(slug=>({id:`house-${slug}`,name:`Haus ${slug[0].toUpperCase()+slug.slice(1)}`,emblem:familyEmblem(slug),status:'active'}))],
  persons:localPeople.map(p=>vannFamilyPerson(p.key)),
  partnerships:VANN_MARRIAGES.map(m=>vannFamilyMarriage(m)),
  parentages:[...createParentages([vannPerson('tudwal').id],founderMarriage.keys.map(key=>vannPerson(key).id),founderMarriage.id,
    {type:'claimed',certainty:'unknown',notes:'Abstammung über nicht einzeln überlieferte Generationen; keine unmittelbare Elternschaft.',extensions:{timeJumpId:historicGap.id}}),
    ...VANN_MARRIAGES.filter(m=>!m.destination).flatMap(m=>createParentages(m.children.map(key=>vannPerson(key).id),m.keys.map(key=>vannPerson(key).id),m.id))],
  timeJumps:[historicGap],
  cadetBranches:[createMarriedAwayBranch({id:'married-away-eirlys-raves',name:'Haus Raves',parentPartnershipId:'marriage-orestian-eirlys-vann',houseId:'house-raves',targetFamilyId:'haus-raves',emblem:familyEmblem('raves'),crestFrame:'iron',
    notes:'Eirlys heiratete Orestian Raves und arbeitet in der Göttlichen Eleganz. Cassian und Elena sowie die weitere Linie stehen ausschließlich bei Raves.'})],
  lineage:{...base.lineage,founderPartnershipId:founderMarriage.id,crestFrame:'iron',crestSubtitle:'Gastwirtsfamilie aus Gwynthor · seit 1334'},
  view:{...base.view,focusPersonId:vannPerson('brenn').id,limitGenerations:false,ancestorDepth:12,descendantDepth:12},
  extensions:{...base.extensions,blankFamily:false,pendingDescendantReview:false,sourceRevision:1,
    sourceNote:'Nutzerauftrag vom 16.10.2026. Originale sechs Vann-Porträts und bekannte Verwandtschaft erhalten. Die Taverne ist älter als ihr Erwerb durch Iestyn und Efa 1334. Neue Ehen mit freien Bürgerlichen: Elowen Maerllys, Enid Pendrwn und Orestian Raves. Eirlys und ihre Nachkommen leben bei Raves.'}
});
