import { normalizeHerausforderungEvent, normalizeHerausforderungApproach, getHerausforderungValidationIssues, MAX_HERAUSFORDERUNG_APPROACHES } from './herausforderung-model.js?v=20261014-herausforderung-rewards-v2';
import { SKILL_DEFINITIONS, getSkillDefinition } from '../skill-checks/skill-check-model.js';
import { COMBAT_STATUS_PRESETS, STATUS_MODIFIERS, STATUS_ROLL_MODES } from '../combat-status/combat-status-catalog.js';
import { STATUS_DURATIONS } from '../combat-status/combat-status-model.js';
import { collectRegisterTemplates } from '../item-register/item-register-templates.js';

export const HERAUSFORDERUNG_EXPORT_FORMAT = 'aleria.herausforderung';
export const HERAUSFORDERUNG_EXPORT_VERSION = 1;
export const MAX_HERAUSFORDERUNG_IMPORT_BYTES = 2_000_000;
const copy = value => JSON.parse(JSON.stringify(value));

function authoringEvent(source) {
  const event = normalizeHerausforderungEvent(source);
  for (const approach of event.approaches) for (const field of ['rewards', 'partialEffects', 'failureEffects']) {
    // Inventory instances and server-resolved product snapshots are never an
    // authoring instruction. Only catalog references belong in exchange files.
    approach[field].items = approach[field].items.map(({ product, ...reference }) => reference);
  }
  return event;
}

export function createHerausforderungExport(draft) {
  return { format: HERAUSFORDERUNG_EXPORT_FORMAT, version: HERAUSFORDERUNG_EXPORT_VERSION, kind: 'draft', challenge: authoringEvent(draft) };
}

