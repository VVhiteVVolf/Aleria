import { REGISTER_CATEGORIES, canManageCharacter } from './item-register-model.js';
import { moneyTotal, formatCopper, localizedNumber } from './item-register-money.js';
import { resalePrice } from './item-register-trade.js';
import { escape, field, textarea, select } from './item-register-view.js';

export function createForm(kind, item, snapshot, access) {
  const id = crypto.randomUUID();
  if (kind === 'buy' || kind === 'sell') {
    const characters = snapshot.characters.filter(character => canManageCharacter(character, access));
    const character = kind === 'sell' ? snapshot.characters.find(entry => entry.id === item.ownerCharacterId) : characters[0];
    const product = kind === 'sell' ? snapshot.offers.find(entry => entry.id === item.rawItem.offerId) || snapshot.standards.find(entry => entry.id === item.templateId) : item;
    if (!character) throw new Error('Es ist keine Figur mit deiner Firebase-Besitzberechtigung verfügbar. Die Spielleitung kann Figuren ebenfalls verwalten.');
    if (!product) throw new Error('Die Herkunft dieses Gegenstands ist noch nicht mit einer Standardvorlage oder einem Angebot verbunden.');
    const price = kind === 'buy' ? product.priceRange?.minCopper : resalePrice(item.rawItem, product);
    if (price == null) throw new Error('Für diesen Vorgang fehlt ein verbindlicher Preis.');
    return { id, kind, item, product, character, characters, snapshot,
      title: kind === 'buy' ? 'Für eine Figur kaufen' : 'Gegenstand verkaufen',
      content: `<p class="ir-form-lead">${escape(item.title)}</p><div class="ir-form-grid">${kind === 'buy' ? select('characterId', 'Käufer', characters.map(entry => ({ id: entry.id, label: entry.name })), character.id) : `<p>Verkäufer: <strong>${escape(character.name)}</strong></p>`}
        ${field('quantity', 'Menge', 1, `type="number" min="1" max="${kind === 'sell' ? item.quantity : ['pferde', 'vieh', 'waffen', 'ruestungen'].includes(item.category) ? 1 : 9999}" step="1" required`)}
        ${field('unitCopper', kind === 'buy' ? 'Vereinbarter Stückpreis (KT)' : 'Ankaufspreis je Stück (KT)', price, `type="number" step="0.01" min="${kind === 'buy' ? product.priceRange.minCopper : price}" max="${kind === 'buy' ? product.priceRange.maxCopper : price}" required ${kind === 'sell' ? 'readonly' : ''}`)}</div>
        <div class="ir-quote" data-ir-role="quote"></div><p class="ir-form-help">${kind === 'buy' ? 'Der Kaufpreis wird abgezogen und die Ware direkt ins Inventar übernommen.' : 'Standardmäßig erhält die Figur 50 % ihres Kaufpreises. Vereinbarte Ankaufspreise gehen vor. Ein verknüpfter Begleiter verliert bei einem Verkauf seine Besitzerzuordnung.'}</p>`,
      submitLabel: kind === 'buy' ? 'Verbindlich kaufen' : 'Verkauf abschließen' };
  }
  if (kind === 'customize') return { id, kind, item, snapshot, title: 'Persönlichen Besitz bearbeiten', submitLabel: 'Änderungen speichern',
    content: `<p class="ir-form-help">Die Standardvorlage bleibt erhalten. Name und Aussehen gehören zu diesem einzelnen Gegenstand${item.creatureId ? ' und seinem verknüpften Begleiter' : ''}.</p><div class="ir-form-grid">${field('name', 'Name', item.title, 'required maxlength="180"')}${field('type', 'Art / Ausführung', item.type, 'maxlength="180"')}${field('image', 'Bild-URL oder Pfad', item.image, 'maxlength="4000"')}${textarea('description', 'Beschreibung', item.description)}</div>` };
  if (kind === 'link-creature') return { id, kind, item, snapshot, title: 'Begleiter im Bestiarium anlegen', submitLabel: 'Begleiter anlegen',
    content: `<p><strong>${escape(item.title)}</strong> wird mit ${escape(item.ownerCharacterName)} und diesem Besitzdatensatz verbunden.</p><p>Name, Bild und Beschreibung werden übernommen. Die Spielwerte können anschließend im Bestiarium ergänzt werden.</p>` };
  const editing = kind === 'edit-offer';
  const source = editing ? item : { ...item, id: `offer:${id}`, listId: '', listName: '', stock: null, buybackCopper: null };
  const templateId = editing ? item.templateId : item?.section === 'standard' ? item.id : item?.templateId || '';
  return { id, kind: 'offer', item: source, snapshot, editing, title: editing ? 'Angebot bearbeiten' : 'Angebot im Sortiment anlegen', submitLabel: 'Angebot speichern',
    content: `<p class="ir-form-help">Ein Anbieter kann beliebig viele Varianten führen. Gleichnamige Waren anderer Sortimente bleiben getrennt.</p><div class="ir-form-grid">
      ${field('listName', 'Anbieter / Name der Liste', source.listName, 'required maxlength="180" list="ir-provider-names"')}<datalist id="ir-provider-names">${[...new Set(snapshot.offers.map(offer => offer.listName))].map(name => `<option value="${escape(name)}">`).join('')}</datalist>
      ${select('templateId', 'Standardvorlage (optional)', [{ id: '', label: 'Eigenständiges Gut' }, ...snapshot.standards.map(entry => ({ id: entry.id, label: `${entry.title} · ${entry.categoryLabel}` }))], templateId)}
      ${field('title', 'Name der Ware', source.title, 'required maxlength="180"')}${select('category', 'Warengruppe', REGISTER_CATEGORIES, source.category)}${field('type', 'Art / Ausführung', source.type, 'maxlength="180"')}${field('image', 'Bild-URL oder Pfad', source.image, 'maxlength="4000"')}
      ${field('minCopper', 'Mindestpreis (KT)', source.priceRange?.minCopper ?? '', 'type="number" min="0" step="0.01"')}${field('maxCopper', 'Höchstpreis (KT)', source.priceRange?.maxCopper ?? '', 'type="number" min="0" step="0.01"')}
      ${field('stock', 'Bestand (leer = nicht begrenzt)', source.stock ?? '', 'type="number" min="0" step="1"')}${field('buybackCopper', 'Ankaufspreis (leer = 50 % des Kaufpreises)', source.buybackCopper ?? '', 'type="number" min="0" step="0.01"')}
      ${textarea('description', 'Beschreibung', source.description)}${textarea('details', 'Besonderheiten / Bedingungen', source.details)}
      <details class="ir-full"><summary>Spielwerte für Waffen und Rüstungen</summary><p class="ir-form-help">Nur verbindliche Werte eintragen. Die Werte werden bei einem Kauf in den Charakterbogen übernommen.</p><div class="ir-form-grid">${field('damageFormula', 'Schadensformel', source.combatDefinition?.damageFormula || '', 'placeholder="z. B. 1d8" maxlength="40"')}${field('damageType', 'Schadensart', source.combatDefinition?.damageType || '', 'maxlength="80"')}${field('baseArmorClass', 'Rüstungsklasse', source.combatDefinition?.baseArmorClass ?? '', 'type="number" min="0" max="99" step="1"')}</div></details>
      ${editing ? `<label class="ir-full"><input type="checkbox" name="archived" ${source.archived ? 'checked' : ''}> Angebot aus dem Sortiment nehmen</label>` : ''}</div>` };
}

