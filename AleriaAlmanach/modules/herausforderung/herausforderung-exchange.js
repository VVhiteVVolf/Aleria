import { getCheckDescription } from '../skill-checks/skill-check-guidance.js?v=20261015-check-options-v1';
import { challengeBenefitBundles } from './herausforderung-outcomes.js?v=20261015-graded-challenges-v1';
import { normalizeHerausforderungEvent, normalizeHerausforderungApproach, getHerausforderungValidationIssues, MAX_HERAUSFORDERUNG_APPROACHES } from './herausforderung-model.js?v=20261016-check-policy-v1';
import { SKILL_DEFINITIONS, ATTRIBUTE_CHECK_DEFINITIONS, SAVING_THROW_DEFINITIONS, getCheckDefinition } from '../skill-checks/skill-check-model.js?v=20261015-check-options-v1';
import { COMBAT_STATUS_PRESETS, STATUS_MODIFIERS, STATUS_ROLL_MODES } from '../combat-status/combat-status-catalog.js';
import { STATUS_DURATIONS } from '../combat-status/combat-status-model.js?v=20261015-graded-challenges-v1';
import { CHALLENGE_COMBAT_EFFECT_TYPES } from './herausforderung-combat-effects.js?v=20261015-graded-challenges-v1';
import { collectRegisterTemplates } from '../item-register/item-register-templates.js';
import { CHALLENGE_IMAGE_FORMATS, CHALLENGE_IMAGE_FITS, EMPTY_CHALLENGE_SCENE_IMAGE } from './herausforderung-scene-image-model.js';

export const HERAUSFORDERUNG_EXPORT_FORMAT = 'aleria.herausforderung';
export const HERAUSFORDERUNG_EXPORT_VERSION = 1;
export const MAX_HERAUSFORDERUNG_IMPORT_BYTES = 2_000_000;
const copy = value => JSON.parse(JSON.stringify(value));

function authoringEvent(source) {
  const event = normalizeHerausforderungEvent(source);
  event.combatContext = { encounterId: '' };
  for (const approach of event.approaches) for (const bundle of challengeBenefitBundles(approach)) {
    // Inventory instances and server-resolved product snapshots are never an
    // authoring instruction. Only catalog references belong in exchange files.
    bundle.items = bundle.items.map(({ product, ...reference }) => reference);
  }
  return event;
}

export function createHerausforderungExport(draft) {
  return { format: HERAUSFORDERUNG_EXPORT_FORMAT, version: HERAUSFORDERUNG_EXPORT_VERSION, kind: 'draft', challenge: authoringEvent(draft) };
}

