import {structure,clansById,settlementsById,territoriesById,territoryAncestors} from '../../../Stammbäume/assets/js/data/uathneach-territorial-catalog.js';
import {UATHNEACH_HOUSE_FAMILIES} from '../../../Stammbäume/assets/js/data/uathneach-house-families.js';
import {UATHNEACH_WARRIORS} from '../../../Stammbäume/assets/js/data/uathneach-warriors.js';

const families=new Map(UATHNEACH_HOUSE_FAMILIES.map(family=>[family.document.id,family]));
const warriors=new Map(UATHNEACH_WARRIORS.map(warrior=>[warrior.id,warrior]));
const relative=path=>'..'+path;
const treeLink=(familyId,personId)=>`../Stammb%C3%A4ume/Stammbaum.html?family=${encodeURIComponent(familyId)}&mode=view&person=${encodeURIComponent(personId)}`;

/** Known territorial facts and reviewed art only; no invented clan history or training. */
export function createUathneachHouseContent(id){
 const clan=clansById.get(id),warrior=warriors.get(id);
 if(!clan||!warrior)throw Error(`Unknown Uathneach clan or illustration: ${id}`);
 const family=families.get(clan.familyId),region=territoriesById.get(clan.regionId),territory=territoriesById.get(clan.territoryId);
 const seat=settlementsById.get(clan.seat),liege=clansById.get(clan.liege),name=`Clan ${clan.name}`;
 const rank=clan.rank||'Rang offen',liegeName=liege?`Clan ${liege.name}`:'Kein übergeordneter Clan · Ard Tiarnatum Uathneach';
 const head=family.persons.find(person=>person.id===family.extensions.currentHeadPersonId);
 const overview=`${name} hat seinen Sitz in ${seat.name} im Fürstentum Uathneach. ${clan.rank?`Der Clan führt den Rang ${clan.rank}.`:'Der Rang des Clans ist noch nicht festgelegt.'} ${liege?`Unmittelbarer Lehnsherr ist Clan ${liege.name}.`:'Die Mac Ard’Lága führen Uathneach als Ard Tiarna.'}${id==='muirin'?` Broch an Reithe ist ein unmittelbar den Lága unterstelltes Sonderlehen innerhalb der Kartenfläche von ${territoriesById.get('uathneach-tir-na-taoide').name}.`:''}`;
 const history=id==='laga'?'Das vorläufige Familiengerüst verbindet die bereits belegten Lága-Angehörigen und Ehen. Frühere Generationen enthalten ausdrücklich nummerierte Platzhalter und Überlieferungslücken. Daraus wird keine zusätzliche Clanchronik abgeleitet.':'Eine ausführliche Clanchronik, Gründungsdaten und namentlich gesicherte frühe Oberhäupter sind noch nicht ausgearbeitet.';
 const visual=`Die Clangestaltung zeigt: ${warrior.equipment} Die Klassenbezeichnung ${warrior.className} beschreibt das Bild; sie legt keine verbindliche Ausbildung oder besondere Fähigkeit des Clans fest.`;
 const source=warrior.sourceKind==='supplied'?'Gelieferte Clangestaltung':'Ergänzende Clangestaltung';
 const heads=head?[{id:head.id,familyId:clan.familyId,name:head.name,role:head.title,silhouette:'male',image:head.portrait?`../Stammbäume/${head.portrait}`:''}]:[];
 return {id:clan.familyId,name,type:'Clan',page:'kleinehaeuser.html',registerPage:true,prepared:true,
  contentVersion:'20261027-uathneach-warriors-v1',biographySourceRevision:5,
  county:region.name,countyLabel:region.type,liege:liegeName,parentHouseId:liege?.familyId||'',territoryId:territory.id,territoryName:territory.name,territoryHref:relative(territory.href),
  extinct:false,showMotto:false,omitMilitaryProfile:true,currentHead:head?.name||'',firstHeir:'',
  biographyIntroTitle:'Über den Clan',biographyHistoryTitle:'Bisher bekannte Geschichte',
  biographySummary:{overview,history,character:visual,relations:liege?`Der Clan ist unmittelbar den ${liege.name} verbunden.`:'Die sechs Mor-Tiarna-Clans und die unmittelbar zugeordneten Lehen bilden das bestätigte Gefüge Uathneachs.'},
  hierarchy:[{type:'Sammlung',name:'Familien Häuser und Clans',slug:'familien-hauser-und-clans'},{type:'Kontinent',name:'Estryll',slug:'estryll'},...territoryAncestors(territory).map(t=>({type:t.type,name:t.name,slug:t.id})),{type:'Sitz',name:seat.name,slug:seat.id},{type:'Clan',name,slug:clan.familyId}],
  profile:{highestTitle:rank,rank,houseType:'Clan',motto:'',seat:seat.name,affiliation:`Uathneach · ${region.name}`,liege:liegeName,people:'Alben',origin:'Uathneach',patronDeities:'',patron:'',knightingPatron:'',founding:'',milestoneOne:'',milestoneTwo:'',wealth:'',religion:'',allies:'',enemies:''},
  sections:{overview,history,traditions:'Eigene Clanbräuche sind bislang nicht näher beschrieben.',knighthood:visual,holdings:`Sitz: ${seat.name}. Zugeordnetes Lehen: ${territory.name}. Eine weitergehende Beschreibung eigener Betriebe und Güter ist noch offen.`,cultureReligion:'Der Clan gehört zur albischen Kultur Uathneachs. Besondere religiöse Überlieferungen sind noch nicht ausgearbeitet.',conflictsAlliances:liege?`Unmittelbarer Lehnsherr ist Clan ${liege.name}. Weitere Bündnisse und Fehden sind bislang nicht beschrieben.`:'Der Clan führt Uathneach als Ard Tiarna.',values:'Eigene Werte und ein verbindlicher Clanleitspruch sind bislang nicht ausgearbeitet.',court:head?`Als amtierender Ard Tiarna ist ${head.name} in der Familienakte verzeichnet.`:'Namentliche Oberhäupter und eine ausgearbeitete Amtsfolge sind bislang nicht überliefert.',familyTree:'Die bestehende Familienakte bleibt verlinkt.',historicalFigures:head?'Bekannte Angehörige und ihre familiären Verbindungen stehen in der bestehenden Clanakte.':'Historische Persönlichkeiten sind bislang nicht namentlich ausgearbeitet.'},
  images:{crest:relative(clan.crest),scene:relative(warrior.fullsize),sceneAlt:`${source} · ${name}`,banner:relative(territory.banner||region.banner||structure.realm.banner)},
  illustrationCategory:'Clandarstellung',
  warriorGallery:{title:'Krieger des Clans',introduction:'Die vorhandene Darstellung des Clans. Kleidung und Bewaffnung sind bildlich belegt; zusätzliche Ausbildungs- oder Truppenangaben bleiben offen.',entries:[{id:`uathneach-${id}`,name:`${clan.name} · ${warrior.className}`,image:relative(warrior.fullsize),description:visual}]},
  placeholders:{male:'../Stammbäume/assets/images/placeholders/male.png'},
  allies:[],cadets:[],founder:null,heads,heirs:[],offices:[],figures:[],figuresTitle:'Bekannte Angehörige',trivia:[]
 };
}
