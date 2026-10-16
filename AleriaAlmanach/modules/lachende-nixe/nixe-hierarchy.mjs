import {NIXE_ART,nixePerson} from './nixe-family-people.mjs';

const staffNames=['Eirona','Rhosiel','Lliwen','Severina','Adeltrud','Thjodhild'];
const staffNotes=[
  'Eirona empfängt neue Gesichter mit offenem Lächeln und findet rasch ein Gespräch, in dem auch ein schweigsamer Gast seinen Platz hat.',
  'Rhosiel kennt die höflichen Spiele des Salons. Sie hört aufmerksam zu und vergisst selten, welchen Wein ein Gast beim letzten Besuch bevorzugte.',
  'Lliwen bringt Wärme in einen steifen Abend. Ihr Lachen trägt weiter als ihre Stimme, und sie bemerkt schnell, wann ein Gast lieber in Ruhe gelassen werden möchte.',
  'Severina schätzt leise Gespräche und einen sorgfältig gedeckten Tisch. Sie versteht es, einem Abend Form zu geben, ohne selbst laut werden zu müssen.',
  'Adeltrud begleitet Gespräche mit ruhigen Weisen und kennt die alten Lieder ihrer Weisenfluher Heimat. Ein Blick zu Johanna genügt, bevor sie die Lautstärke des Salons verändert.',
  'Thjodhild bringt nordische Melodien aus Aldrimar ins Haus. Sie singt klar und zurückhaltend und hebt sich die lebhafteren Stücke für den späteren Abend auf.'
];
export function nixeOriginalNodes(source) {
  return source.pages[2].hierarchy.trees.flatMap(tree=>tree.levels.flatMap(level=>level.nodes));
}
export function nixeNamedStaff(source) {
  return nixeOriginalNodes(source).filter(node=>node.portrait).slice(5).map((node,index)=>({
    key:['eirona','rhosiel','lliwen','severina','adeltrud','thjodhild'][index],name:staffNames[index],
    role:index<4?'Kurtisane':'Musikantin',birth:String([1713,1711,1716,1708,1712,1714][index]),sex:'female',
    portrait:`${NIXE_ART}/references/${index<4?`kurtisane-${index+1}`:`musikantin-${index-3}`}.png`,bio:staffNotes[index]
  }));
}
export function buildNixeHierarchy(source) {
  const original=nixeOriginalNodes(source).map((node,index)=>({...structuredClone(node),id:`nixe-original-${index+1}`}));
  const picture=original.filter(node=>node.portrait);
  const originalRole=role=>original.filter(node=>!node.portrait && node.subtitle===role);
  const namedStaff=nixeNamedStaff(source);
  for(let index=5;index<picture.length;index++) {
    const person=namedStaff[index-5];
    Object.assign(picture[index],{title:person.name,subtitle:person.role,text:person.bio});
  }
  const vacancy=(role,text)=>({id:`nixe-frei-${role.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/-$/,'')}`,portrait:'',title:'Freier Platz',subtitle:role,text});
  const member=key=>{const person=nixePerson(key);return {id:`nixe-${key}`,portrait:person.portrait,title:person.name,subtitle:person.role,text:person.bio};};
  const level=(label,nodes)=>({label,nodes});
  const tree=(id,label,levels)=>({id,parentTreeId:'',label,levels});
  return {...structuredClone(source.pages[2].hierarchy),treeDisplayMode:'tabs',portraitScale:130,
    details:source.pages[2].hierarchy.details.map(detail=>detail.label==='Gegründet'?{...detail,value:'1696'}:detail),
    trees:[
      tree('fuehrung','Führung',[
        level('Inhaber',[picture[0]]),level('Hausleitung',[picture[1],picture[2],picture[4]]),
        level('Korrespondenz & Kontor',[member('rosalinde'),vacancy('Schreibgehilfe · Posten I','Führt Bestellbriefe, kurze Listen und Abschriften für David.'),vacancy('Schreibgehilfe · Posten II','Ordnet Belege und hält die vereinbarten Empfangstermine schriftlich fest.')])
      ]),
      tree('herberge','Herberge & Gäste',[
        level('Empfang & täglicher Gästebetrieb',originalRole('Gastwirt')),
        level('Zimmerführung & Empfang',[vacancy('Oberstubenmagd','Teilt die Zimmerdienste ein und prüft Leinen, Waschzeug und vorbereitete Gästezimmer.'),vacancy('Empfangskraft','Nimmt Ankünfte auf, weist freie Zimmer zu und hält Rücksprache mit Johanna.')]),
        level('Zimmerdienst & Ausschank',[...originalRole('Magd'),vacancy('Schankkraft · Posten I','Bedient die kleinen Tische im vorderen Salon.'),vacancy('Schankkraft · Posten II','Reicht bestellte Getränke und hält die Gläser im Umlauf.')]),
        level('Gepäck & Zimmerwege',[vacancy('Hausbursche · Posten I','Trägt Gepäck und begleitet ankommende Gäste zu ihren Zimmern.'),vacancy('Hausbursche · Posten II','Bringt frisches Wasser und erledigt die Wege zwischen Zimmern und Empfang.')])
      ]),
      tree('gesellschaft','Gesellschaft & Unterhaltung',[
        level('Salonführung',[vacancy('Salonmeisterin','Koordiniert Gesellschaft, Musik und Tanz mit Johanna und achtet auf den Takt des Abends.')]),
        level('Gesellschaft',[...picture.slice(5,9),vacancy('Kurtisane · weiterer Posten I','Eigener freier Platz für eine erwachsene Gesellschafterin des Hauses.'),vacancy('Kurtisane · weiterer Posten II','Eigener freier Platz für eine erwachsene Gesellschafterin des Hauses.')]),
        level('Musik',[...picture.slice(9,11),vacancy('Instrumentalist oder Instrumentalistin','Ergänzt die vorhandenen Musikerinnen bei größeren Gesellschaften.')]),
        level('Tanz',originalRole('Tänzerin'))
      ]),
      tree('kueche','Küche',[
        level('Küchenführung',originalRole('Koch')),level('Vorbereitung & Anrichten',originalRole('Küchengehilfe')),
        level('Sauberes Geschirr & Küchenwäsche',[vacancy('Küchenmagd','Reinigt Geschirr und Tücher und hält den kleinen Arbeitsbereich für die nächste Bestellung frei.')])
      ]),
      tree('sicherheit','Sicherheit',[
        level('Hauswächter',[picture[3]]),level('Schwelle & Nacht',[...originalRole('Türsteher'),vacancy('Nachtwache','Beaufsichtigt die geschlossene Haustür und den rückwärtigen Zugang während der Nacht.')]),
        level('Salondienst',[vacancy('Saalwache · Posten I','Bleibt im vorderen Haus ansprechbar und greift auf Simons Zeichen ein.'),vacancy('Saalwache · Posten II','Geht die Flure und Hinterausgänge ab und unterstützt die Türwache bei Bedarf.')])
      ]),
      tree('sonstige','Sonstige',[
        level('Versorgung & Hauswäsche',[member('kaspar'),vacancy('Wäschemeisterin','Hält frische Wäsche, kleine Reparaturen und die Rückläufe aus der Waschküche zusammen.')]),
        level('Wege, Bäder & Reinigung',[...originalRole('Laufbursche'),vacancy('Laufbursche · weiterer Posten','Übernimmt einen zweiten eigenen Botendienst zwischen Markt und Haus.'),...originalRole('Zubermädchen'),...originalRole('Putzkraft'),vacancy('Reinigungskraft · weiterer Posten','Übernimmt einen zweiten eigenen Reinigungsdienst in Fluren und Nebenräumen.'),vacancy('Flickmagd','Bessert Bettwäsche, Tücher und einfache Hauskleidung aus.')])
      ])
    ]};
}