export function createHerausforderungAiTemplate(registerSnapshot = {}) {
  const challenge = authoringEvent({ title: 'Neue Herausforderung', publicDescription: '', approaches: [normalizeHerausforderungApproach({ approachId: 'ansatz-1', label: 'Ansatz 1' })] });
  const itemTemplates = collectRegisterTemplates(registerSnapshot).map(item => ({ template: item.id, title: item.title, category: item.category,
    moduleId: item.moduleId || '', sourceRevision: item.sourceRevision || '', priceRange: item.priceRange || null }));
  return {
    format: HERAUSFORDERUNG_EXPORT_FORMAT, version: HERAUSFORDERUNG_EXPORT_VERSION, kind: 'ai-template',
    instructions: {
      task: 'Arbeite die Idee des Nutzers als Aleria-Herausforderung aus. Fülle ausschließlich challenge mit gültigen Daten. Gib ein JSON-Objekt mit format, version und challenge zurück, ohne Begleittext oder neue Felder.',
      workflow: ['Die leere challenge ist eine Vorlage und noch nicht veröffentlichbar.', 'Beschreibe öffentlich nur die wahrnehmbare Situation. Jeder Ansatz benennt einen öffentlich sichtbaren Lösungsweg.', 'Fülle jeden Ansatz mit mindestens einer erlaubten Fertigkeits-ID, einer Schwierigkeit und einer verdeckten Erkenntnis. Verwende unterschiedliche approachId-Werte.', 'Der Nutzer importiert das Ergebnis als Entwurf, prüft es und veröffentlicht es ausdrücklich.'],
      rules: ['Ein bis sechs Ansätze; difficulty als ganze Zahl von 1 bis 40.', 'W20 + tatsächlicher Fertigkeitswert der Figur + Ansatzbonus gegen difficulty. Bevorzugte Fertigkeiten +2, alternative Fertigkeiten −2. Figurenwerte und persönliche Passiven nicht im Entwurf nachbauen.', 'Erfolg: insight aufdecken und Ansatz abschließen. Natürliche 20: kritischer Erfolg, auch unterhalb der Schwierigkeit. Natürliche 1: deutliches Scheitern; vorhandene Figurenregeln können Ergebnisse beeinflussen.', 'Bei 1–3 fehlenden Punkten: partialHint und partialEffects; bei mehr als 3 fehlenden Punkten: failureConsequence und failureEffects. Diese Ansätze bleiben offen.', 'rewards werden einmalig an die erfolgreiche Figur vergeben; ein kritischer Erfolg verdoppelt die Belohnung nicht automatisch. Andere Ansätze werden unabhängig ausgewertet.', 'Fehlschlagsfolgen werden pro Figur, Ansatz und Ergebnisstufe einmal angewendet. Wiederholungen stapeln dieselbe Folge nicht.', 'Gegenstände und Kupfertaler landen direkt im vorhandenen Inventar. Ein volles Inventar blockiert den gesamten Speichervorgang.', 'Belohnungen sind öffentlich sichtbar; verdeckte Erkenntnisse, Teilhinweise und Fehlschlagsfolgen erscheinen erst beim passenden Ergebnis.', 'Nur Spielleitung oder Redaktion darf Belohnungen und mechanische Folgen veröffentlichen.'],
      syntax: {
        title: 'Öffentlich, maximal 180 Zeichen.', publicDescription: 'Öffentlich, erforderlich, maximal 4.000 Zeichen.',
        approach: { approachId: 'Eindeutig, maximal 40 Zeichen.', label: 'Öffentlich, maximal 160 Zeichen.', preferredSkills: 'Array erlaubter skills.id-Werte.', difficulty: 'Ganze Zahl 1–40.', insight: 'Verdeckte Erkenntnis, erforderlich, maximal 2.000 Zeichen.', partialHint: 'Optional, maximal 2.000 Zeichen.', failureConsequence: 'Optional, maximal 2.000 Zeichen.' },
        rewards: { copper: 'Zahl in Kupfertalern (KT), 0 bis 1.000.000.000, höchstens zwei Nachkommastellen. Taler meint Kupfertaler. 1 KT = 100 Eisenpfennig; 2.5 bedeutet 2,5 KT. Gold ist kein Eingabefeld.', items: 'Maximal acht Referenzen aus itemTemplates. Nur template, moduleId, sourceRevision, title und quantity verwenden. Keine erfundenen IDs, product-Snapshots, Inventar-IDs oder Kampfdaten. Neue Gegenstände zuerst im Handelsregister anlegen.', effects: 'Maximal vier Buffs.' },
        failureBundles: 'partialEffects und failureEffects haben copper: 0, items: [] und höchstens vier effects. Geldverlust oder Gegenstandsverlust nicht erfinden; dafür sind diese Felder nicht vorgesehen.',
        quantity: 'Ganze Zahl 1–9.999; Waffen und Rüstungen immer quantity: 1. Tiere sind keine Gegenstandsbelohnungen.',
        effect: { effectId: 'Innerhalb der Ergebnisgruppe eindeutig, maximal 40 Zeichen.', presetId: 'Eine erlaubte effectPresets.id oder leer für einen eigenen Effekt.', name: 'Erforderlich, maximal 160 Zeichen.', description: 'Erzählerische Beschreibung, maximal 1.600 Zeichen. Freitext erfindet keine zusätzliche Mechanik.', kind: 'buff in rewards, debuff in Fehlschlagsfolgen.', durationKind: 'Ein erlaubter durations.id-Wert.', durationAmount: 'Bei actor-comments und scene-comments ganze Zahl 1–999, sonst 2 als Platzhalter.', mechanics: 'Nur die unten aufgeführten modifierKeys und rollModeKeys. Ganzzahlige Boni/Mali −30 bis +30. Wurfarten: normal, advantage oder disadvantage. Eigene Wirkungsfelder werden nicht unterstützt.' },
        duration: 'Neue Effekte verlieren im Vergabebeitrag keine Laufzeit. Eigene Beiträge, Szenenbeiträge, Rast und Kampfende nutzen die bestehenden Zustandsuhren.'
      },
      examples: {
        itemReference: itemTemplates[0] ? { template: itemTemplates[0].template, moduleId: itemTemplates[0].moduleId, sourceRevision: itemTemplates[0].sourceRevision, title: itemTemplates[0].title, quantity: 1 } : null,
        buff: { effectId: 'buff-1', presetId: 'blessed', name: 'Ermutigt', description: '+1 auf Fertigkeitsproben für zwei eigene Beiträge.', kind: 'buff', durationKind: 'actor-comments', durationAmount: 2, mechanics: { skill: 1 } },
        debuff: { effectId: 'debuff-1', presetId: 'disadvantage', name: 'Verunsichert', description: 'Nachteil auf Angriffe und Fertigkeitsproben für einen eigenen Beitrag.', kind: 'debuff', durationKind: 'actor-comments', durationAmount: 1, mechanics: { attackRollMode: 'disadvantage', skillRollMode: 'disadvantage' } }
      }
    },
    catalog: {
      skills: SKILL_DEFINITIONS.map(({ id, label }) => ({ id, label })), itemTemplates,
      effectPresets: COMBAT_STATUS_PRESETS.map(({ id, name, kind, description, mechanics = {}, blockedResource }) => ({ id, name, kind, description, mechanics, ...(blockedResource ? { blockedResource } : {}) })),
      durations: STATUS_DURATIONS.map(([id, label]) => ({ id, label })), modifierKeys: STATUS_MODIFIERS.map(([id, label]) => ({ id, label })), rollModeKeys: STATUS_ROLL_MODES.map(([id, label]) => ({ id, label }))
    }, challenge
  };
}

