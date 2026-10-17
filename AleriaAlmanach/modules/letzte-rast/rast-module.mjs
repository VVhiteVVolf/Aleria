import { RAST_ID, RAST_ART, VANN_EMBLEM, VANN_MOTTO, VANN_PEOPLE } from './rast-people.mjs';
import { buildRastHierarchy } from './rast-staff.mjs';
import { buildRastCatalog } from './rast-catalog.mjs';
import { buildRastServices } from './rast-services.mjs';
import { RAST_ROOMS } from './rast-rooms.mjs';
import { expandGuestVacancies } from '../guest-register/guest-register-vacancies.mjs';
const p=(...texts)=>texts.map(text=>`<p>${text}</p>`).join('');
const familyLink='../Stammbäume/Stammbaum.html?family=haus-vann&mode=view';

function buildBusinessPage() {
  return {schemaVersion:1,commentThreadKey:'rast-geschaeft',pageTitle:'Das Haus · Tafel, Keller und Geschichte',guildPage:true,
    image:`${RAST_ART}/scenes/hausgeschichte.png`,imageWidth:30,imageTall:true,
    guild:{crestImage:`${RAST_ART}/references/schild.png`,portraitFormat:'portrait',
      biographyTitle:'Ein altes Haus mit einer guten Tafel',biographyText:p('Die Letzte Rast ist älter als die Familie, die sie heute führt. Ihre Ursprünge reichen in die frühe Geschichte Gwynthors zurück; ihren heutigen Namen trägt sie zu Ehren Celtigerns Draig.',
        '1334 erwarben Iestyn Vann und Efa das bestehende Gasthaus. Seitdem blieb es in Familienbesitz. Die Namen der dazwischenliegenden Generationen sind nicht vollständig überliefert; die jüngere Linie führt über Tudwal und Gwenith zu Brenn und Madoc.'),
      abilitiesTitle:'Die Handschrift des Hauses',abilities:[
        {title:'Die gute Tafel',icon:`../Stammbäume/${VANN_EMBLEM}`,detail:'Cadocs Küche und Angharads Tischdienst stimmen Zubereitung und Gangfolge aufeinander ab.'},
        {title:'Ein gepflegter Keller',icon:`${RAST_ART}/references/schild.png`,detail:'Owain prüft Lieferungen, Jahrgänge und Lagerung; der Wein wird passend zum bestellten Gericht empfohlen.'}],
      historyTitle:'Vom Gasthaus zum gesellschaftlichen Treffpunkt',historyText:p('Tudwal hielt das Haus durch unruhige Zeiten. Brenn und Madoc übernahmen gemeinsam die Verantwortung: Brenn für das Haus nach außen, Madoc für Rechnungen und Verwaltung.',
        'Unter ihnen wuchs die Herberge um weitere gehobene Kammern und Salons. Cadeyrn und Angharad führen heute den Speisebetrieb. Cadocs Küche behandelt gute Zutaten mit Zeit und Sorgfalt; der Tischdienst lässt zwischen den Gängen Raum für Gespräche.'),
      worksTitle:'Küche und Herkunft',works:['Frischer Fisch, Wild, Fleisch, Käse und Gemüse aus verlässlichem cenyrischem Bezug.','Weinlaub und Weissmann aus Weisenfluh; ausgewählter Honig und haltbare Früchte ergänzen die Küche.','Cenyrische Biere und Whiskys von Teyrngarch und Penderyn.','Große Platten, ganzer Lachs und Bankette werden vorbestellt.'],
      triviaTitle:'Haus und Gäste',trivia:['Mehr als sechzig Kammern stehen den Gästen zur Verfügung.','Acht Salons bieten Platz für vertrauliche Gespräche und private Gesellschaften.'],
      contractsTitle:'Bestellungen & Gesellschaften',contracts:[{title:'Große Tafel auf Vorbestellung',icon:`${RAST_ART}/references/schild.png`,text:'Angharad stimmt Salons, Gästezahl und Gangfolge mit der Gesellschaft ab. Ganze Fische und gemeinsame Platten werden vorbestellt.'}],
      connectionsTitle:'Familie und Verbindungen',connections:[{name:'Haus Vann',detail:'Eigentümerfamilie · Stammbaum und Hausgeschichte',image:`../Stammbäume/${VANN_EMBLEM}`,imageFormat:'square'},
        {name:'Haus Maerllys',detail:'Elowen heiratete Edern Vann',image:'../Stammbäume/assets/images/houses/Llamreis Ankunft/Bürgerliche/Gwynthor/Maerllys.png',imageFormat:'square'},
        {name:'Haus Pendrwn',detail:'Enid heiratete Aneirin Vann',image:'../Stammbäume/assets/images/houses/Llamreis Ankunft/Bürgerliche/Gwynthor/Pendrwn.png',imageFormat:'square'},
        {name:'Haus Raves',detail:'Eirlys lebt mit Orestian in der Göttlichen Eleganz',image:'../Stammbäume/assets/images/houses/Llamreis Ankunft/Bürgerliche/Gwynthor/Raves.png',imageFormat:'square'}],
      documentsTitle:'Das Haus Vann',documents:[{title:'Familie und Nachfolge',text:'Übernehmerpaar, überlieferte Linie und angeheiratete Bürgerhäuser.',icon:`../Stammbäume/${VANN_EMBLEM}`,link:familyLink}],
      footer:VANN_MOTTO}};
}
function completeOwner(page) {
  page.image=`${RAST_ART}/scenes/brueder-vann.png`;
  page.imageWidth=35;page.imageTall=true;delete page.imageSquare;
  page.pageTitle='Brenn Vann · Familie und Nachfolge';
  page.stats=page.stats.map(([label,value])=>[label,label==='Geburt'?'1673':value]);
  const bio=page.biography;
  bio.portrait=`${RAST_ART}/references/brenn.png`;
  bio.abilities=bio.abilities.map((ability,i)=>({...ability,icon:[
    '../IconOrdner/Cktraits/Trait_education_diplomacy_3.png','../IconOrdner/Cktraits/Trait_education_stewardship_3.png',
    '../IconOrdner/Big Traits/Trait_patient.png','../IconOrdner/Cktraits/Trait_education_diplomacy_3.png','../IconOrdner/Cktraits/Trait_education_stewardship_3.png'][i]}));
  bio.extraSections.push({title:'Der Familienhaushalt',mode:'text',text:p('Brenn und Seren haben zwei Söhne: Cadeyrn und Owain. Madoc und Lowri sind Ederns und Eirlys’ Eltern. Cadeyrn ist als erster Erbe vorgesehen; Madoc führt weiterhin die Verwaltung.',
    'Elowen Maerllys und Enid Pendrwn leben nach ihren Heiraten bei den Vanns und arbeiten im Empfang. Eirlys zog zu Orestian Raves; ihre Kinder Cassian und Elena gehören zum Raves-Haushalt.')});
  bio.connections=bio.connections.filter(c=>c.type!=='heading'&&c.imageFormat!=='portrait');
  bio.connections.push(...VANN_PEOPLE.filter(person=>person.resident&&Number(person.birth)<=1724&&!person.death&&person.key!=='brenn').map(person=>({type:'connection',name:person.name,detail:person.role,image:person.portrait,imageFormat:'portrait'})));
  bio.documentsTitle='Familie Vann';bio.documents=[{title:'Der vollständige Stammbaum',text:'Vom Übernehmerpaar Iestyn und Efa bis zu Kindern und Enkeln.',link:familyLink,icon:`../Stammbäume/${VANN_EMBLEM}`}];
}

