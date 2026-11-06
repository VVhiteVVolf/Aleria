/** Only workshops without an admitted land/territory page; adoption evidence is tested separately. */
export const PREPARATION_GROUPS = Object.freeze([
  Object.freeze({id:'realms',title:'Länder, Völker und Stadtrepubliken',eyebrow:'Eigenständige Werkstätten',description:'Geschichte, Gesellschaft, Wappen und die politische Ordnung stehen hier zur gemeinsamen Ausarbeitung.'}),
  Object.freeze({id:'argentum',title:'Kaiserreich Argentum',eyebrow:'Drei Provinzen · ein Kaiserreich',description:'Leukonia, Vardentia und Calidaria werden als Provinzen desselben Reiches vorbereitet.'}),
]);

export const PREPARATIONS = Object.freeze([
  {id:'adharath',name:'Adharath · Dúinreach',folder:'Adharath',group:'realms',kind:'Nomadenvolk',crest:'assets/emblems/previews/realm-duinreach.webp',summary:'Zwölf wandernde albische Stämme bewahren das Erbe des verlorenen Fürstentums Dúinreach.'},
  {id:'blutstadt',name:'Die Blutstadt',folder:'Blutstadt',group:'realms',kind:'Stadt und Inselherrschaften',crest:'assets/crests/blutstadt.webp',summary:'Die ehemalige Kaiserstadt zwischen Alerischer Kirche, Gilden und mächtigen Bürgerhäusern.'},
  {id:'ishtaran',name:'Ishtaran',folder:'Ishtaran',group:'realms',kind:'Sultanat',crest:'assets/emblems/previews/source-07.webp',summary:'Das Erbe Maghneachs, die Dualität und die Häuser der Steppen- und Reiterkultur.'},
  {id:'kemetara',name:'Kemetara',folder:'Kemetara',group:'realms',kind:'Königreich',crest:'assets/previews/kemetara-realm.webp',summary:'Das deltaalbische Erbe Tuilneachs, die pharaonische Familie und der Glaube an die Hohen Drei.'},
  {id:'klythesia',name:'Klythesia',folder:'Klythesia',group:'realms',kind:'Gottkönigtum',crest:'assets/previews/klythesia-sign.webp',summary:'Kyreons Gottkönigtum mit matriarchalen Clans und einer amazonischen Kriegergesellschaft.'},
  {id:'mathringen',name:'Mathringen',folder:'Mathringen',group:'realms',kind:'Kaiserliches Reich',crest:'assets/emblems/previews/realm-mathringen.webp',summary:'Das Land der Greife mit Reichsadel, kaiserlichem Hof und Konkordischer Kirche.'},
  {id:'phalantia',name:'Phalantia',folder:'Phalantia',group:'realms',kind:'Zweikönigreich',crest:'assets/originals/previews/phalantia.webp',summary:'Zwei Königshäuser, die Geruso und eine streng geordnete Kriegergesellschaft.'},
  {id:'solestia',name:'Solestia',folder:'Solestia',group:'realms',kind:'Herzogtum',crest:'assets/originals/previews/solestia.webp',summary:'Ein reiches Herzogtum im Herzen der Seehandelswege, geprägt von Rittertum und höfischer Fechtkunst.'},
  {id:'venalys',name:'Venalys',folder:'Venalys',group:'realms',kind:'Stadtrepublik',crest:'assets/crests/venalys.webp',summary:'Fünf Patrizierhäuser und fünf Dogen, Senat und Rat prägen die große Handelsrepublik.'},
  {id:'leukonia',name:'Leukonia',folder:'Leukonia',group:'argentum',kind:'Provinz Argentums',crest:'assets/emblems/previews/leukonia-v2.webp',summary:'Städte, Archonate und ihre Häuser unter imperialer Verwaltung.'},
  {id:'sylvarant',name:'Vardentia',folder:'Sylvarant',group:'argentum',kind:'Provinz Argentums',crest:'assets/emblems/previews/province-sylvarant-v2.webp',summary:'Die östliche Kernprovinz Argentums und ihre alten, einflussreichen Familien.'},
  {id:'calidaria',name:'Calidaria',folder:'Calidaria',group:'argentum',kind:'Provinz Argentums',crest:'assets/emblems/previews/province-calidaria-v2.webp',summary:'Die Inselwelt der Tlapanui und argentischen Siedler zwischen eigener Überlieferung und imperialem Einfluss.'},
].map(entry=>Object.freeze({...entry,href:`./${entry.folder}/`,image:`./${entry.folder}/${entry.crest}`})));

const searchable=value=>String(value??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('de');
export function filterPreparations(entries,query=''){
  const terms=searchable(query).trim().split(/\s+/).filter(Boolean);
  return entries.filter(entry=>terms.every(term=>searchable(`${entry.name} ${entry.kind} ${entry.summary} ${entry.group==='argentum'?'Kaiserreich Argentum':''}`).includes(term)));
}
