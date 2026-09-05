import { DRACHENTANZ_COMBAT_STYLE } from '../../AleriaAlmanach/modules/combat-styles/drachentanz/drachentanz-registry.js';
import { getCenyrClassDefinitions } from '../../AleriaAlmanach/modules/classes/cenyr/cenyr-class-registry.js';
import { getCenyrClassProgression } from '../../AleriaAlmanach/modules/classes/cenyr/cenyr-class-progression.js';
import { writeClassPageOutput } from './class-page-output.mjs';
import { describeTechniqueDamage, resolveTechniqueDamageFormula } from '../../AleriaAlmanach/modules/combat/combat-technique-damage.js';

const root = new URL('../', import.meta.url);
const check = process.argv.includes('--check');
const definitions = getCenyrClassDefinitions();
const definitionById = new Map(definitions.map(definition => [definition.classId, definition]));

function cell(value) {
  return String(value ?? '').replaceAll('|', '\\|').replaceAll('\n', ' ');
}

function damageLabel(technique) {
  return describeTechniqueDamage(technique);
}

function referenceDamage(technique, level) {
  return resolveTechniqueDamageFormula(technique, { damageFormula: '1d10' }, { progression: { level } }).replaceAll('d', 'W');
}

function costLabel(technique) {
  return technique.costs.map(cost => `${cost.amount} ${cost.name}`).join(' + ');
}

function classLabel(technique) {
  const ids = technique.cenyrTraining?.allowedClassIds || [];
  return ids.map(id => definitionById.get(id)?.name || id).join(', ') || 'Alle berechtigten Cenyr-Klassen';
}

function weaponLabel(technique) {
  const profiles = Object.values(technique.cenyrTraining?.classWeaponProfiles || {}).flat();
  return [...new Set(profiles)].join(', ') || technique.weaponTypes.join(', ');
}

const forms = DRACHENTANZ_COMBAT_STYLE.forms;
const techniques = forms.flatMap(form => form.techniques);
const confirmedCount = techniques.filter(technique => technique.status === 'confirmed').length;
const lines = [
  '# Cenyr-Attackenkatalog 1–20',
  '',
  '> Diese Datei wird aus dem Drachentanz-Register erzeugt. Änderungen gehören in die jeweiligen Technikmodule unter `AleriaAlmanach/modules/combat-styles/drachentanz/techniques/`.',
  '',
  `Der Katalog enthält **${techniques.length} Attacken** in **${forms.length} Formen und Pfaden**. Davon sind **${confirmedCount} historisch bestätigt** und **${techniques.length - confirmedCount} Balanceentwürfe**. Cenyr-Charakterbögen wählen passende Einträge automatisch nach Klasse, Stufe, Waffen und verfügbaren Slots; der redaktionelle Entwurfsstatus bleibt erhalten.`,
  '',
  'Die Vergleichsspalten verwenden einheitlich eine Waffe mit 1W10. Sie zeigen reine Schadenswürfel ohne Attribut-, Waffen- und Klassenboni. In der Szene gilt die tatsächliche Waffe. Ältere Formen erhalten genau einen wachsenden Ausbildungswürfel. Details: [Schadensbalance](COMBAT_DAMAGE_BALANCE.md).',
  '',
  '## Klassenübersicht',
  '',
  '| Klasse | Lernbudget | Katalogoptionen | Bestätigt und automatisch vergeben |',
  '| --- | ---: | ---: | ---: |'
];

for (const definition of definitions) {
  const plan = getCenyrClassProgression(definition.classId, 20);
  lines.push(`| ${cell(definition.name)} | ${plan.techniqueBudget.total} | ${plan.attackCatalog.length} | ${plan.availableAttacks.length} |`);
}

lines.push('', '## Formen und Attacken');
for (const form of forms) {
  lines.push(
    '',
    `### ${form.shortName}`,
    '',
    `${form.kind === 'foundation' ? 'Grundform' : form.kind === 'duelist' ? 'Duellantenform' : 'Pfad'} · Ausbildung Stufe ${form.techniqueLevelBand.minimum}–${form.techniqueLevelBand.maximum} · ${form.techniques.length} Attacken im Gesamtpool.`,
    '',
    '| Stufe | Attacke | Klassen | Waffenprofile | Schadensmodell | Mit 1W10 bei Freigabe | Mit 1W10 auf Stufe 20 | Kosten | Wirkung | Stand |',
    '| ---: | --- | --- | --- | --- | --- | --- | --- | --- | --- |'
  );
  for (const technique of [...form.techniques].sort((left, right) => left.minimumLevel - right.minimumLevel || left.name.localeCompare(right.name, 'de'))) {
    lines.push(`| ${technique.minimumLevel} | ${cell(technique.name)} | ${cell(classLabel(technique))} | ${cell(weaponLabel(technique))} | ${cell(damageLabel(technique))} | ${referenceDamage(technique, technique.minimumLevel)} | ${referenceDamage(technique, 20)} | ${cell(costLabel(technique))} | ${cell(technique.effect)} | ${technique.status === 'confirmed' ? 'Bestätigt' : 'Entwurf'} |`);
  }
}

await writeClassPageOutput(root, 'docs/CENYR_ATTACK_CATALOG.md', `${lines.join('\n')}\n`, check);
console.log(`Cenyr-Attackenkatalog mit ${techniques.length} Attacken ${check ? 'geprüft' : 'erstellt'}.`);