export function quote(form, values) {
  const character = form.characters?.find(entry => entry.id === values.characterId) || form.character;
  const quantity = Number(values.quantity || 1), unit = Number(values.unitCopper || 0);
  const wallet = moneyTotal(character?.inventory?.moneyState || character?.inventory?.money || {});
  const total = Math.round(quantity * unit * 100) / 100;
  return `<span>Vermögen: <strong>${escape(formatCopper(wallet))}</strong></span><span>Gesamtpreis: <strong>${escape(formatCopper(total))}</strong></span><span>Danach: <strong>${escape(formatCopper(wallet + (form.kind === 'buy' ? -total : total)))}</strong></span>`;
}

export function collectOperation(form, values) {
  const common = { operationId: form.id };
  if (['buy', 'sell'].includes(form.kind)) {
    const character = form.characters.find(entry => entry.id === values.characterId) || form.character;
    return { ...common, action: form.kind, characterId: character.id, expectedRevision: character.inventory?.revision || 0,
      productId: form.product.id, offerRevision: form.product.revision || 0,
      inventoryItemId: form.kind === 'sell' ? form.item.inventoryItemId : '', quantity: Number(values.quantity), unitCopper: Number(values.unitCopper) };
  }
  if (['customize', 'link-creature'].includes(form.kind)) return { ...common, action: form.kind,
    characterId: form.item.ownerCharacterId, inventoryItemId: form.item.inventoryItemId, expectedRevision: form.item.revision,
    ...(form.kind === 'customize' ? { name: values.name, type: values.type, image: values.image, description: values.description } : {}) };
  const listName = values.listName.trim();
  const existingList = form.snapshot.offers.find(offer => offer.listName.toLocaleLowerCase('de') === listName.toLocaleLowerCase('de'));
  const price = values.minCopper === '' && values.maxCopper === '' ? null : {
    minCopper: localizedNumber(values.minCopper || values.maxCopper), maxCopper: localizedNumber(values.maxCopper || values.minCopper) };
  if (price && (price.minCopper == null || price.maxCopper == null || price.minCopper > price.maxCopper)) throw new Error('Bitte eine gültige Preisspanne angeben.');
  const combatDefinition = values.damageFormula ? { ...form.item.combatDefinition, kind: 'weapon', damageFormula: values.damageFormula, damageType: values.damageType || 'physisch' }
    : values.baseArmorClass !== '' ? { ...form.item.combatDefinition, kind: 'armor', baseArmorClass: Number(values.baseArmorClass) } : null;
  return { ...common, action: 'save-offer', expectedRevision: form.editing ? form.item.revision || 0 : 0,
    offer: { id: form.item.id, title: values.title, templateId: values.templateId, listId: existingList?.listId || `list:${form.id}`, listName,
      category: values.category, type: values.type, image: values.image, description: values.description, details: values.details,
      priceRange: price, stock: values.stock === '' ? null : Number(values.stock), buybackCopper: values.buybackCopper === '' ? null : Number(values.buybackCopper),
      combatDefinition, archived: values.archived === 'on', tags: form.item.tags || [] } };
}
