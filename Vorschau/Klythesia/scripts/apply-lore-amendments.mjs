/** Explicit, bounded application of the user's new Klythesia canon. */
import {readFile,writeFile,mkdir,copyFile,access} from 'node:fs/promises';
import {REALM_CONTEXT} from '../realm-context.mjs';
const root=new URL('../',import.meta.url),workspace=new URL('../../../',import.meta.url);
const read=async path=>JSON.parse(await readFile(new URL(path,workspace),'utf8'));
const write=(path,value)=>writeFile(new URL(path,workspace),JSON.stringify(value,null,2)+'\n','utf8');
const archive=new URL('sources/religion-before-20261104/',root);
await mkdir(archive,{recursive:true});
const religionRoot='Religionen/religionen/zirkel-des-ewigen-waldes/';
for(const name of ['eintrag.json','glaube.json','index.html']){
  try{await access(new URL(name,archive));}catch{await copyFile(new URL(religionRoot+name,workspace),new URL(name,archive));}
}
const entry=await read(religionRoot+'eintrag.json');
const sections=Object.fromEntries(entry.sections.map(section=>[section.id,section]));
sections.einfuehrung.blocks[0].text='Der Zirkel des Ewigen Waldes ist die Religion des Amazonenreiches Klythesia. Nach dem Zerfall des Alerischen Kaiserreiches predigte Kyreon den unterdrückten Frauen und Sklaven der westlichen Städte Phalantias einen neuen Glauben. Er erklärte sich zum fleischgewordenen Gott und Befreier und führte ihren Aufstand an. Seit der Befreiung dient Klythesia ihm als Gottkönig in einer amazonischen, matriarchalen Kriegergesellschaft.';
const history=Object.fromEntries(REALM_CONTEXT.history.map(item=>[item.id,item.text]));
sections.hintergrund.blocks=[
  history.aechanath+' '+history.zarakhul+' '+history.orin,
  history.fragmentation+' '+history.phalantia+' '+history.empire,
  history.rebellion+' '+history.present,
  'Der neue Glaube deutet ältere Vorstellungen neu und weist Beziehungen zum Alten Pantheon, den Hohen Drei und der Celestischen Synode auf. Diese religiösen Bezüge sind von der politischen Gründung Klythesias nach dem Zerfall des Alerischen Kaiserreiches zu unterscheiden. Kyreons Lehren verbinden das Reich weiterhin eng mit den Wäldern und der Natur.'
].map(text=>({type:'paragraph',text}));
sections.matriarchat.blocks[0].text='Der Tempel des Zirkels des Ewigen Waldes verbindet religiöse und gesellschaftliche Führung. Seine Priesterinnen dienen dem gegenwärtigen Patrongott und Gottkönig Kyreon, der als Mittler zu den Göttern, besonders zum Ahnengott Klytharios, gilt. Er besitzt sowohl geistliche als auch weltliche Autorität.';
sections.matriarchat.blocks[1].text='Die oberste Matriarchin entstammt der matriarchalen Herrscherfamilie der Anássai in der Hauptstadt. Sie ist Kyreons Gemahlin und Hohepriesterin und führt die Frauenordnung im Dienst des Gottkönigs. Die Verbindung von Herrscherfamilie und höchstem Priesterinnenamt ist damit eine tatsächliche Grundlage der Landesordnung.';
sections.matriarchat.blocks[3].text='Die Matriarchinnen der städtischen Frauenclans, der Polemístriai, führen die jeweiligen Stadtherrschaften. Kleinere Hiéreiai-Matronenhäuser dürfen Siedlungen, kleinere Städte und Festungen halten und eigene adlige Clans führen. Diese weltlichen Stände sind von den Tempelämtern zu unterscheiden: Orakel leiten Tempel und Heiligtümer und vermitteln die überlieferten göttlichen Botschaften.';
const appearance='Kyreon persönlich steht als Theíos über der Frauenordnung. Seine eigene gottkönigliche Erscheinung verbindet Elfenohren, ein prächtiges Geweih, eine zweifarbige Silber-Gold-Maske und einen mächtigen Speer mit einem Satyrunterleib. Diese besondere Gestalt gehört allein ihm; sie begründet keine zusätzliche Dynastie und keine allgemeine Anatomie der Aechanath.';
if(!sections.matriarchat.blocks.some(block=>block.text===appearance))sections.matriarchat.blocks.push({type:'paragraph',text:appearance});
entry.amendments=[...(entry.amendments??[]).filter(item=>item.id!=='klythesia-founding-20261104'),{
  id:'klythesia-founding-20261104',kind:'user-established-lore',source:'Vorschau/Klythesia/sources/lore-amendment-20261104.json',
  scope:'Herkunft, Gründung nach dem Reichszerfall, gegenwärtiges Gottkönigtum und Matriarchat'
}];
await write(religionRoot+'eintrag.json',entry);
const tradition=await read(religionRoot+'glaube.json');
tradition.hierarchy.entries.find(rank=>rank.id==='hohe-matriarchin').blocks[0].text='Die Hohe Matriarchin ist die oberste Matriarchin der Anássai-Herrscherfamilie in der Hauptstadt und Kyreons Gemahlin und Hohepriesterin. Sie steht an der Spitze der weiblichen Tempelhierarchie, führt die religiöse Praxis und verbindet die Frauenordnung mit dem gegenwärtigen Gottkönig. Der weltliche Stand der Herrscherfamilie und dieses Tempelamt sind eng verbunden, bleiben aber als unterschiedliche Rollen erkennbar.';
await write(religionRoot+'glaube.json',tradition);
const source={path:'Vorschau/Klythesia/sources/lore-amendment-20261104.json',section:'Nutzerfestlegung vom 4. November 2026'};
const claims={
  'southern-tirnara-amazons':'Klythesia und Phalantia gehen auf das albische Südvolk der Aechanath und das Fürstentum Aechneach zurück. Nach Nord-Süd-Wanderung, Zarakhuls Knechtschaft und phalantischer Eroberung trennten sich die westlichen Städte als Amazonenreich Klythesia ab.',
  'religious-origin':'Kyreon begründete den Zirkel im Zusammenhang mit dem Befreiungsaufstand nach dem Zerfall des Alerischen Kaiserreiches. Die Bezüge zu älteren Pantheons sind religiöse Neuinterpretationen und keine frühere politische Gründungszeit Klythesias.',
  'prophet-journey':history.rebellion,
  'kyreon-founder':'Unter Kyreons Führung zerbrach Phalantias Macht über die westlichen Städte. Seitdem ist Klythesia unabhängig und dient ihm als Gottkönig.',
  'kyreon-divine-office':'Kyreon ist der gegenwärtige Gottkönig Klythesias und wird als fleischgewordener Gott, Befreier und religiöser Mittler verehrt. Die matriarchale Herrscherfamilie dient ihm; ihre oberste Matriarchin ist seine Gemahlin und Hohepriesterin.',
  'clan-matriarchs':'Die Anássai bilden die matriarchale Herrscherfamilie der Hauptstadt. Die Polemístriai sind die städtischen Frauenclans; kleinere Hiéreiai-Matronenhäuser bilden den niedrigsten Adel. Sie dürfen kleinere Städte, Siedlungen und Festungen halten und eigene Clans führen.',
  'high-matriarch':'Die oberste Matriarchin aus der Herrscherfamilie ist Kyreons Gemahlin und Hohepriesterin. Sie verbindet die weibliche Landesführung und das höchste Priesterinnenamt im Dienst des Gottkönigs.'
};
const amendment={
  schemaVersion:1,id:'klythesia-expansion-20261104',authority:'latest-user-instruction',status:'local',
  summary:'Neue gemeinsame Geschichte von Phalantia und Klythesia, Kyreons Befreiungsaufstand, sieben Stände und sieben Kriegerprototypen. Frühere Bestandsberichte bleiben historische Recherchebelege.',
  scope:['Vorschau/Klythesia',religionRoot.slice(0,-1)],
  factOverrides:Object.fromEntries(Object.entries(claims).map(([id,text])=>[id,{text,perspective:'user-canon',source}])),
  resolvedIssueIds:['divine-kingship-and-matriarchy','clan-matriarchs-hierarchy','country-order','warrior-design','capital','emblem-assignments'],
  issueOverrides:{
    'founder-current-status':{title:'Kyreons Lebenschronologie',text:'Seine gegenwärtige Herrschaft ist festgelegt. Geburtsjahr, Alter und genaue Jahreszahlen des Aufstands wurden noch nicht bestimmt.',handling:'Keine Lebensdaten erfinden.'},
    'named-people-and-houses':{title:'Clanvorschläge und persönliche Oberhäupter',text:'Sieben neue Clannamen mit Wappen und Stadtsitzen sind vorgeschlagen. Persönliche Matriarchinnen, Stammbäume und weitere kleine Häuser sind noch nicht ausgearbeitet.'},
    'borders-and-colonies':{title:'Grenzen und Kolonien',text:'Die gemeinsame Vergangenheit mit Phalantia und die Abspaltung der westlichen Städte sind festgelegt. Konkrete innere Grenzen und die früher nur allgemein erwähnten Kolonien bleiben unbenannt und undatiert.'},
    neighbors:{question:'Wie verlaufen die heutigen Außengrenzen?',reason:'Die Vorgeschichte nennt Phalantias Widerstand bei Leukonia und die nördliche Wüste. Konkrete Grenzlinien und die unbenannten Kartenflächen sind damit noch nicht festgelegt.'},
    'ancestor-name':{title:'Ältere Schreibvariante Klytharion',text:'Die ältere Bestandsaufnahme verzeichnete einmal Klytharion. Die aktuelle überarbeitete Matriarchatspassage verwendet Klytharios; die alte Variante bleibt als redaktioneller Herkunftsbeleg dokumentiert.',handling:'Keine zusätzliche Gottheit daraus machen.'}
  },
  chronology:REALM_CONTEXT.history.map(item=>item.title),
  newStandNames:{freeMan:'Synoikos',enslavedMan:'Doulos',enslavedWoman:'Doule'},
  theios:{name:'Kyreon',unique:true,position:'Gottkönig über den sieben Ständen',appearance:'Elfenohren, prächtiges Geweih, Silber-Gold-Maske, mächtiger Speer, Satyrunterleib',scope:'Persönliche Gestalt Kyreons, keine allgemeine Abstammungsanatomie'},
  designDecisions:{capitalProposal:'Kallisteia als hervorgehobener Hauptsitz',clanNames:['Klyrath','Asterid','Theryn','Soryth','Melanthis','Naukyra','Elyssar'],newEmblems:['Hippokampos','Chimäre']},
  doNotInfer:['Keine genauen Jahreszahlen','Keine neuen persönlichen Amtsinhaber oder Genealogien','Keine automatische Freilassung durch eine Ehe','Keine neuen allgemeinen Straf- oder Erbgesetze','Keine zwei zusätzlichen Göttinnen zum alten 7/9-Konflikt erfinden','Keine pauschale Versklavung jedes Volkes Tirnaras behaupten'],
  originalSourceArchive:'Vorschau/Klythesia/sources/religion-before-20261104'
};
await writeFile(new URL('sources/lore-amendment-20261104.json',root),JSON.stringify(amendment,null,2)+'\n','utf8');
console.log(JSON.stringify({amendment:amendment.id,religionSources:2,preservedArchive:amendment.originalSourceArchive}));