export function createHerausforderungAiTemplate(registerSnapshot = {}, combatContext = {}) {
  const challenge = authoringEvent({ title: 'Neue Herausforderung', publicDescription: '', combatBound: !!combatContext.encounterId, audience: { mode: 'all', actorIds: [] }, approaches: [normalizeHerausforderungApproach({ approachId: 'ansatz-1', label: 'Ansatz 1' })] });
  challenge.sceneImage = { ...EMPTY_CHALLENGE_SCENE_IMAGE };
  const itemTemplates = collectRegisterTemplates(registerSnapshot).map(item => ({ template: item.id, title: item.title, category: item.category,
    moduleId: item.moduleId || '', sourceRevision: item.sourceRevision || '', priceRange: item.priceRange || null }));
  return {
    format: HERAUSFORDERUNG_EXPORT_FORMAT, version: HERAUSFORDERUNG_EXPORT_VERSION, kind: 'ai-template',
    instructions: {
      task: 'Arbeite die Idee des Nutzers als Aleria-Herausforderung aus. Fülle ausschließlich challenge mit gültigen Daten. Gib ein JSON-Objekt mit format, version und challenge zurück, ohne Begleittext oder neue Felder.',
      workflow: ['Die leere challenge ist eine Vorlage und noch nicht veröffentlichbar.', 'Beschreibe öffentlich nur die wahrnehmbare Situation. Jeder Ansatz benennt einen öffentlich sichtbaren Lösungsweg.', 'Fülle jeden Ansatz mit mindestens einer erlaubten Fertigkeits-ID, einer Schwierigkeit und einer verdeckten Erkenntnis. Verwende unterschiedliche approachId-Werte.', 'Der Nutzer importiert das Ergebnis als Entwurf, prüft es und veröffentlicht es ausdrücklich.'],
      rules: ['Ein bis sechs Ansätze; difficulty als ganze Zahl von 1 bis 40.', 'W20 + tatsächlicher Probenwert der Figur gegen difficulty. Keine pauschalen Ansatzboni. preferredSkills ist die verbindliche Freigabeliste; alle anderen Proben sind gesperrt. checkPenalties legt optional begründete Mali ausschließlich für erlaubte Proben fest. Fertigkeiten enthalten ihre Übung; Attributswürfe erhalten keine Übung; Rettungswürfe verwenden ihre eigene Ausbildung. Geltende Effekte werden automatisch berücksichtigt. Figurenwerte und persönliche Passiven nicht im Entwurf nachbauen.', 'Erfolg: insight aufdecken und Ansatz abschließen. Natürliche 20: kritischer Erfolg, auch unterhalb der Schwierigkeit. Natürliche 1: deutliches Scheitern; vorhandene Figurenregeln können Ergebnisse beeinflussen.', 'Bei 1–3 fehlenden Punkten: partialHint und partialEffects; bei mehr als 3 fehlenden Punkten: failureConsequence und failureEffects. Diese Ansätze bleiben offen.', 'rewards werden einmalig an die erfolgreiche Figur vergeben; ein kritischer Erfolg verdoppelt die Belohnung nicht automatisch. Andere Ansätze werden unabhängig ausgewertet.', 'Fehlschlagsfolgen werden pro Figur, Ansatz und Ergebnisstufe einmal angewendet. Wiederholungen stapeln dieselbe Folge nicht.', 'Gegenstände und Kupfertaler landen direkt im vorhandenen Inventar. Ein volles Inventar blockiert den gesamten Speichervorgang.', 'Belohnungen sind öffentlich sichtbar; verdeckte Erkenntnisse, Teilhinweise und Fehlschlagsfolgen erscheinen erst beim passenden Ergebnis.', 'Nur Spielleitung oder Redaktion darf Belohnungen und mechanische Folgen veröffentlichen.'],
      syntax: {
        targetActor: 'Optional { mode: auto | none | selected, actorId, name, persistence: { kind: character | creature | scene-creature, recordId oder sourceCreatureId } }. Nur echte IDs aus dem Figuren-/Kampfkatalog verwenden. Die Zielperson ist der Gegner oder Ansprechpartner, nicht die würfelnde Figur und nicht die Zielgruppe. mode: none für Situationen ohne Person, mode: selected mit einer festen ID, mode: auto ohne ID für automatische Zuordnung; bei eindeutigem gebundenem Duell wird der einzige Gegner automatisch zugeordnet. Mehrere Gegner nicht erraten.',
        audience: 'Objekt { mode: all | combatants | selected, actorIds: [] }. all: alle Szenenteilnehmer; combatants: nur aktive Teilnehmer des gebundenen Kampfes; selected: eine bis 40 reale Figuren-IDs aus dem Figurenkatalog. Diese Zielgruppe bestimmt, wer würfeln darf.',
        combatBound: 'Boolean. true bindet die Herausforderung an den aktuellen Kampf. Die echte encounterId wird ausschließlich vom Server gesetzt. Bei Kampfteilnehmer-Zielgruppe, fremden Empfängern oder einer Dauer bis Kampfende zwingend.',
        outcomeTable: 'Optional pro Ansatz: Array mit 3–10 Stufen { id, label, natural, minimumTotal, text, success, benefits }. natural ist 20/1 für Krit oder 0 für Gesamtwert-Schwellen. Bei Krit ist minimumTotal null. Genau eine natürliche 20, eine natürliche 1 und eine nichtkritische Auffangstufe mit minimumTotal null sind erforderlich. Sonst gilt nur die höchste erreichte Schwelle. benefits verwendet die reguläre Belohnungssyntax; bei success:false sind Geld und Gegenstände verboten. attemptLimit:1 erlaubt nur einen Versuch pro Lösungsweg. text ist ausschlie?lich eine immersive Szenenbeschreibung ohne SG, RK, W?rfel, Aktionskosten oder Boni. Alle Regeln ausschlie?lich strukturiert in benefits angeben; Treffer eines Folgeangriffs nicht vorwegnehmen. Ohne outcomeTable gelten die bisherigen drei Ergebnisgruppen.',
        title: 'Öffentlich, maximal 180 Zeichen.', publicDescription: 'Öffentlich, erforderlich, maximal 4.000 Zeichen.',
        sceneImage: { optional: 'Optionales öffentliches Stimmungsbild; null oder url leer bedeutet ohne Bild. Keine Lösung im Bild oder Begleittext verraten. Keine Bildlinks erfinden; nur vom Nutzer bereitgestellte Bilder verwenden.', url: 'Direkter HTTP(S)-Bildlink oder vorhandener Projektpfad, maximal 2.048 Zeichen. PNG, JPG, WebP, GIF und AVIF je nach Browser. Keine lokalen Laufwerkspfade, Uploads, base64- oder data-URLs.', alt: 'Bildbeschreibung für Screenreader, maximal 240 Zeichen.', caption: 'Optionale öffentliche Bildunterschrift, maximal 500 Zeichen.', format: 'Eine imageFormats.id. original bewahrt die Bildproportionen.', fit: 'Eine imageFits.id. contain zeigt das vollständige Bild; cover schneidet auf das gewählte Format zu. Bei original bleibt das Originalformat erhalten.' },
        approach: { approachId: 'Eindeutig, maximal 40 Zeichen.', label: 'Öffentlich, maximal 160 Zeichen.', preferredSkills: 'Array erlaubter IDs aus skills, attributeChecks oder savingThrows. Nur diese Proben sind erlaubt; alle anderen werden ausgegraut und serverseitig gesperrt. Ohne checkPenalties gilt kein zusätzlicher Malus. attribute:strength ist ein Kraftwurf ohne Übung, save:strength ein Kraft-Rettungswurf mit seiner Rettungswurf-Ausbildung. Die Figur wählt genau eine Probe.', checkPenalties: 'Optional Array { checkId, modifier, reason }. checkId muss in preferredSkills stehen; je ID höchstens ein Eintrag; modifier ganze JSON-Zahl −30 bis 0; reason optional, maximal 240 Zeichen, beim Versuch sichtbar. Eine natürliche 20 bleibt kritisch. Unmögliche Proben stattdessen aus preferredSkills entfernen.', difficulty: 'Ganze Zahl 1–40.', insight: 'Verdeckte Erkenntnis, erforderlich, maximal 2.000 Zeichen.', partialHint: 'Optional, maximal 2.000 Zeichen.', failureConsequence: 'Optional, maximal 2.000 Zeichen.' },
        rewards: { copper: 'Zahl in Kupfertalern (KT), 0 bis 1.000.000.000, höchstens zwei Nachkommastellen. Taler meint Kupfertaler. 1 KT = 100 Eisenpfennig; 2.5 bedeutet 2,5 KT. Gold ist kein Eingabefeld.', items: 'Maximal acht Referenzen aus itemTemplates. Nur template, moduleId, sourceRevision, title und quantity verwenden. Keine erfundenen IDs, product-Snapshots, Inventar-IDs oder Kampfdaten. Neue Gegenstände zuerst im Handelsregister anlegen.', effects: 'Maximal vier Buffs, Debuffs oder Zustände. Art und Empfänger ausdrücklich wählen.', combatEffects: 'Maximal acht direkte Kampfwirkungen: Schaden, Heilung, temporäre TP, Ressource auffüllen/entziehen oder Zustand entfernen.' },
        failureBundles: 'partialEffects und failureEffects haben copper: 0, items: [] und höchstens vier effects. Geldverlust oder Gegenstandsverlust nicht erfinden; dafür sind diese Felder nicht vorgesehen.',
        quantity: 'Ganze Zahl 1–9.999; Waffen und Rüstungen immer quantity: 1. Tiere sind keine Gegenstandsbelohnungen.',
        effect: { effectId: 'Innerhalb der Ergebnisgruppe eindeutig, maximal 40 Zeichen.', presetId: 'Eine erlaubte effectPresets.id oder leer für einen eigenen Effekt.', name: 'Erforderlich, maximal 160 Zeichen.', description: 'Erzählerische Beschreibung, maximal 1.600 Zeichen. Freitext erfindet keine zusätzliche Mechanik.', kind: 'buff, debuff oder condition nach tatsächlicher Wirkung.', targetActorId: 'Leer für die würfelnde Figur; sonst eine aktive combat.participants.actorId. Dies ist der Wirkungsempfänger, unabhängig von der Zielgruppe der Herausforderung.', usage: 'Optional { scope: attack | action, actorId: aktive Kampfteilnehmer-ID }. Einmaliger Effekt: attack gilt nur für den nächsten einzelnen Angriffswurf, action für alle Angriffswürfe der nächsten Kampfaktion. actorId begrenzt, wessen Angriff ihn auslöst. Nur attack, armorClass und attackRollMode als mechanics; der Verbrauch erfolgt auch bei einem verfehlten Angriff, niemals bei Rede, Heilung, automatischer Wirkung oder Rettungswurf.', durationKind: 'Ein erlaubter durations.id-Wert.', durationAmount: 'Bei actor-comments und scene-comments ganze Zahl 1–999, sonst 2 als Platzhalter.', mechanics: 'Nur die unten aufgeführten modifierKeys und rollModeKeys. Ganzzahlige Boni/Mali −30 bis +30. Wurfarten: normal, advantage oder disadvantage. Eigene Wirkungsfelder werden nicht unterstützt.' },
        combatEffect: { effectId: 'Eindeutig, maximal 40 Zeichen.', type: 'Eine combatEffectTypes.id.', targetActorId: 'Leer für die würfelnde Figur oder eine aktive Kampfteilnehmer-ID.', amount: 'Fester ganzzahliger Betrag 1–10000, oder 0 bei Formel/Zustandsentfernung.', formula: 'Optional z. B. 1W6+2; höchstens 20 Würfel W4/W6/W8/W10/W12. Nur für Schaden, Heilung oder temporäre TP. Bei Formel amount: 0.', damageType: 'Bei Schaden die tatsächliche Schadensart, z. B. Stich oder Feuer.', magical: 'Boolean; berücksichtigt magische Resistenzen.', resourceId: 'Bei Ressourcenwirkung eine vorhandene Ressourcen-ID des Empfängers.', conditionId: 'Bei remove-condition die tatsächliche aktive Zustands-ID. Kampfaura-Zustände können so nicht entfernt werden.' },
        weaponManeuver: "combatEffects-Eintrag: type: weapon-maneuver, amount: 0, formula: leer, targetActorId: aktive angegriffene Figur, maneuver: { actorId: aktiver Angreifer, weaponId: vorhandene Waffen-ID oder leer für aktuell geführt, pickupWeapon: boolean, resourceId: leer oder action/bonus-action/reaction/special-action/aura-focus, extraWeaponDice: ganze Zahl 0–4, rollMode: normal/advantage/disadvantage, damageMultiplier: 1 oder 2, save: null oder { attribute: strength/dexterity/constitution/intelligence/wisdom/charisma, difficulty: ganze Zahl 1–40 } }. Server würfelt mit echten Figurenwerten. save ist die Rettung des angegriffenen Ziels; nur bei Misslingen folgt der Angriff. pickupWeapon verlangt eine wirklich fallengelassene eigene Waffe mit weaponId und resourceId: Aufnahme und Angriff kosten gemeinsam genau einen solchen Punkt. Ohne Aufnahme muss die Waffe wirklich geführt sein. Ein ausgelöster Gegenangriff kann resourceId leer verwenden. Faktor 2 verdoppelt normalen Würfelpool und feste Boni vor Schutz, ohne zusätzlichen kritischen Schadenspool. Kein garantierter Treffer; keine Waffenduplikation als Gegenstandsbelohnung.",
        combatRules: 'Rüstung, Resistenzen, Schutzladungen und temporäre TP nutzen die Kampflogik. Heilung ist auf maximale TP begrenzt; temporäre TP verwenden den höheren Wert und stapeln nicht. Kritischer Fertigkeitserfolg verdoppelt Schaden/Heilung nicht. Folgen werden an ihrer Segmentposition angewendet; frühere Handlungen ändern sich nicht.',
        duration: 'Neue Effekte verlieren im Vergabebeitrag keine Laufzeit. Eigene Beiträge, Szenenbeiträge, Rast und Kampfende nutzen die bestehenden Zustandsuhren.'
      },
      examples: {
        itemReference: itemTemplates[0] ? { template: itemTemplates[0].template, moduleId: itemTemplates[0].moduleId, sourceRevision: itemTemplates[0].sourceRevision, title: itemTemplates[0].title, quantity: 1 } : null,
        buff: { effectId: 'buff-1', presetId: 'blessed', name: 'Ermutigt', description: '+1 auf Fertigkeitsproben für zwei eigene Beiträge.', kind: 'buff', durationKind: 'actor-comments', durationAmount: 2, mechanics: { skill: 1 } },
        debuff: { effectId: 'debuff-1', presetId: 'disadvantage', name: 'Verunsichert', description: 'Nachteil auf Angriffe und Fertigkeitsproben für einen eigenen Beitrag.', kind: 'debuff', durationKind: 'actor-comments', durationAmount: 1, mechanics: { attackRollMode: 'disadvantage', skillRollMode: 'disadvantage' } }
      }
    },
    catalog: {
      combat: { encounterId: combatContext.encounterId || '', participants: combatContext.participants || [] },
      actors: combatContext.actors || combatContext.participants || [],
      combatEffectTypes: CHALLENGE_COMBAT_EFFECT_TYPES.map(([id, label]) => ({ id, label })),
      skills: SKILL_DEFINITIONS.map(check => ({ id: check.id, label: check.label, description: getCheckDescription(check) })),
      attributeChecks: ATTRIBUTE_CHECK_DEFINITIONS.map(check => ({ id: check.id, label: check.label, attributeKey: check.attributeKey, description: getCheckDescription(check) })),
      savingThrows: SAVING_THROW_DEFINITIONS.map(check => ({ id: check.id, label: check.label, attributeKey: check.attributeKey, description: getCheckDescription(check) })), itemTemplates,
      imageFormats: CHALLENGE_IMAGE_FORMATS.map(([id, label]) => ({ id, label })), imageFits: CHALLENGE_IMAGE_FITS.map(([id, label]) => ({ id, label })),
      effectPresets: COMBAT_STATUS_PRESETS.map(({ id, name, kind, description, mechanics = {}, blockedResource }) => ({ id, name, kind, description, mechanics, ...(blockedResource ? { blockedResource } : {}) })),
      durations: STATUS_DURATIONS.map(([id, label]) => ({ id, label })), modifierKeys: STATUS_MODIFIERS.map(([id, label]) => ({ id, label })), rollModeKeys: STATUS_ROLL_MODES.map(([id, label]) => ({ id, label }))
    }, challenge
  };
}

