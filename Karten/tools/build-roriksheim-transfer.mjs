import fs from 'node:fs';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import vm from 'node:vm';
import { buildTransferReview } from '../modules/territory-transfer/transfer-model.mjs';

const folder = new URL('../Aldrimar/roriksheim/', import.meta.url);
const read = path => JSON.parse(fs.readFileSync(new URL(path, folder), 'utf8'));
const source = read('source-markers.json');
const targets = read('new-pins.source.json');
const decisions = read('transfer-decisions.source.json');
const catalogContext={};
for(const name of ['category-catalog.js','pin-template-catalog.js','pin-table-presets.js']){
  vm.runInNewContext(fs.readFileSync(new URL('../assets/js/pins/'+name,import.meta.url),'utf8'),catalogContext);
}
const iconTypes=read('icon-types.source.json');
for(const pin of targets.pins){
  const decision=decisions.placements.find(p=>p.targetId===pin.id);
  const category=catalogContext.KartoCategoryCatalog.definition({label:decision?.category||iconTypes[pin.icon.split('/').at(-1)]});
  assert.ok(category,pin.icon);
  pin.category=category.label;
  pin.templateId=catalogContext.KartoPinTablePresets.forCategory(category).templateId;
}
const territories = read('territories.source.json');
const review = buildTransferReview(source, targets, territories, decisions);
assert.equal(review.counts.sourceEntries, 187);
assert.equal(review.counts.descriptions, 163);
assert.equal(review.counts.targetPositions, targets.pins.length-decisions.excludedTargetIds.length);
assert.equal(review.counts.placed, targets.pins.filter(p=>p.userPlacement).length+decisions.placements.length);
assert.equal(new Set(review.sources.map(s => s.id)).size, review.sources.length);
for (const image of read('images.source.json')) {
  const bytes = fs.readFileSync(new URL(image.file, folder));
  assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'), image.sha256);
}
for (const pin of review.pins) {
  assert.ok(pin.territory, pin.id);
  assert.ok(fs.existsSync(new URL('../../' + pin.icon, import.meta.url)), pin.icon);
  for (const asset of [pin.decision?.affiliation?.crest,pin.decision?.affiliation?.liegeCrest].filter(Boolean)) {
    assert.ok(fs.existsSync(new URL('../../'+asset,import.meta.url)),asset);
  }
}
const normalizeName=name=>name.normalize('NFKD').replace(/\p{M}/gu,'').toLowerCase().replace(/[^a-z0-9]/g,'');
for(const placement of decisions.placements.filter(p=>p.id&&!p.sourceId)){
  assert.ok(!source.markers.some(s=>normalizeName(s.name)===normalizeName(placement.name)),placement.name+' existiert bereits');
}
const body = JSON.stringify(review, null, 2) + '\n';
const output = new URL('transfer.generated.json', folder);
const lines = [
  '# Roriksheim · Abgleich der neuen Karte', '',
  'Die neue Karte bestimmt Lage und Gebietszuteilung. Ausdrückliche Entscheidungen sind von offenen räumlichen Vorschlägen getrennt; die Originalquellen bleiben unverändert.', '',
  `- ${review.counts.sourceEntries} Originalmarker; ${review.counts.descriptions} gefüllte Beschreibungsfelder.`,
  '- 158 Orts-Pins, 14 Gebietsflächen, neun Stammesmarkierungen, drei Ereignisse, zwei Zusatzkreise und ein Kontextmarker.',
  '- Alte Bildgröße: 4096 × 2656; neue Bildgröße: 4096 × 2734.',
  `- 165 erfasste Bildzeichen, ein ausgeschlossener Tavernenplatz und vier beauftragte See-Wracks; ${review.counts.targetPositions} aktive Kartenpositionen.`,
  `- ${review.counts.placed} nach Vorgabe bearbeitete Positionen; ${review.counts.activePlaces} erhaltene alte Orts-Pins.`,
  `- ${review.counts.candidates} engere und ${review.counts.review} weitere Zuordnungsvorschläge.`,
  `- ${review.counts.newPositions} Kartenpositionen ohne Namen; ${review.counts.oldPlacesWithoutTarget} erhaltene alte Orts-Pins ohne neues Gegenstück.`,
  `- ${review.counts.excludedSources} bewusst entfernte Quellen; ${review.counts.embeddedSources} bereits in die Zonenkarte integrierte Gebietsmarker.`,
  '- Es wurde keine alte Karte übernommen und kein Produktionsimport angelegt.', '',
  '## Neue Gebietszugehörigkeit', '',
  '| Neue Herrschaft | Clan | Positionen |', '| --- | --- | ---: |',
  ...review.territories.map(t => `| ${t.name} | ${t.house} | ${review.pins.filter(p=>p.territoryId===t.id).length} |`), '',
  'Die drei rot umringten Brauereien in Schwerthohn, Winterfänge und Klangheim sind bestätigte Schwarzdorn-Exklaven. Die dritte heißt jetzt **Dornquell**. Gelb ist Winterfänge der Freiwinter; Grün ist Dämmertal der Nachtjäger.', '',
  '## Bearbeitete Ortszuordnungen', '',
  ...review.pins.filter(p=>p.decision).map(p=>`- **${p.proposedName}** — ${p.id}, ${p.territory.name}, ${p.position.x} / ${p.position.y}. ${p.decision.reason}`), '',
  'Hornhall ging gemäß Nutzerkorrektur an **Bjoern Wolfshorn**. Hrolf, seine beiden ältesten Kinder Ylva und Asgeir sowie sein Bruder Halvar wurden ins Exil geschickt. Der Clan bleibt in Hornhall unter den Vangandr bestehen. Die ältere Darstellung als verlassener Sitz mit vollständig vertriebenem Clan ist ersetzt. Die geografische Lage im Dämmertal überträgt die Lehnspflicht nicht auf die Nachtjäger. Burg Horunn bleibt erhalten.', '',
  '## Weg statt Ortsmarker', '',
  ...review.sources.filter(s=>s.status==='route').map(s=>`- **${s.name}** — ${s.transferDecision.reason} Quellen-ID: ${s.id}.`), '',
  '## Aus der Übertragung entfernt', '',
  ...review.sources.filter(s=>s.status==='excluded').map(s=>`- **${s.name}** — ${s.id}. ${s.transferDecision.reason}`), '',
  '## Bereits im Zonenbild enthalten', '',
  ...review.sources.filter(s=>s.status==='embedded').map(s=>`- ${s.name} — ${s.id}.`), '',
  'Die alten Herrschafts-, Regions- und Nachbargebietsmarker werden nicht als zusätzliche Pins oder Flächen rekonstruiert. Die neue Zonenkarte und die bereits erfassten Zugehörigkeiten bleiben maßgeblich.', '',
  '## Gesetzte See-Wracks um Hohenwacht', '',
  ...review.pins.filter(p=>p.userPlacement).map(p=>`- **${p.proposedName}** — X ${p.position.x}, Y ${p.position.y} ab links oben; Quellen-ID ${p.sourceId}.`), '',
  '## Alte Orts-Pins ohne neues Gegenstück', '',
  ...review.sources.filter(s=>s.kind==='place'&&s.status!=='excluded'&&!s.proposal).map(s=>`- **${s.name}** — [Originalmarker](${s.url}), ${s.coordinates.x}:${s.coordinates.y}.`), '',
  '## Neue Kartenpositionen ohne zugeordneten Altort', '',
  '| Position | Symbol | Neue Herrschaft | X / Y ab links oben |', '| --- | --- | --- | --- |',
  ...review.pins.filter(p=>!p.sourceId&&!p.proposedName).map(p=>`| ${p.id} | ${p.icon.split('/').at(-1)} | ${p.territory.name} | ${p.position.x} / ${p.position.y} |`), '',
  '## Ortsmarker ohne ausgearbeitete Beschreibung', '',
  ...review.sources.filter(s=>s.kind==='place'&&s.status!=='excluded'&&!s.hasNarrative).map(s=>`- ${s.name} — ${s.id}`), '',
  'Die vollständigen Texte, Kennungen und Einzelvorschläge stehen in der [Arbeitsansicht](abgleich.html) und im erzeugten `transfer.generated.json`.', '',
];
const report = lines.join('\n');
const reportFile = new URL('ABGLEICH.md', folder);
if (process.argv.includes('--check')) {
  assert.equal(fs.readFileSync(output, 'utf8'), body);
  assert.equal(fs.readFileSync(reportFile, 'utf8'), report);
} else {
  fs.writeFileSync(output, body); fs.writeFileSync(reportFile, report);
}
console.log(JSON.stringify(review.counts));
