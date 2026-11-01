const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const categories = { waffen: 'Waffe', ruestungen: 'Rüstung / Schild', speisen: 'Speise', getraenke: 'Getränk', alchemie: 'Alchemie', arkanes: 'Arkaner Gegenstand', werkzeuge: 'Werkzeug / Ausrüstung', sonstiges: 'Dokument / Sonstiges', pferde: 'Pferd', vieh: 'Tier' };
const input = (name, label, value, type = 'text', extra = '') => `<label>${label}<input name="${name}" type="${type}" value="${escape(value)}" ${extra}></label>`;
const select = (name, label, value, options) => `<label>${label}<select name="${name}">${Object.entries(value && !Object.hasOwn(options, value) ? { [value]: value, ...options } : options).map(([id, title]) => `<option value="${escape(id)}" ${value === id ? 'selected' : ''}>${escape(title)}</option>`).join('')}</select></label>`;
const area = (name, label, value, extra = '') => `<label class="ib-wide">${label}<textarea name="${name}" rows="3" ${extra}>${escape(value)}</textarea></label>`;

function weaponFields(definition = {}) {
  return `${input('damageFormula', 'Grundschaden', definition.damageFormula || '1d4')}${input('versatileDamageFormula', 'Zweihandwürfel (optional)', definition.versatileDamageFormula)}
    ${select('damageType', 'Schadensart', definition.damageType, { Hieb: 'Hieb', Stich: 'Stich', Wucht: 'Wucht', physisch: 'Physisch', Feuer: 'Feuer', Eis: 'Eis', Blitz: 'Blitz', Gift: 'Gift', Arkan: 'Arkan', Andere: 'Andere' })}
    ${select('weaponType', 'Waffenfamilie', definition.weaponType, { sword: 'Schwert', dagger: 'Dolch', axe: 'Axt', mace: 'Wuchtwaffe', spear: 'Speer', polearm: 'Stangenwaffe', bow: 'Bogen', crossbow: 'Armbrust', firearm: 'Feuerwaffe', staff: 'Stab', shield: 'Schild', other: 'Andere' })}
    ${input('weaponProfileId', 'Waffenprofil', definition.weaponProfileId, 'text', 'placeholder="z. B. sword, spear, longbow"')}
    ${select('training', 'Benötigte Waffenausbildung', definition.training, { simple: 'Einfache Waffen', martial: 'Kriegswaffen', special: 'Besondere Ausbildung' })}
    ${select('attackAttribute', 'Waffenattribut', definition.attackAttribute, { strength: 'Stärke', dexterity: 'Geschicklichkeit', intelligence: 'Intelligenz', wisdom: 'Weisheit', charisma: 'Charisma' })}
    ${input('range', 'Reichweite', definition.range)}${input('attackBonus', 'Gegenstandsbonus auf Treffer', definition.attackBonus || 0, 'number', 'min="-99" max="99" step="1"')}
    ${input('damageBonus', 'Gegenstandsbonus auf Schaden', definition.damageBonus || 0, 'number', 'min="-99" max="99" step="1"')}
    ${area('requirements', 'Voraussetzungen', definition.requirements)}`;
}
function armorFields(definition = {}) {
  return `${select('armorKind', 'Schutzgegenstand', definition.armorKind || 'armor', { armor: 'Körperrüstung', shield: 'Schild' })}
    ${select('armorCategory', 'Rüstungskategorie', definition.armorCategory, { '': 'Noch offen', light: 'Leicht', medium: 'Mittel', heavy: 'Schwer' })}
    ${input('baseArmorClass', 'Basis-Rüstungsklasse', definition.baseArmorClass ?? 10, 'number', 'min="0" max="40" step="1"')}
    ${input('armorClassBonus', 'Zusätzlicher RK-/Schildbonus', definition.armorClassBonus || 0, 'number', 'min="-20" max="20" step="1"')}
    ${select('dexterityMode', 'GES-Anrechnung', definition.dexterityMode, { full: 'Voll', capped: 'Begrenzt', none: 'Keine' })}
    ${input('dexterityCap', 'GES-Grenze', definition.dexterityCap ?? 2, 'number', 'min="0" max="20" step="1"')}
    ${input('protectionAmount', 'Schadensschutz', definition.damageProtection?.amount || 0, 'number', 'min="0" max="100" step="1"')}
    ${input('protectionTypes', 'Schutz gegen (Komma getrennt)', (definition.damageProtection?.damageTypes || []).join(', '), 'text', 'placeholder="hieb, stich, wucht"')}
    ${input('protectionExcluded', 'Ausgenommene Schadensarten', (definition.damageProtection?.excludedDamageTypes || []).join(', '))}`;
}
function useFields(use = {}) {
  return `<details class="ib-wide" data-ib-disclosure="use"><summary>Verwendung, Verbrauch & Ladungen</summary><div class="ib-grid">
    ${select('useMode', 'Bei tatsächlicher Verwendung', use.mode, { use: 'Gegenstand behalten', consume: 'Menge verbrauchen' })}
    ${input('useQuantity', 'Menge je Verwendung', use.quantity || 1, 'number', 'min="1" max="9999" step="1"')}
    ${input('chargesMaximum', 'Ladungen (0 = keine)', use.chargesMaximum || 0, 'number', 'min="0" max="9999" step="1"')}
    ${input('chargesPerUse', 'Ladungen je Verwendung', use.chargesPerUse || 0, 'number', 'min="0" max="9999" step="1"')}
    ${select('recovery', 'Ladungen erholen sich', use.recovery, { none: 'Nicht automatisch', day: 'Pro Tag', 'short-rest': 'Kurze Rast', 'long-rest': 'Lange Rast' })}
    ${area('useNarrative', 'Beschriebene Wirkung', use.narrative)}
    <div class="ib-wide ib-effects">${(use.costs || []).map((cost, index) => `<div data-ib-cost="${index}">${select('costResource', 'Verwendung kostet', cost.resourceId, { action: 'Aktion', 'bonus-action': 'Bonusaktion', reaction: 'Reaktion', 'special-action': 'Besondere Aktion', 'aura-focus': 'Aura-Fokus', 'mana-focus': 'Mana', 'pact-points': 'Paktpunkte' })}${input('costAmount', 'Punkte', cost.amount, 'number', 'min="1" max="10000" step="1"')}<button type="button" data-ib-action="remove-cost" data-ib-index="${index}">Kosten entfernen</button></div>`).join('')}<button type="button" data-ib-action="add-cost">＋ Aktions- / Ressourcenkosten</button></div>
    <div class="ib-wide ib-effects">${(use.effects || []).map((effect, index) => `<div data-ib-effect="${index}">${select('effectType', 'Automatische Eigenwirkung', effect.type, { healing: 'Lebenspunkte heilen', 'temporary-hit-points': 'Temporäre Lebenspunkte', 'restore-resource': 'Ressource auffüllen' })}
      ${input('effectAmount', 'Fester Wert', effect.amount, 'number', 'min="0" max="10000" step="1"')}${input('effectResource', 'Ressourcen-ID (nur bei Auffüllen)', effect.resourceId || '', 'text', 'placeholder="z. B. mana-focus"')}
      <button type="button" data-ib-action="remove-effect" data-ib-index="${index}">Wirkung entfernen</button></div>`).join('')}
      <button type="button" data-ib-action="add-effect">＋ Eigenwirkung</button></div>
    <p class="ib-help ib-wide">Ohne automatische Wirkung bleibt der Text eine Erzählerregel. Unfertige Angaben können vorläufig gespeichert werden.</p></div></details>`;
}
export function itemBuilderMarkup(draft, templates) {
  const existing = draft.intent === 'existing';
  const source = templates.find(item => item.id === draft.sourceId);
  const canEdit = source?.definitionRef && !source.definitionRef.id.startsWith('standard:');
  const intents = { existing: 'Vorhandene Definition verwenden', variant: 'Gemeinsame Serienvariante anlegen', unique: 'Echtes Unikat anlegen', ...(canEdit ? { edit: 'Neue Version dieser Definition' } : {}) };
  return `<form method="dialog"><header><div><small>Gemeinsame Itemverwaltung</small><h2 id="item-builder-title">Item-Builder</h2></div><button type="button" data-ib-action="cancel" aria-label="Item-Builder schließen">×</button></header>
    <div class="ib-content"><div class="ib-grid">${select('intent', 'Was möchtest du erstellen?', draft.intent, intents)}
    <label>Vorlage suchen<input type="search" name="sourceSearch" placeholder="Name, Art oder Anbieter"></label>
    <label class="ib-wide">Ausgangsdefinition<select name="sourceId"><option value="">Ohne Vorlage beginnen</option>${templates.map(item => `<option value="${escape(item.id)}" ${item.id === draft.sourceId ? 'selected' : ''}>${escape(item.title)}${item.listName ? ` · ${escape(item.listName)}` : ''}${item.definitionRef ? ` · Version ${escape(item.definitionRef.revision.slice(0, 8))}` : ''}</option>`).join('')}</select></label></div>
    <p class="ib-help">${existing ? 'Alle Exemplare verwenden die gemeinsamen Regeln dieser Definition. Persönlicher Name, Zustand und Besitz werden am Exemplar geführt.' : draft.intent === 'unique' ? 'Diese Definition gehört zu genau einem Gegenstand. Besitzerwechsel erzeugen kein zweites Exemplar.' : 'Diese Regeln können von beliebig vielen Exemplaren gemeinsam verwendet werden. Bestehende Versionen bleiben erhalten.'}</p>
    <fieldset ${existing ? 'disabled' : ''}><div class="ib-grid">
      ${input('title', 'Name der Definition', draft.title, 'text', 'required maxlength="180"')}${select('category', 'Gegenstandsart', draft.category, categories)}
      ${input('type', 'Unterart / Ausführung', draft.type)}${input('image', 'Bildicon · URL oder Projektpfad', draft.image, 'text', 'maxlength="4000"')}
      ${area('description', 'Beschreibung', draft.description, 'maxlength="12000"')}${input('weight', 'Gewicht in kg (leer = unbekannt)', draft.weight ?? '', 'number', 'min="0" max="100000" step="0.01"')}
      ${select('mechanicsStatus', 'Ausarbeitungsstand', draft.mechanicsStatus, { provisional: 'Vorläufige Grundwerte', defined: 'Ausgearbeitet', narrative: 'Erzählerische Wirkung' })}
      ${draft.category === 'waffen' ? weaponFields(draft.combatDefinition) : draft.category === 'ruestungen' ? armorFields(draft.combatDefinition) : ''}
      ${['waffen', 'ruestungen'].includes(draft.category) ? area('properties', 'Handhabung & Eigenschaften', draft.combatDefinition?.properties) + area('notes', 'Regelhinweise', draft.combatDefinition?.notes) : ''}
      ${useFields(draft.useDefinition)}
      ${['waffen', 'ruestungen'].includes(draft.category) ? `<details class="ib-wide" data-ib-disclosure="equipment"><summary>Erweiterte Ausrüstungsregeln</summary><p class="ib-help">Vorhandene strukturierte Auslöser und Rüstungswirkungen bleiben erhalten. Diese Regeldaten werden als JSON geprüft; Freitext gehört in die Regelhinweise.</p><div class="ib-grid">
        ${area('triggerRules', 'Auslöserregeln', JSON.stringify(draft.combatDefinition?.triggerRules || [], null, 2))}
        ${draft.category === 'ruestungen' ? area('armorMechanics', 'Strukturierte Rüstungswirkungen', JSON.stringify(draft.combatDefinition?.mechanics || {}, null, 2)) + (draft.combatDefinition?.armorKind === 'shield' ? area('equipCosts', 'Schild anlegen / aufstellen (Aktionskosten als JSON; mindestens 1 Bonusaktion nach Startaufstellung)', JSON.stringify(draft.combatDefinition?.equipCosts || [], null, 2)) : '') : area('aiInstructions', 'Erzählerhinweise zur Waffe', draft.combatDefinition?.aiInstructions) + area('weaponMechanics', 'Angriffskosten, Effekte und Munition (JSON)', JSON.stringify(Object.fromEntries(['effects', 'activationType', 'costs', 'auraBypass', 'ammunition', 'spendAllRegularActions'].map(key => [key, draft.combatDefinition?.[key] ?? null])), null, 2))}
      </div></details>` : ''}
    </div></fieldset><p data-ib-error role="alert"></p></div>
    <footer><button type="button" data-ib-action="cancel">Abbrechen</button><button type="submit" class="ib-primary">${existing ? 'Definition verwenden' : 'Definition speichern & verwenden'}</button></footer></form>`;
}
