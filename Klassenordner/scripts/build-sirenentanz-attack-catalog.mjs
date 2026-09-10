import { VENNYR_CLASS_IDS } from '../../AleriaAlmanach/modules/classes/vennyr/vennyr-class-registry.js';
import { getVennyrClassProgression } from '../../AleriaAlmanach/modules/classes/vennyr/vennyr-class-progression.js';
import { renderCultureAttackCatalogSections } from './culture-attack-catalog-sections.mjs';
import { writeClassPageOutput } from './class-page-output.mjs';

const plans = VENNYR_CLASS_IDS.map(id => getVennyrClassProgression(id, 20));
const lines = ['# Wyrmtanz · Waffen- und Attackenkatalog 1–20', '',
  '> Aus den Wyrmtanz-Technikmodulen erzeugt. Bearbeitung: `AleriaAlmanach/modules/combat-styles/sirenentanz/`. Die bestehenden Dateipfade bleiben für alte Verweise erhalten.', '',
  `**${plans.reduce((sum, plan) => sum + plan.attackCatalog.length, 0)} Katalogoptionen** in sechs Klassenplänen. Derwyn wählen Jungdrache oder junge Welle, eine freie kreative Phase auf Stufe 7–8 und vier eigene Wyrmpfade ab Stufe 9. Ihre Auswahl ist an Charakterbogen und Kampfsystem angebunden. Die übrigen Vennyr-Waffenfolgen behalten ihren bisherigen Entwurfsstand.`, '',
  'Die Vergleichswerte verwenden eine Waffe mit 1W10 ohne feste Attribut-, Waffen- oder Klassenboni. In einer späteren Kampfvergabe gelten die echte Waffe, ihr Typ, ihre Reichweite und die ausgewiesenen Voraussetzungen. Der Schaden folgt dem gemeinsamen, gebremsten Drachentanz-Budget. Reine Vorbereitungen verursachen keinen Schaden.', '',
  '| Klasse | Slots bis 20 | Optionen |', '| --- | ---: | ---: |',
  ...plans.map(plan => `| ${plan.name} | ${plan.techniqueBudget.total} | ${plan.attackCatalog.length} |`), '',
  'Die Anzahl der Katalogoptionen ist keine Anzahl erlernter Attacken. Erster Expertenpfad ab Stufe 9 ohne zusätzliche Slotkosten; weitere Pfade kosten jeweils einen Experten-Slot. Mehrere Pfade vergrößern das Budget nicht.', '',
  'Für Ressourcen, Wirkungsgrenzen und offene Magie siehe [Konzept](SIRENENTANZ_CONCEPT.md).'
];
lines.push(...renderCultureAttackCatalogSections(plans));
await writeClassPageOutput(new URL('../', import.meta.url), 'docs/SIRENENTANZ_ATTACK_CATALOG.md', `${lines.join('\n')}\n`, process.argv.includes('--check'));
console.log(`Wyrmtanz: ${plans.reduce((sum, plan) => sum + plan.attackCatalog.length, 0)} Attackenoptionen dokumentiert${process.argv.includes('--check') ? ' und geprüft' : ''}.`);