export function parseHerausforderungImport(input, registerSnapshot = {}, combatContext = {}) {
  if (typeof input !== 'string' || new TextEncoder().encode(input).length > MAX_HERAUSFORDERUNG_IMPORT_BYTES) throw Error('Die JSON-Datei darf höchstens 2 MB groß sein.');
  const text = input.trim().replace(/^```(?:json)?\s*([\s\S]*?)\s*```$/i, '$1');
  let document;
  try { document = JSON.parse(text); } catch { throw Error('Die Datei enthält kein gültiges JSON. Prüfe Anführungszeichen, Kommata und Klammern.'); }
  if (!document || typeof document !== 'object' || Array.isArray(document)) throw Error('Eine Herausforderung muss als JSON-Objekt vorliegen.');
  if (document.format && (document.format !== HERAUSFORDERUNG_EXPORT_FORMAT || document.version !== HERAUSFORDERUNG_EXPORT_VERSION)) throw Error('Dieses Exportformat oder diese Version wird nicht unterstützt.');
  const source = copy(document.challenge || document);
  for (const field of ['title', 'publicDescription']) if (source[field] != null && typeof source[field] !== 'string') throw Error(`${field} muss ein Text sein.`);
  if (!Array.isArray(source.approaches) || !source.approaches.length || source.approaches.length > MAX_HERAUSFORDERUNG_APPROACHES) throw Error('Die JSON-Datei braucht ein bis sechs Ansätze unter challenge.approaches.');
  if (source.combatBound != null && typeof source.combatBound !== 'boolean') throw Error('combatBound muss true oder false sein.');
  delete source.combatContext;
  const targetIds = combatContext.actors || combatContext.participants || [];
  if (source.targetActor?.actorId && targetIds.length && !targetIds.some(actor => (actor.actorId || actor.id) === source.targetActor.actorId)) throw Error('Die Zielperson ist nicht im aktuellen Figurenkatalog vorhanden.');
  const catalog = new Map(collectRegisterTemplates(registerSnapshot).map(item => [item.id, item]));
  for (const [index, approach] of source.approaches.entries()) {
    if (!approach || typeof approach !== 'object' || Array.isArray(approach)) throw Error(`Ansatz ${index + 1} ist kein gültiges Objekt.`);
    if (approach.preferredSkills != null && !Array.isArray(approach.preferredSkills)) throw Error(`Ansatz ${index + 1}: preferredSkills muss eine Liste von Proben-IDs sein.`);
    for (const field of ['approachId', 'label', 'insight', 'partialHint', 'failureConsequence']) if (approach[field] != null && typeof approach[field] !== 'string') throw Error(`Ansatz ${index + 1}: ${field} muss ein Text sein.`);
    if (approach.difficulty != null && typeof approach.difficulty !== 'number') throw Error(`Ansatz ${index + 1}: difficulty muss eine ganze JSON-Zahl sein.`);
    if (approach.preferredSkills?.some?.(id => !getCheckDefinition(id))) throw Error(`Ansatz ${index + 1} verwendet eine unbekannte Proben-ID.`);
    for (const [bundleIndex, bundle] of challengeBenefitBundles(approach).entries()) {
      const field = `Ergebnisgruppe ${bundleIndex + 1}`;
      if (bundle != null && (typeof bundle !== 'object' || Array.isArray(bundle))) throw Error(`${field} muss ein Objekt sein.`);
      for (const list of ['effects', 'combatEffects', 'items']) if (bundle?.[list] != null && !Array.isArray(bundle[list])) throw Error(`${field}.${list} muss eine Liste sein.`);
      if (bundle?.gold != null) throw Error('Geld als copper in Kupfertalern angeben. Das Feld gold ist im KI-Import nicht erlaubt.');
      if (bundle?.copper != null && typeof bundle.copper !== 'number') throw Error('copper muss eine JSON-Zahl in Kupfertalern sein, zum Beispiel 2.5.');
      for (const effect of [...(bundle?.effects || []), ...(bundle?.combatEffects || [])]) {
        if (effect?.type === 'weapon-maneuver' && !combatContext.participants?.some(participant => participant.actorId === effect.maneuver?.actorId)) throw Error('Der Angreifer des Waffenmanövers ist nicht im aktiven Kampf.');
        if (effect?.usage?.actorId && !combatContext.participants?.some(participant => participant.actorId === effect.usage.actorId)) throw Error('Die Figur für den Effektverbrauch ist nicht im aktiven Kampf.');
        if (effect?.targetActorId && !combatContext.participants?.some(participant => participant.actorId === effect.targetActorId)) throw Error('Der Wirkungsempfänger ist nicht im aktiven Kampf.');
      }
      for (const item of Array.isArray(bundle?.items) ? bundle.items : []) {
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