export function parseHerausforderungImport(input, registerSnapshot = {}) {
  if (typeof input !== 'string' || new TextEncoder().encode(input).length > MAX_HERAUSFORDERUNG_IMPORT_BYTES) throw Error('Die JSON-Datei darf höchstens 2 MB groß sein.');
  const text = input.trim().replace(/^```(?:json)?\s*([\s\S]*?)\s*```$/i, '$1');
  let document;
  try { document = JSON.parse(text); } catch { throw Error('Die Datei enthält kein gültiges JSON. Prüfe Anführungszeichen, Kommata und Klammern.'); }
  if (!document || typeof document !== 'object' || Array.isArray(document)) throw Error('Eine Herausforderung muss als JSON-Objekt vorliegen.');
  if (document.format && (document.format !== HERAUSFORDERUNG_EXPORT_FORMAT || document.version !== HERAUSFORDERUNG_EXPORT_VERSION)) throw Error('Dieses Exportformat oder diese Version wird nicht unterstützt.');
  const source = copy(document.challenge || document);
  for (const field of ['title', 'publicDescription']) if (source[field] != null && typeof source[field] !== 'string') throw Error(`${field} muss ein Text sein.`);
  if (!Array.isArray(source.approaches) || !source.approaches.length || source.approaches.length > MAX_HERAUSFORDERUNG_APPROACHES) throw Error('Die JSON-Datei braucht ein bis sechs Ansätze unter challenge.approaches.');
  const catalog = new Map(collectRegisterTemplates(registerSnapshot).map(item => [item.id, item]));
  for (const [index, approach] of source.approaches.entries()) {
    if (!approach || typeof approach !== 'object' || Array.isArray(approach)) throw Error(`Ansatz ${index + 1} ist kein gültiges Objekt.`);
    if (approach.preferredSkills != null && !Array.isArray(approach.preferredSkills)) throw Error(`Ansatz ${index + 1}: preferredSkills muss eine Liste von Fertigkeits-IDs sein.`);
    for (const field of ['approachId', 'label', 'insight', 'partialHint', 'failureConsequence']) if (approach[field] != null && typeof approach[field] !== 'string') throw Error(`Ansatz ${index + 1}: ${field} muss ein Text sein.`);
    if (approach.difficulty != null && typeof approach.difficulty !== 'number') throw Error(`Ansatz ${index + 1}: difficulty muss eine ganze JSON-Zahl sein.`);
    if (approach.preferredSkills?.some?.(id => !getSkillDefinition(id))) throw Error(`Ansatz ${index + 1} verwendet eine unbekannte Fertigkeits-ID.`);
    for (const field of ['rewards', 'partialEffects', 'failureEffects']) {
      if (approach[field]?.gold != null) throw Error('Geld als copper in Kupfertalern angeben. Das Feld gold ist im KI-Import nicht erlaubt.');
      if (approach[field]?.copper != null && typeof approach[field].copper !== 'number') throw Error('copper muss eine JSON-Zahl in Kupfertalern sein, zum Beispiel 2.5.');
      for (const item of Array.isArray(approach[field]?.items) ? approach[field].items : []) {
        const template = catalog.get(item?.template);
        if (!template) throw Error(`Ansatz ${index + 1}: Die Registervorlage „${item?.template || ''}“ ist nicht verfügbar. Handelsregister laden und erneut importieren.`);
        if (['waffen', 'ruestungen'].includes(template.category) && Number(item.quantity ?? 1) !== 1) throw Error('Waffen und Rüstungen werden einzeln vergeben.');
        delete item.product;
        item.title = template.title;
        item.moduleId = template.moduleId || '';
        item.sourceRevision = template.sourceRevision || '';
      }
    }
  }
  const issues = getHerausforderungValidationIssues(source);
  const incomplete = issue => ['publicDescription', 'insight', 'preferredSkill'].includes(issue.field);
  const invalid = issues.find(issue => !incomplete(issue));
  if (invalid) throw Error(invalid.message);
  return { event: authoringEvent(source), issues: issues.filter(incomplete) };
}
