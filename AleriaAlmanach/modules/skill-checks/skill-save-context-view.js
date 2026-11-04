const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const actions = Object.freeze({ '': 'Unbekannt / kein festgelegter Auslöser', spell: 'Zauber', prayer: 'Gebet', song: 'Magisches Lied', weapon: 'Waffenangriff', technique: 'Waffentechnik' });
const damage = ['', 'Hieb', 'Stich', 'Wucht', 'Feuer', 'Kälte', 'Blitz', 'Donner', 'Säure', 'Gift', 'Nekrotisch', 'Strahlend', 'Psychisch'];
const dangers = Object.freeze({ fear: 'Furcht', poison: 'Vergiftung', bleeding: 'Blutungsfolge', prone: 'Zu Boden werfen', 'forced-movement': 'Erzwungene Bewegung' });

export function renderSkillSaveContext(settings = {}) {
  const context = settings.saveContext || {};
  const options = (entries, current) => entries.map(([id, label]) => `<option value="${escape(id)}"${id === current ? ' selected' : ''}>${escape(label)}</option>`).join('');
  return `<label class="skill-check-save-cause">Auslöser des Rettungswurfs<select data-skill-input="saveActionKind">${options(Object.entries(actions), context.actionKind || '')}</select><small>Wähle die tatsächliche Ursache. Passende bedingte Merkmale werden daraus ermittelt.</small></label><label class="skill-check-save-damage">Schadensart<select data-skill-input="saveDamageType">${options(damage.map(type => [type.toLocaleLowerCase('de'), type || 'Unbekannt / ohne Schaden']), context.damageType || '')}</select></label><fieldset class="skill-check-save-dangers"><legend>Konkrete Gefahr · nur Zutreffendes wählen</legend>${Object.entries(dangers).map(([id, label]) => `<label><input type="checkbox" data-skill-save-tag="${id}"${context.saveTags?.includes(id) ? ' checked' : ''}>${label}</label>`).join('')}</fieldset>`;
}

export function describeSkillSaveContext(receipt = {}) {
  if (receipt.checkType !== 'saving-throw' || !receipt.saveContext) return '';
  const context = receipt.saveContext;
  const type = damage.find(label => label.toLocaleLowerCase('de') === context.damageType);
  return `Auslöser: ${actions[context.actionKind] || actions['']} · Schadensart: ${type || 'Unbekannt / ohne Schaden'}${context.saveTags?.length ? ` · Gefahr: ${context.saveTags.map(tag => dangers[tag]).filter(Boolean).join(', ')}` : ''}`;
}
