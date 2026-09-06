import { ALDRIMAR_CLASS_IDS } from '../../AleriaAlmanach/modules/classes/aldrimar/aldrimar-class-registry.js';
import { getAldrimarClassProgression } from '../../AleriaAlmanach/modules/classes/aldrimar/aldrimar-class-progression.js';
import { renderCultureAttackCatalogSections } from './culture-attack-catalog-sections.mjs';
import { writeClassPageOutput } from './class-page-output.mjs';

const plans = ALDRIMAR_CLASS_IDS.map(id => getAldrimarClassProgression(id, 20));
const count = plans.reduce((sum, plan) => sum + plan.attackCatalog.length, 0);
const lines = ['# Aldrimar · Waffenlehre und Klassenkatalog', '',
  '> Generiert aus `modules/classes/aldrimar/` und `modules/combat-styles/huskarl/`.', '',
  `**${count} Waffenoptionen**, zwei Expertenpfade und sieben Klassenprofile. Neue Ausbildungen sind Entwürfe ohne automatische Vergabe. Skalde: ausschließlich Grundrepertoire nach Freya, Stufe 6–20 offen.`, '',
  'Schadensvergleich: Referenzwaffe 1W10, ohne Attribut-, Ausrüstungs- oder Klassenboni. Echte Würfel stammen aus der aktiven Waffe; zwei Waffen verdoppeln nicht die Formel. Alte Formen wachsen nach dem begrenzten gemeinsamen Budget. Reine Vorbereitungen bleiben schadenslos.', '',
  '| Klasse | Waffen-Slots | Katalogoptionen |', '| --- | ---: | ---: |',
  ...plans.map(plan => `| ${plan.name} | ${plan.techniqueBudget.total} | ${plan.attackCatalog.length} |`), '',
  'Wirkungsgrenzen, Berserkergang und Skaldenaufbau: [Konzept](ALDRIMAR_CLASS_CONCEPT.md).',
  ...renderCultureAttackCatalogSections(plans), '', '## Skaldenreferenz nach Freya', '',
  'Die vorhandenen acht Lieder und der Arkane Schrei werden aus Freyas Bogen projiziert, nicht als neue Figurenfähigkeiten kopiert. Frühe Lernstufen sind ein Vorschlag; der Referenzstand ist Stufe 5.', '',
  ...plans.find(plan => plan.classId === 'skalde').skaldReference.repertoire.map(entry => `- **Stufe ${entry.minimumLevel} · ${entry.name}:** ${entry.description} Kosten der Referenz: ${entry.costs.map(cost => `${cost.amount} ${cost.name}`).join(' + ')}.`)
];
await writeClassPageOutput(new URL('../', import.meta.url), 'docs/ALDRIMAR_ATTACK_CATALOG.md', `${lines.join('\n')}\n`, process.argv.includes('--check'));
console.log(`Aldrimar: ${count} Waffenoptionen und Skaldenreferenz dokumentiert${process.argv.includes('--check') ? ' und geprüft' : ''}.`);