export function completeLetzteRast(source,catalogs) {
  const entry=structuredClone(source);
  if(entry.id!==RAST_ID||entry.pages.length!==12) throw new Error('Unerwartete Ursprungsfassung der Letzten Rast.');
  entry.image=entry.previewImage=`${RAST_ART}/scenes/aussenansicht.png`;
  entry.symbol=`${RAST_ART}/references/schild.png`;
  entry.subtitle='Feine Tafel und traditionsreiche Herberge · Haus Vann';
  entry.pages[0].image=entry.image;entry.pages[0].imageWidth=35;entry.pages[0].imageTall=true;delete entry.pages[0].imageSquare;
  entry.pages[0].description+=p('Heute führt Haus Vann eine der besten Tafeln Gwynthors: sorgfältig zubereitete cenyrische Gerichte, ausgezeichnete Weisenfluher Weine und ein aufmerksamer Dienst zwischen den Gängen. Gute Zutaten und Zeit haben hier ihren Preis.');
  entry.pages[0].quote='„Dem Gast das Beste.“';entry.pages[0].quoteBy='— Haus Vann';
  entry.pages[0].stats=entry.pages[0].stats.map(([label,value])=>[label,label==='Besitzerfamilie seit'?'1334 · seit 406 Jahren':value]);
  completeOwner(entry.pages[1]);
  entry.pages[2].hierarchy=buildRastHierarchy(entry.pages[2].hierarchy);
  entry.pages[2].image=`${RAST_ART}/scenes/gedeckte-tafel.png`;entry.pages[2].imageWidth=25;entry.pages[2].imageTall=true;
  entry.pages[3].pageTitle='Die Hauskarte · Güterregister';
  entry.pages[3].tradeCatalogPage=true;entry.pages[3].tradeCatalog=buildRastCatalog(entry.pages[3],catalogs);
  entry.pages[3].image=`${RAST_ART}/scenes/gedeckte-tafel.png`;entry.pages[3].imageWidth=25;entry.pages[3].imageTall=true;
  delete entry.pages[3].goodsTable;delete entry.pages[3].goodsTablePage;
  const guests=entry.pages[4];guests.image=`${RAST_ART}/scenes/gaestebuch.png`;guests.imageWidth=25;guests.imageTall=true;
  Object.assign(guests.guestRegister,{title:'Gäste der Letzten Rast',subtitle:'Ederns Hausbuch',location:'Celtigerns Letzte Rast · Adelsdistrikt, Gwynthor',note:'Edern vermerkt Ankunft, Kammer und besondere Wünsche. Freie Einträge stehen für kommende Gäste bereit.'});
  expandGuestVacancies(guests.guestRegister,{prefix:'rast',sectionCount:6});
  for(const room of RAST_ROOMS){const page=entry.pages[room.sourceIndex];Object.assign(page,{pageTitle:room.title,sessionIntro:room.intro,image:`${RAST_ART}/scenes/${room.id}.png`,imageWidth:30,imageTall:true,imageFit:'cover',imagePosition:'center'});delete page.imageSquare;}
  entry.pages.splice(4,0,buildRastServices());
  entry.pages.splice(1,0,buildBusinessPage());
  return entry;
}
