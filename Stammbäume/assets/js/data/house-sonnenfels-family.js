import {createFounderTimeJumpPlaceholderHouseFamily} from './blank-house-family-factory.js';
import {createFamilyPerson,createMarriage,createParentages,createMarriedAwayBranch} from './family-record-builders.js';
import {createHouseProfileFromFolderPath} from '../domain/house-profile.js';
import {NIXE_FAMILY_PEOPLE,nixePerson,SONNENFELS_EMBLEM} from '../../../../AleriaAlmanach/modules/lachende-nixe/nixe-family-people.mjs';

const profile=createHouseProfileFromFolderPath(['Weisenfluh'],{
  rankId:'knight',seat:'Burg Sonnenfels',secondarySeats:['Gwynthor · Die Lachende Nixe']
});
const base=createFounderTimeJumpPlaceholderHouseFamily({id:'haus-sonnenfels',title:'Haus Sonnenfels',emblem:SONNENFELS_EMBLEM,
  houseProfile:profile,toYear:'1646',pendingDescendantReview:false,
  description:'Weisenfluher Landherren mit Stammsitz Burg Sonnenfels. Dietmar führt das Haus in der Heimat; sein Onkel Albrecht begründete nach einem Erbstreit mit der Lachenden Nixe einen wohlhabenden Gwynthorer Haushalt.'});
const pid=key=>nixePerson(key).id;
const familyPeople=NIXE_FAMILY_PEOPLE.map(person=>createFamilyPerson({
  id:person.id,worldPersonId:person.worldPersonId,name:person.name,sex:person.sex,birth:person.birth,death:person.death || '',
  houseId:person.maidenHouseUnknown?'':`house-${person.house}`,
  portrait:`../AleriaAlmanach/${person.portrait.slice(2)}`,title:person.role,notes:person.bio,
  familyRole:person.maidenHouseUnknown || person.familyRole==='married'?'married':person.illegitimate?'bastard':'core',
  lineageRole:person.head?'head':'branch',extensions:{registryManagedFields:['title','notes','portrait']}
}));
const unknownSpouse=createFamilyPerson({id:'unbekannter-gemahl-adelheid-sonnenfels',name:'Unbekannter Gemahl',sex:'male',
  houseId:'house-unbekannt-adelheid-sonnenfels',familyRole:'married',notes:'Adelheids Gemahl gehört einem nicht benannten Haus an.'});
const unknownMother=createFamilyPerson({id:'unbekannte-mutter-kaspar-sonnenfels',name:'Unbekannte Mutter',sex:'female',
  houseId:'',familyRole:'affair',notes:'Kaspars Mutter ist unbekannt. Sie wird nicht mit Johanna Falkenhayn gleichgesetzt.'});
const pair=(key,a,b,start,end='')=>createMarriage(`marriage-${key}-sonnenfels`,pid(a),pid(b),{start,end,status:end?'ended':'active'});
const marriages=[
  pair('dagorath-mechthild','dagorath','mechthild','1674','1694'),
  pair('gerold-adelgund','gerold','adelgund','1672','1720'),
  pair('albrecht-johanna','albrecht','johanna','1708'),
  pair('erhard-hedwig','erhard','hedwig','1704','1732'),
  pair('konrad-brunhild','konrad','brunhild','1700'),
  pair('dietmar-ottilie','dietmar','ottilie','1728'),
  createMarriage('marriage-adelheid-unknown-sonnenfels',pid('adelheid'),unknownSpouse.id,{start:'1704'}),
  createMarriage('affair-albrecht-unknown-sonnenfels',pid('albrecht'),unknownMother.id,{type:'affair',status:'ended',
    notes:'Aus der früheren Verbindung ging Kaspar hervor. Albrecht erkannte ihn als seinen Sohn an.'})
];
const children=(keys,marriage)=>{
  const pair=marriages.find(pair=>pair.id===`${marriage}-sonnenfels`);
  return createParentages(keys.map(pid),pair.participantIds,pair.id);
};
export const HOUSE_SONNENFELS_FAMILY=Object.freeze({
  ...base,
  houses:[...base.houses,{id:'house-falkenhayn',name:'Haus Falkenhayn',emblem:'',status:'active'},
    {id:'house-unbekannt-adelheid-sonnenfels',name:'Unbekanntes Haus',emblem:'',status:'active'}],
  persons:[...base.persons.map((person,index)=>({...person,name:index?'Unbekannte Gründerin':'Unbekannter Gründer',birth:'',death:'????',status:'dead'})),
    ...familyPeople,unknownSpouse,unknownMother],
  partnerships:[...base.partnerships.map(pair=>({...pair,status:'ended',certainty:'unknown'})),...marriages],
  parentages:[
    ...createParentages(['dagorath','gerold'].map(pid),base.partnerships[0].participantIds,base.lineage.founderPartnershipId,
      {type:'claimed',certainty:'unknown',notes:'Nicht einzeln überlieferte Generationen zwischen dem Gründerpaar und den beiden Brüdern.',extensions:{timeJumpId:base.timeJumps[0].id}}),
    ...children(['albrecht','erhard','adelheid','oswald'],'marriage-dagorath-mechthild'),
    ...children(['konrad'],'marriage-gerold-adelgund'),
    ...children(['hartwig'],'marriage-konrad-brunhild'),
    ...children(['dietmar'],'marriage-erhard-hedwig'),
    ...children(['raban','irmelin'],'marriage-dietmar-ottilie'),
    ...children(['simon','david','rosalinde'],'marriage-albrecht-johanna'),
    ...createParentages([pid('kaspar')],[pid('albrecht'),unknownMother.id],'affair-albrecht-unknown-sonnenfels',
      {legitimacy:'illegitimate',notes:'Anerkannter unehelicher Sohn Albrechts; seine Mutter bleibt unbekannt.'})
  ],
  cadetBranches:[createMarriedAwayBranch({id:'married-away-adelheid-sonnenfels',name:'Unbekanntes Haus',
    parentPartnershipId:'marriage-adelheid-unknown-sonnenfels',houseId:unknownSpouse.houseId,targetFamilyId:'haus-unbekannt',crestFrame:'silver',
    notes:'Adelheid wurde in ein nicht benanntes Haus verheiratet. Ihre weitere Linie gehört zu diesem Haus.'})],
  timeJumps:[{...base.timeJumps[0],childIds:['dagorath','gerold'].map(pid),fromYear:'',toYear:'1646',label:'Nicht einzeln überlieferte Generationen bis Dagorath und Gerold',extensions:{preparedPlaceholder:false}}],
  view:{...base.view,focusPersonId:pid('albrecht'),limitGenerations:false},
  extensions:{...base.extensions,blankFamily:false,pendingDescendantReview:false,sourceRevision:1,
    sourceNote:'Ausbau nach Nutzervorgaben vom 16. Oktober 2026. Albrechts vorhandene Biografie bleibt verbindlich: Dagoraths legitimer Sohn, Erbstreit mit Onkel und Vetter, späterer Neubeginn in Gwynthor. Erhards Sohn Dietmar führt heute das Haus in Weisenfluh. Adelheids fortgeheiratete Linie endet am Zielhaus; Rosalinde ist 19 Jahre alt, Kaspars Mutter unbekannt.'}
});
