import {
  COMBAT_ATTRIBUTE_DEFINITIONS,
  COMBAT_WEAPON_TYPE_OPTIONS,
  getAttributeModifier,
  getCharacterCombatInventoryOptions,
  getSavingThrowTotal,
  getSkillTotal,
  getWeaponAttackModifier,
  getWeaponDamageModifier,
  isTechniqueCompatibleWithWeapon,
  resolveCharacterCombatProfile,
  sanitizeCharacterCombatProfile
} from '../combat/combat-profile-model.js?v=20260808-duncan-v1';
import { openCombatEntryEditor } from '../combat/ui/combat-entry-editor.js?v=20260808-combat-cards-v1';
import {
  createCharacterLevelUpPlan,
  getLevelUpAttributePointAllowance,
  previewCharacterLevelUp
} from '../combat/combat-level-up-model.js?v=20260808-drachentanz-v1';
import { getCombatResourceIconPresentation } from '../combat/combat-resource-icons.js?v=20260803-composer-design-v1';
import {
  getActivationIconSource,
  getCombatEntryIconPresentation,
  getDamageTypeIconSource,
  getRangeIconSource,
  getRollIconSource
} from '../combat/combat-entry-icons.js?v=20260808-combat-cards-v1';
import {
  findSpellSlotResourceId,
  getOrderedSpellSlotResources,
  getSpellLevelLabel,
  getSpellSlotLevel,
  isSpellSlotResource
} from '../combat/combat-spell-slots.js?v=20260803-character-creation-v1';
import { openCharacterCombatSetup } from './character-combat-setup.js?v=20260808-drachentanz-v1';
import {
  synchronizeEquipmentFromCombat,
  synchronizeEquipmentFromInventory
} from '../character-equipment/character-equipment-sync.js?v=20260808-character-storage-audit-v1';

let activeCharacter = null;
let draftProfile = sanitizeCharacterCombatProfile({});
let levelUpState = null;
let levelUpNotice = '';
let setupNotice = '';

function getInventoryDraft() {
  if (typeof globalThis.collectCharacterInventoryProfileData === 'function') {
    return globalThis.collectCharacterInventoryProfileData();
  }
  return activeCharacter?.inventory && typeof activeCharacter.inventory === 'object' ? activeCharacter.inventory : {};
}

function setInventoryDraft(inventory, options = {}) {
  activeCharacter = { ...(activeCharacter || {}), inventory };
  if (typeof globalThis.setCharacterInventoryProfileData === 'function') {
    globalThis.setCharacterInventoryProfileData(inventory, options);
  }
}

function synchronizeDraftFromCombat(options = {}) {
  const result = synchronizeEquipmentFromCombat({
    inventory: options.inventory || getInventoryDraft(),
    combatProfile: draftProfile,
    characterId: activeCharacter?.id || '',
    characterName: activeCharacter?.name || '',
    now: new Date().toISOString()
  });
  draftProfile = sanitizeCharacterCombatProfile(result.combatProfile);
  setInventoryDraft(result.inventory, { render: options.renderInventory === true });
  return result;
}

function synchronizeDraftFromInventory(inventory = getInventoryDraft()) {
  const result = synchronizeEquipmentFromInventory({ inventory, combatProfile: draftProfile });
  draftProfile = sanitizeCharacterCombatProfile(result.combatProfile);
  setInventoryDraft(result.inventory);
  return result;
}

const ATTRIBUTE_OPTIONS = COMBAT_ATTRIBUTE_DEFINITIONS
  .map(attribute => `<option value="${attribute.key}">${attribute.label}</option>`)
  .join('');

function renderSpellLevelOptions(value = 0) {
  return Array.from({ length: 11 }, (_entry, level) => (
    `<option value="${level}"${selected(value, level)}>${escapeMarkup(getSpellLevelLabel(level))}</option>`
  )).join('');
}

function escapeMarkup(value) {
  const node = document.createElement('span');
  node.textContent = String(value ?? '');
  return node.innerHTML;
}

function selected(value, expected) {
  return String(value) === String(expected) ? ' selected' : '';
}

function checked(value) {
  return value ? ' checked' : '';
}

function displayModifier(value) {
  const number = Number(value) || 0;
  return number >= 0 ? `+${number}` : String(number);
}

function createItemId(prefix) {
  return globalThis.crypto?.randomUUID?.() || `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function getAtPath(target, path) {
  return String(path || '').split('.').filter(Boolean).reduce((value, key) => value?.[key], target);
}

function setAtPath(target, path, value) {
  const keys = String(path || '').split('.').filter(Boolean);
  let cursor = target;
  keys.slice(0, -1).forEach(key => {
    if (!cursor[key] || typeof cursor[key] !== 'object') cursor[key] = {};
    cursor = cursor[key];
  });
  if (keys.length) cursor[keys[keys.length - 1]] = value;
}

function inputValue(target) {
  if (target instanceof HTMLInputElement && target.type === 'checkbox') return target.checked;
  return target.value;
}

function renderAttributeOptions(selectedKey) {
  return ATTRIBUTE_OPTIONS.replace(`value="${selectedKey}"`, `value="${selectedKey}" selected`);
}

function renderInventoryOptions(kind) {
  const label = kind === 'weapon' ? 'Inventarwaffe wählen …' : 'Inventarrüstung wählen …';
  const options = getCharacterCombatInventoryOptions(activeCharacter || {}, kind);
  return `<option value="">${label}</option>${options.map(item =>
    `<option value="${escapeMarkup(item.inventoryItemId)}">${escapeMarkup(item.name || 'Unbenannter Gegenstand')}</option>`
  ).join('')}`;
}

function renderResourceIcon(resource = {}) {
  const presentation = getCombatResourceIconPresentation(resource, document.baseURI);
  return `<span class="cp-sheet-resource-icon-frame" data-resource-kind="${escapeMarkup(presentation.kind)}" aria-hidden="true">
    <span class="cp-sheet-resource-icon-fallback">${presentation.fallback}</span>
    ${presentation.source ? `<img class="cp-sheet-resource-icon" src="${escapeMarkup(presentation.source)}" alt="" loading="eager" decoding="async">` : ''}
  </span>`;
}

function activateResourceIconFallbacks(root) {
  root?.querySelectorAll?.('.cp-sheet-resource-icon').forEach(image => {
    const markFailed = () => image.closest('.cp-sheet-resource-icon-frame')?.classList.add('is-missing');
    if (image.complete && image.naturalWidth === 0) markFailed();
    else image.addEventListener('error', markFailed, { once: true });
  });
}

function getSafeImageSource(source, fallback = '') {
  const value = String(source || '').trim();
  const sanitized = typeof globalThis.sanitizeImageSrc === 'function' ? globalThis.sanitizeImageSrc(value) : value;
  return String(sanitized || fallback || '').trim();
}

function renderEntryIcon(kind, item, className = '') {
  const presentation = getCombatEntryIconPresentation(kind, item);
  const fallbackSource = getSafeImageSource(presentation.fallbackSource);
  const source = getSafeImageSource(presentation.source, fallbackSource);
  return `<span class="cp-entry-icon-frame ${escapeMarkup(className)}" aria-hidden="true"><img class="cp-entry-icon" data-combat-entry-icon src="${escapeMarkup(source)}" data-fallback-src="${escapeMarkup(fallbackSource)}" alt="" loading="lazy" decoding="async"></span>`;
}

function renderPropertyIcon(source) {
  return `<span class="cp-card-property-icon" aria-hidden="true"><img data-combat-entry-icon src="${escapeMarkup(getSafeImageSource(source))}" alt="" loading="lazy" decoding="async"></span>`;
}

function activateEntryIconFallbacks(root) {
  root?.querySelectorAll?.('[data-combat-entry-icon]').forEach(image => {
    const useFallback = () => {
      const fallback = String(image.dataset.fallbackSrc || '').trim();
      if (fallback && image.src !== new URL(fallback, document.baseURI).href) {
        image.src = fallback;
        image.removeAttribute('data-fallback-src');
        return;
      }
      image.closest('.cp-entry-icon-frame, .cp-card-property-icon')?.classList.add('is-missing');
    };
    if (image.complete && image.naturalWidth === 0) useFallback();
    else image.addEventListener('error', useFallback);
  });
}

function renderIdentityAndProgression(profile) {
  const portrait = String(activeCharacter?.portrait || '').trim();
  const portraitSource = typeof globalThis.sanitizeImageSrc === 'function' ? globalThis.sanitizeImageSrc(portrait) : portrait;
  const characterName = activeCharacter?.name || 'Unbenannte Figur';
  return `
    <header class="cp-sheet-titlebar">
      <div>
        <span class="cp-sheet-kicker">Aleria · Kampf- &amp; Abenteuerprofil</span>
        <h3>Charakterbogen</h3>
      </div>
      <div class="cp-sheet-title-actions">
        <p>Alle Werte sind frei bearbeitbar, werden online mit der Figur gespeichert und als verbindlicher Kontext an AleriaGPT übergeben.</p>
        <button type="button" data-combat-action="open-character-setup">✦ Starthilfe · Stufe 1</button>
        <button type="button" data-combat-action="open-level-up">✦ Stufenaufstieg</button>
      </div>
    </header>
    ${setupNotice ? `<p class="cp-level-up-notice" role="status">${escapeMarkup(setupNotice)}</p>` : ''}
    ${levelUpNotice ? `<p class="cp-level-up-notice" role="status">${escapeMarkup(levelUpNotice)}</p>` : ''}
    <section class="cp-sheet-card cp-sheet-identity" aria-label="Figur und Fortschritt">
      <div class="cp-sheet-portrait">
        ${portraitSource
          ? `<img src="${escapeMarkup(portraitSource)}" alt="Porträt von ${escapeMarkup(characterName)}">`
          : `<span aria-hidden="true">${escapeMarkup(String(characterName).charAt(0).toUpperCase() || '?')}</span>`}
        <button type="button" data-char-profile-action="switch-tab" data-char-profile-tab="bilder">Porträt ändern</button>
      </div>
      <div class="cp-sheet-identity-fields">
        <label class="wide"><span>Charaktername</span><input value="${escapeMarkup(characterName)}" disabled></label>
        <label><span>Volk / Herkunft</span><input data-combat-path="identity.ancestry" value="${escapeMarkup(profile.identity.ancestry)}" maxlength="100" placeholder="z. B. Halbelf"></label>
        <label><span>Klasse / Archetyp</span><input data-combat-path="identity.archetype" value="${escapeMarkup(profile.identity.archetype)}" maxlength="120" placeholder="z. B. Waldläufer"></label>
        <label><span>Hintergrund</span><input data-combat-path="identity.background" value="${escapeMarkup(profile.identity.background)}" maxlength="120" placeholder="z. B. Volksheld"></label>
      </div>
      <div class="cp-sheet-progression">
        <label><span>Stufe</span><input type="number" min="1" max="20" data-combat-path="progression.level" value="${profile.progression.level}"><small>Normal 1–20</small></label>
        <label><span>Sonderstufen</span><input type="number" min="0" max="10" data-combat-path="progression.specialLevels" value="${profile.progression.specialLevels}"><small>Zusätzlich 0–10</small></label>
        <label><span>Erfahrung</span><input type="number" min="0" max="999999999" data-combat-path="progression.experience" value="${profile.progression.experience}"></label>
        <label><span>Nächste Stufe bei</span><input type="number" min="1" max="999999999" data-combat-path="progression.nextLevelExperience" value="${profile.progression.nextLevelExperience ?? ''}" placeholder="frei"></label>
        <label><span>EP-Wert bei Niederlage</span><input type="number" min="0" max="999999999" data-combat-path="progression.experienceReward" value="${profile.progression.experienceReward ?? ''}" placeholder="automatisch nach Stufe"></label>
        <label><span>Kompetenz überschreiben</span><input type="number" min="-20" max="30" data-combat-path="progression.proficiencyBonusOverride" value="${profile.progression.proficiencyBonusOverride ?? ''}" placeholder="automatisch"></label>
        <div class="cp-sheet-level-seal"><span>Gesamtstufe</span><strong data-combat-derived="effective-level">1</strong><small>Kompetenz <b data-combat-derived="proficiency">+2</b></small></div>
      </div>
    </section>`;
}

function renderLevelUpChanges(preview) {
  if (!preview.ready) {
    return `<div class="cp-level-up-error" role="alert">${preview.errors.map(error => `<p>${escapeMarkup(error)}</p>`).join('')}</div>`;
  }
  return `<div class="cp-level-up-preview-stats">
      <span><small>Gesamtstufe</small><strong>${preview.before.level} → ${preview.after.level}</strong></span>
      <span><small>TP-Maximum</small><strong>${preview.before.maximumHitPoints} → ${preview.after.maximumHitPoints}</strong></span>
      <span><small>Kompetenz</small><strong>${displayModifier(preview.before.proficiencyBonus)} → ${displayModifier(preview.after.proficiencyBonus)}</strong></span>
    </div>
    <ul>${preview.changes.map(change => `<li><span>${escapeMarkup(change.label)}</span><strong>${escapeMarkup(change.before)} → ${escapeMarkup(change.after)}</strong></li>`).join('')}</ul>`;
}

function renderLevelUpDialog(profile) {
  if (!levelUpState) return '';
  const preview = previewCharacterLevelUp(profile, levelUpState.plan);
  const plan = preview.plan;
  const attributePointAllowance = getLevelUpAttributePointAllowance(profile);
  const allocatedAttributePoints = Object.values(plan.attributeIncreases)
    .reduce((sum, value) => sum + Math.max(0, Number(value) || 0), 0);
  const remainingAttributePoints = attributePointAllowance - allocatedAttributePoints;
  return `<div class="cp-level-up-backdrop" data-level-up-role="backdrop">
    <section class="cp-level-up-dialog" role="dialog" aria-modal="true" aria-labelledby="cp-level-up-title">
      <header>
        <div><span>Geführte Entwicklung</span><h3 id="cp-level-up-title">Stufenaufstieg</h3></div>
        <button type="button" class="cp-level-up-close" data-combat-action="close-level-up" aria-label="Stufenaufstieg schließen">×</button>
      </header>
      <div class="cp-level-up-body">
        <section class="cp-level-up-section cp-level-up-intro">
          <div><small>Aktuell</small><strong>Stufe ${preview.before?.level ?? 30}</strong></div>
          <span aria-hidden="true">→</span>
          <div><small>Danach</small><strong>${preview.after ? (preview.after.levelKind === 'special' ? `Gesamt ${preview.after.level} · Sonder ${preview.after.specialLevels}` : `Stufe ${preview.after.level}`) : 'Maximum erreicht'}</strong></div>
          <p>Der Vorgang ändert zunächst nur den Entwurf. Dauerhaft wird er erst über <b>Figur speichern</b>.</p>
        </section>

        <section class="cp-level-up-section">
          <div class="cp-level-up-section-head"><div><span>Fortschritt</span><h4>Erfahrung &amp; Trefferpunkte</h4></div><small>TP werden vor dem Anwenden vollständig vorgerechnet.</small></div>
          <div class="cp-level-up-fields">
            <label><span>Erfahrung nach Aufstieg</span><input type="number" min="0" max="999999999" data-level-up-path="experience" value="${plan.experience}"></label>
            <label><span>Nächste Stufe bei</span><input type="number" min="1" max="999999999" data-level-up-path="nextLevelExperience" value="${plan.nextLevelExperience ?? ''}" placeholder="frei"></label>
            <label><span>TP-Regel</span><select data-level-up-path="hitPointMode"><option value="recommended"${selected(plan.hitPointMode, 'recommended')}>Empfohlene Ableitung</option><option value="manual"${selected(plan.hitPointMode, 'manual')}>Manueller Zuwachs</option><option value="unchanged"${selected(plan.hitPointMode, 'unchanged')}>Maximum beibehalten</option></select></label>
            <label><span>Manueller TP-Zuwachs</span><input type="number" min="0" max="9999" data-level-up-path="manualHitPointGain" value="${plan.manualHitPointGain}"><small>Nur bei manueller Regel</small></label>
            <label class="cp-level-up-check"><input type="checkbox" data-level-up-path="restoreGainedHitPoints"${checked(plan.restoreGainedHitPoints)}> Aktuelle TP um den tatsächlichen Maximalzuwachs erhöhen</label>
          </div>
        </section>

        <section class="cp-level-up-section">
          <div class="cp-level-up-section-head"><div><span>Freie Steigerung</span><h4>Attribute</h4></div><small>${attributePointAllowance ? `${attributePointAllowance} Punkte frei verteilen · ${remainingAttributePoints} übrig` : 'Auf dieser Stufe keine Attributspunkte'}</small></div>
          <div class="cp-level-up-attributes">${profile.attributes.map(attribute => `<label><span>${escapeMarkup(attribute.label)} <b>${attribute.score}</b></span><input type="number" min="0" max="${attributePointAllowance}" data-level-up-attribute="${attribute.key}" value="${plan.attributeIncreases[attribute.key]}"${attributePointAllowance ? '' : ' disabled'}><small>+ Punkte</small></label>`).join('')}</div>
        </section>

        ${profile.resources.length ? `<section class="cp-level-up-section">
          <div class="cp-level-up-section-head"><div><span>Kernressourcen</span><h4>Vorräte steigern</h4></div><small>Aktuell und Maximum können getrennt wachsen.</small></div>
          <div class="cp-level-up-resources">${profile.resources.filter(resource => !isSpellSlotResource(resource, profile.magic.slotResourceIds)).map(resource => `<div><strong>${escapeMarkup(resource.name)}</strong><small>${resource.current} / ${resource.maximum}</small><label>Aktuell +<input type="number" min="-9999" max="9999" data-level-up-resource="${escapeMarkup(resource.id)}" data-level-up-resource-property="current" value="${plan.resourceIncreases[resource.id]?.current ?? 0}"></label><label>Maximum +<input type="number" min="-9999" max="9999" data-level-up-resource="${escapeMarkup(resource.id)}" data-level-up-resource-property="maximum" value="${plan.resourceIncreases[resource.id]?.maximum ?? 0}"></label></div>`).join('')}</div>
        </section>` : ''}

        <section class="cp-level-up-section">
          <div class="cp-level-up-section-head"><div><span>Optional</span><h4>Neue Freischaltungen</h4></div><small>Leere Namen werden ignoriert.</small></div>
          <div class="cp-level-up-unlocks">
            <details><summary>Neue Fertigkeit</summary><div class="cp-level-up-fields">
              <label><span>Name</span><input data-level-up-path="newSkill.name" value="${escapeMarkup(plan.newSkill.name)}" maxlength="100" placeholder="z. B. Fallen entschärfen"></label>
              <label><span>Attribut</span><select data-level-up-path="newSkill.attributeKey">${renderAttributeOptions(plan.newSkill.attributeKey)}</select></label>
              <label><span>Kompetenz</span><select data-level-up-path="newSkill.proficiency"><option value="none"${selected(plan.newSkill.proficiency, 'none')}>Keine</option><option value="trained"${selected(plan.newSkill.proficiency, 'trained')}>Trainiert</option><option value="expertise"${selected(plan.newSkill.proficiency, 'expertise')}>Expertise</option></select></label>
              <label><span>Bonus</span><input type="number" min="-99" max="99" data-level-up-path="newSkill.bonus" value="${plan.newSkill.bonus}"></label>
              <label class="wide"><span>Notizen</span><input data-level-up-path="newSkill.notes" value="${escapeMarkup(plan.newSkill.notes)}" maxlength="500"></label>
            </div></details>
            <details><summary>Neue besondere Fähigkeit</summary><div class="cp-level-up-fields">
              <label><span>Name</span><input data-level-up-path="newAbility.name" value="${escapeMarkup(plan.newAbility.name)}" maxlength="120"></label>
              <label><span>Nutzungen</span><input type="number" min="0" max="999" data-level-up-path="newAbility.usesMaximum" value="${plan.newAbility.usesMaximum}"></label>
              <label><span>Erholung</span><select data-level-up-path="newAbility.recovery"><option value="none"${selected(plan.newAbility.recovery, 'none')}>Keine</option><option value="short-rest"${selected(plan.newAbility.recovery, 'short-rest')}>Kurze Rast</option><option value="long-rest"${selected(plan.newAbility.recovery, 'long-rest')}>Lange Rast</option><option value="scene"${selected(plan.newAbility.recovery, 'scene')}>Szene</option><option value="day"${selected(plan.newAbility.recovery, 'day')}>Tag</option><option value="manual"${selected(plan.newAbility.recovery, 'manual')}>Manuell</option></select></label>
              <label><span>Würfelformel</span><input data-level-up-path="newAbility.rollFormula" value="${escapeMarkup(plan.newAbility.rollFormula.toUpperCase().replace(/D/g, 'W'))}" maxlength="40"></label>
              <label class="wide"><span>Beschreibung</span><textarea data-level-up-path="newAbility.description" maxlength="1600">${escapeMarkup(plan.newAbility.description)}</textarea></label>
            </div></details>
            <details><summary>Neuer Zauber</summary><div class="cp-level-up-fields">
              <label><span>Name</span><input data-level-up-path="newSpell.name" value="${escapeMarkup(plan.newSpell.name)}" maxlength="120"></label>
              <label><span>Zaubergrad</span><select data-level-up-path="newSpell.level">${renderSpellLevelOptions(plan.newSpell.level)}</select></label>
              <label><span>Manakosten</span><input type="number" min="0" max="999" data-level-up-path="newSpell.manaCost" value="${plan.newSpell.manaCost}"></label>
              <label><span>Würfelformel</span><input data-level-up-path="newSpell.rollFormula" value="${escapeMarkup(plan.newSpell.rollFormula.toUpperCase().replace(/D/g, 'W'))}" maxlength="40"></label>
              <label class="cp-level-up-check"><input type="checkbox" data-level-up-path="newSpell.prepared"${checked(plan.newSpell.prepared)}> Sofort vorbereitet</label>
              <label class="wide"><span>Beschreibung</span><textarea data-level-up-path="newSpell.description" maxlength="1600">${escapeMarkup(plan.newSpell.description)}</textarea></label>
            </div></details>
          </div>
        </section>

        <section class="cp-level-up-section cp-level-up-preview" aria-live="polite">
          <div class="cp-level-up-section-head"><div><span>Kontrolle vor Anwendung</span><h4>Vorschau</h4></div></div>
          <div data-level-up-role="preview">${renderLevelUpChanges(preview)}</div>
        </section>
      </div>
      <footer><button type="button" data-combat-action="close-level-up">Abbrechen</button><button type="button" class="primary" data-combat-action="apply-level-up"${preview.ready ? '' : ' disabled'}>Auf Entwurf anwenden</button></footer>
    </section>
  </div>`;
}

function renderAttributeRadar(profile) {
  return `
    <section class="cp-sheet-card cp-sheet-attributes" aria-labelledby="cp-sheet-attributes-title">
      <div class="cp-sheet-section-head"><div><span>Grundlagen</span><h4 id="cp-sheet-attributes-title">Attribute</h4></div><small>Wert 10 entspricht Modifikator +0</small></div>
      <div class="cp-sheet-attribute-layout">
        <div class="cp-sheet-radar-wrap">
          <svg class="cp-sheet-radar" viewBox="0 0 260 250" role="img" aria-label="Diagramm der sechs Attribute">
            <g class="cp-sheet-radar-grid" aria-hidden="true">
              <polygon points="130,20 229,77 229,173 130,230 31,173 31,77"></polygon>
              <polygon points="130,55 196,93 196,157 130,195 64,157 64,93"></polygon>
              <polygon points="130,90 163,109 163,141 130,160 97,141 97,109"></polygon>
              <path d="M130 20V230M31 77L229 173M229 77L31 173"></path>
            </g>
            <polygon class="cp-sheet-radar-value" data-combat-radar-polygon points="130,125 130,125 130,125 130,125 130,125 130,125"></polygon>
            <g class="cp-sheet-radar-labels">
              <text x="130" y="12" text-anchor="middle" data-combat-radar-label="strength">KRF</text>
              <text x="244" y="75" text-anchor="middle" data-combat-radar-label="dexterity">GES</text>
              <text x="244" y="186" text-anchor="middle" data-combat-radar-label="constitution">KON</text>
              <text x="130" y="247" text-anchor="middle" data-combat-radar-label="intelligence">INT</text>
              <text x="16" y="186" text-anchor="middle" data-combat-radar-label="wisdom">WEI</text>
              <text x="16" y="75" text-anchor="middle" data-combat-radar-label="charisma">CHA</text>
            </g>
          </svg>
          <p>Das Netz zeigt die Werte relativ zur frei nutzbaren Skala 1–30.</p>
        </div>
        <div class="cp-sheet-attribute-grid">
          ${profile.attributes.map(attribute => `
            <article class="cp-sheet-attribute">
              <input class="cp-sheet-attribute-name" data-combat-collection="attributes" data-combat-item-id="${attribute.key}" data-combat-property="label" value="${escapeMarkup(attribute.label)}" maxlength="40" aria-label="Attributname">
              <input class="cp-sheet-attribute-score" type="number" min="1" max="40" data-combat-collection="attributes" data-combat-item-id="${attribute.key}" data-combat-property="score" value="${attribute.score}" aria-label="${escapeMarkup(attribute.label)} Wert">
              <strong data-combat-attribute-modifier="${attribute.key}">${displayModifier(getAttributeModifier(attribute))}</strong>
              <label>Kürzel<input data-combat-collection="attributes" data-combat-item-id="${attribute.key}" data-combat-property="shortLabel" value="${escapeMarkup(attribute.shortLabel)}" maxlength="8"></label>
              <label>Mod. frei<input type="number" min="-20" max="20" data-combat-collection="attributes" data-combat-item-id="${attribute.key}" data-combat-property="modifierOverride" value="${attribute.modifierOverride ?? ''}" placeholder="auto"></label>
            </article>`).join('')}
        </div>
      </div>
    </section>`;
}

function renderDerivedStats(profile) {
  return `
    <section class="cp-sheet-derived" aria-label="Abgeleitete Kampfwerte">
      <article><span>TP aktuell</span><strong><input type="number" min="0" max="9999" data-combat-path="hitPoints.current" value="${profile.hitPoints.current ?? ''}" placeholder="—"> <i>/</i> <b data-combat-derived="maximum-hit-points">—</b></strong><small>Temporär <input type="number" min="0" max="9999" data-combat-path="hitPoints.temporary" value="${profile.hitPoints.temporary}"></small></article>
      <article><span>Rüstungsklasse</span><strong data-combat-derived="armor-class">10</strong><small>Rüstung + Geschick + Effekte</small></article>
      <article><span>Initiative</span><strong data-combat-derived="initiative">+0</strong><small>Geschick + Modifikatoren</small></article>
      <article><span>Bewegung</span><strong><input type="number" min="0" max="999" data-combat-path="combat.movement" value="${profile.combat.movement}"> m</strong><small>Pro Runde</small></article>
      <article><span>Kompetenz</span><strong data-combat-derived="proficiency">+2</strong><small>Stufe 1–30</small></article>
      <article><span>Passive Wahrnehmung</span><strong data-combat-derived="passive-perception">10</strong><small>10 + Wahrnehmungs-Fertigkeit</small></article>
    </section>`;
}

function renderRules(profile) {
  return `
    <section class="cp-sheet-grid cp-sheet-grid-two">
      <article class="cp-sheet-card">
        <div class="cp-sheet-section-head"><div><span>D&amp;D-inspirierte Ableitung</span><h4>Trefferpunkte</h4></div></div>
        <div class="cp-sheet-fields compact">
          <label><span>Trefferwürfel</span><select data-combat-path="hitPoints.hitDie"><option value="6"${selected(profile.hitPoints.hitDie, 6)}>W6</option><option value="8"${selected(profile.hitPoints.hitDie, 8)}>W8</option><option value="10"${selected(profile.hitPoints.hitDie, 10)}>W10</option><option value="12"${selected(profile.hitPoints.hitDie, 12)}>W12</option></select></label>
          <label><span>TP je Folgestufe</span><input type="number" min="1" max="999" data-combat-path="hitPoints.averagePerLevelOverride" value="${profile.hitPoints.averagePerLevelOverride ?? ''}" placeholder="Würfelmittel"></label>
          <label><span>Maximum überschreiben</span><input type="number" min="1" max="9999" data-combat-path="hitPoints.maximumOverride" value="${profile.hitPoints.maximumOverride ?? ''}" placeholder="automatisch"></label>
        </div>
        <p class="cp-sheet-formula">Stufe 1: voller Trefferwürfel + KON. Weitere Stufen: Würfelmittel + KON, mindestens 1 TP je Stufe.</p>
      </article>
      <article class="cp-sheet-card">
        <div class="cp-sheet-section-head"><div><span>Rüstung + Geschick + Effekte</span><h4>Rüstungsklasse</h4></div></div>
        <div class="cp-sheet-fields compact">
          <label><span>Grund-RK</span><input type="number" min="0" max="99" data-combat-path="armorClass.base" value="${profile.armorClass.base}"></label>
          <label><span>Geschick</span><select data-combat-path="armorClass.dexterityMode"><option value="full"${selected(profile.armorClass.dexterityMode, 'full')}>Voll</option><option value="capped"${selected(profile.armorClass.dexterityMode, 'capped')}>Begrenzt</option><option value="none"${selected(profile.armorClass.dexterityMode, 'none')}>Nicht</option></select></label>
          <label><span>GES-Limit</span><input type="number" min="-20" max="20" data-combat-path="armorClass.dexterityCap" value="${profile.armorClass.dexterityCap}"></label>
          <label><span>Schildbonus</span><input type="number" min="-99" max="99" data-combat-path="armorClass.shieldBonus" value="${profile.armorClass.shieldBonus}"></label>
          <label><span>Magisch</span><input type="number" min="-99" max="99" data-combat-path="armorClass.magicModifier" value="${profile.armorClass.magicModifier}"></label>
          <label><span>Sonstiges</span><input type="number" min="-99" max="99" data-combat-path="armorClass.otherModifier" value="${profile.armorClass.otherModifier}"></label>
          <label><span>RK überschreiben</span><input type="number" min="0" max="999" data-combat-path="armorClass.override" value="${profile.armorClass.override ?? ''}" placeholder="automatisch"></label>
          <label><span>Override-Art</span><select data-combat-path="armorClass.overrideMode"><option value="base"${selected(profile.armorClass.overrideMode, 'base')}>Als Basis + alle Boni</option><option value="total"${selected(profile.armorClass.overrideMode, 'total')}>Fester Endwert</option></select></label>
          <label><span>Initiative extra</span><input type="number" min="-99" max="99" data-combat-path="combat.initiativeBonus" value="${profile.combat.initiativeBonus}"></label>
          <label><span>Angriff global</span><input type="number" min="-99" max="99" data-combat-path="combat.attackBonus" value="${profile.combat.attackBonus}"></label>
          <label><span>Schaden global</span><input type="number" min="-99" max="99" data-combat-path="combat.damageBonus" value="${profile.combat.damageBonus}"></label>
          <label><span>Passive Wahrnehmung extra</span><input type="number" min="-99" max="99" data-combat-path="combat.passivePerceptionBonus" value="${profile.combat.passivePerceptionBonus}"></label>
          <label class="check wide"><input type="checkbox" data-combat-path="combat.canActAtZeroHitPoints"${checked(profile.combat.canActAtZeroHitPoints)}> Sonderregel: Die Figur kann bei 0 TP handeln</label>
        </div>
      </article>
    </section>`;
}

function renderSavingThrows(profile) {
  return `<section class="cp-sheet-saving-throws">
    <div class="cp-sheet-section-head"><div><span>Attribut + Kompetenz</span><h4>Rettungswürfe</h4></div></div>
    <div class="cp-sheet-save-list">${profile.savingThrows.map(save => {
      const definition = profile.attributes.find(attribute => attribute.key === save.attributeKey);
      return `<div>
        <strong data-combat-save-total="${save.attributeKey}">${displayModifier(getSavingThrowTotal(profile, save.attributeKey))}</strong>
        <span>${escapeMarkup(definition?.label || save.attributeKey)}</span>
        <label title="Trainiert"><input type="checkbox" data-combat-collection="savingThrows" data-combat-item-id="${save.attributeKey}" data-combat-property="proficient"${checked(save.proficient)}> K</label>
        <label title="Expertise"><input type="checkbox" data-combat-collection="savingThrows" data-combat-item-id="${save.attributeKey}" data-combat-property="expertise"${checked(save.expertise)}> E</label>
        <input type="number" min="-99" max="99" data-combat-collection="savingThrows" data-combat-item-id="${save.attributeKey}" data-combat-property="bonus" value="${save.bonus}" aria-label="Freier Bonus">
      </div>`;
    }).join('')}</div>
  </section>`;
}

function renderProficiencies(profile) {
  const groups = [
    ['Rüstungen', profile.proficiencies.armor],
    ['Waffen', profile.proficiencies.weapons],
    ['Werkzeuge & Ausbildung', profile.proficiencies.tools],
    ['Sprachen', profile.proficiencies.languages]
  ];
  return `<section class="cp-sheet-card cp-sheet-proficiencies">
    <div class="cp-sheet-section-head"><div><span>Aus Herkunft, Hintergrund und Klasse</span><h4>Ausbildungen &amp; Kenntnisse</h4></div></div>
    <div class="cp-sheet-proficiency-grid">${groups.map(([label, values]) => `<article><span>${escapeMarkup(label)}</span><strong>${escapeMarkup(values.join(', ') || 'Keine eingetragen')}</strong></article>`).join('')}</div>
    ${profile.proficiencies.notes ? `<p>${escapeMarkup(profile.proficiencies.notes)}</p>` : ''}
  </section>`;
}

function renderSkills(profile) {
  return `<article class="cp-sheet-card cp-sheet-skills">
    <div class="cp-sheet-section-head"><div><span>Frei ergänzbar</span><h4>Fertigkeiten</h4></div><button type="button" data-combat-action="add-item" data-combat-collection="skills">+ Fertigkeit</button></div>
    <div class="cp-sheet-table" role="table">
      <div class="cp-sheet-table-head" role="row"><span>Gesamt</span><span>Fertigkeit</span><span>Attribut</span><span>Kompetenz</span><span>Bonus</span><span></span></div>
      ${profile.skills.map(skill => `<div class="cp-sheet-table-row" role="row">
        <strong data-combat-skill-total="${escapeMarkup(skill.id)}">${displayModifier(getSkillTotal(profile, skill))}</strong>
        <div class="cp-sheet-skill-identity"><input data-combat-collection="skills" data-combat-item-id="${escapeMarkup(skill.id)}" data-combat-property="name" value="${escapeMarkup(skill.name)}" maxlength="100" aria-label="Fertigkeit"><input data-combat-collection="skills" data-combat-item-id="${escapeMarkup(skill.id)}" data-combat-property="notes" value="${escapeMarkup(skill.notes)}" maxlength="500" placeholder="Notiz / Besonderheit" aria-label="Fertigkeitsnotiz"></div>
        <select data-combat-collection="skills" data-combat-item-id="${escapeMarkup(skill.id)}" data-combat-property="attributeKey" aria-label="Attribut">${renderAttributeOptions(skill.attributeKey)}</select>
        <select data-combat-collection="skills" data-combat-item-id="${escapeMarkup(skill.id)}" data-combat-property="proficiency" aria-label="Kompetenz"><option value="none"${selected(skill.proficiency, 'none')}>Keine</option><option value="trained"${selected(skill.proficiency, 'trained')}>Trainiert</option><option value="expertise"${selected(skill.proficiency, 'expertise')}>Expertise</option></select>
        <input type="number" min="-99" max="99" data-combat-collection="skills" data-combat-item-id="${escapeMarkup(skill.id)}" data-combat-property="bonus" value="${skill.bonus}" aria-label="Freier Bonus">
        <button type="button" class="cp-sheet-remove" data-combat-action="remove-item" data-combat-collection="skills" data-combat-item-id="${escapeMarkup(skill.id)}" aria-label="Fertigkeit entfernen">×</button>
      </div>`).join('')}
    </div>
  </article>`;
}

function renderResourceRows(resources = []) {
  return resources.map(resource => `<div class="${resource.scope === 'comment' ? 'comment-resource' : ''}">
      <div class="cp-sheet-resource-identity">${renderResourceIcon(resource)}<input class="name" data-combat-collection="resources" data-combat-item-id="${escapeMarkup(resource.id)}" data-combat-property="name" value="${escapeMarkup(resource.name)}" maxlength="100" aria-label="Ressource"></div>
      <label><span>Aktuell</span><input type="number" min="-9999" max="9999" data-combat-collection="resources" data-combat-item-id="${escapeMarkup(resource.id)}" data-combat-property="current" value="${resource.current}"></label>
      <label><span>Maximum</span><input type="number" min="0" max="9999" data-combat-collection="resources" data-combat-item-id="${escapeMarkup(resource.id)}" data-combat-property="maximum" value="${resource.maximum}"></label>
      <select data-combat-collection="resources" data-combat-item-id="${escapeMarkup(resource.id)}" data-combat-property="recovery" aria-label="Erholung"><option value="manual"${selected(resource.recovery, 'manual')}>Manuell</option><option value="short-rest"${selected(resource.recovery, 'short-rest')}>Kurze Rast</option><option value="long-rest"${selected(resource.recovery, 'long-rest')}>Lange Rast</option><option value="scene"${selected(resource.recovery, 'scene')}>Kommentar / Szene</option><option value="day"${selected(resource.recovery, 'day')}>Tag</option><option value="none"${selected(resource.recovery, 'none')}>Keine</option></select>
      <button type="button" class="cp-sheet-remove" data-combat-action="remove-item" data-combat-collection="resources" data-combat-item-id="${escapeMarkup(resource.id)}" aria-label="Ressource entfernen">×</button>
      <input class="cp-sheet-resource-notes" data-combat-collection="resources" data-combat-item-id="${escapeMarkup(resource.id)}" data-combat-property="notes" value="${escapeMarkup(resource.notes)}" maxlength="500" placeholder="Regeln, Grenzen oder Besonderheiten dieser Ressource"><small>${resource.scope === 'comment' ? 'Wird pro Gesamtkommentar aufgefüllt.' : (resource.recovery === 'day' ? 'Bleibt erhalten und wird erst am nächsten Aleria-Tag aufgefüllt.' : 'Bleibt zwischen Kommentaren erhalten.')}</small>
    </div>`).join('');
}

function renderResources(profile) {
  const actionIds = new Set(['action', 'bonus-action', 'reaction', 'special-action', 'aura-focus']);
  const coreResources = profile.resources.filter(resource => !isSpellSlotResource(resource, profile.magic.slotResourceIds));
  const actionResources = coreResources.filter(resource => actionIds.has(resource.id));
  const persistentResources = coreResources.filter(resource => !actionIds.has(resource.id));
  return `<article class="cp-sheet-card cp-sheet-resources">
    <div class="cp-sheet-section-head"><div><span>Verbrauch, Bezahlung &amp; Erholung</span><h4>Aktionsökonomie &amp; Kernressourcen</h4></div><button type="button" data-combat-action="add-item" data-combat-collection="resources">+ Ressource</button></div>
    <div class="cp-sheet-resource-group"><div class="cp-sheet-subhead"><div><strong>Aktionsökonomie</strong><small>Aktion, Bonusaktion und Reaktion gelten pro Gesamtkommentar; Aura kann ein vollständiges Kostenpaket ersetzen.</small></div></div><div class="cp-sheet-resource-list">${renderResourceRows(actionResources)}</div></div>
    <div class="cp-sheet-resource-group"><div class="cp-sheet-subhead"><div><strong>Kernressourcen</strong><small>Persistente Vorräte werden nur nach ihrer eingetragenen Erholungsregel aufgefüllt.</small></div></div><div class="cp-sheet-resource-list">${renderResourceRows(persistentResources)}</div></div>
    ${renderSavingThrows(profile)}
  </article>`;
}

function renderWeapons(profile) {
  return `<section class="cp-sheet-card">
    <div class="cp-sheet-section-head"><div><span>Inventar als Vorlage · danach frei</span><h4>Waffen</h4></div><div class="cp-sheet-head-actions"><select data-combat-inventory-picker="weapon">${renderInventoryOptions('weapon')}</select><button type="button" data-combat-action="copy-inventory" data-combat-kind="weapon">Übernehmen</button><button type="button" data-combat-action="add-item" data-combat-collection="weapons">+ Waffe</button></div></div>
    <div class="cp-sheet-item-list">${profile.weapons.length ? profile.weapons.map(weapon => `<article class="cp-sheet-item ${weapon.equipped ? 'equipped' : ''}">
      <div class="cp-sheet-item-title"><label class="cp-sheet-equipped"><input type="radio" name="cp-equipped-weapon" data-combat-action="equip-weapon" data-combat-item-id="${escapeMarkup(weapon.id)}"${checked(weapon.equipped)}> aktiv</label><input data-combat-collection="weapons" data-combat-item-id="${escapeMarkup(weapon.id)}" data-combat-property="name" value="${escapeMarkup(weapon.name)}" maxlength="120" placeholder="Waffenname">${weapon.inventoryItemId ? '<span class="cp-sheet-equipment-link">Inventar verknüpft</span>' : '<span class="cp-sheet-equipment-link is-system">Grundangriff</span>'}<button type="button" data-combat-action="edit-action-rules" data-combat-collection="weapons" data-combat-item-id="${escapeMarkup(weapon.id)}" data-combat-entry-kind="weapon">Einsatz &amp; Kosten</button><button type="button" class="cp-sheet-remove" data-combat-action="remove-item" data-combat-collection="weapons" data-combat-item-id="${escapeMarkup(weapon.id)}">×</button></div>
      <div class="cp-sheet-fields weapon">
        <label><span>Schadenswurf</span><input data-combat-collection="weapons" data-combat-item-id="${escapeMarkup(weapon.id)}" data-combat-property="damageFormula" value="${escapeMarkup(weapon.damageFormula.toUpperCase().replace(/D/g, 'W'))}" maxlength="40" placeholder="1W8"></label>
        <label><span>Zweihändig / vielseitig</span><input data-combat-collection="weapons" data-combat-item-id="${escapeMarkup(weapon.id)}" data-combat-property="versatileDamageFormula" value="${escapeMarkup(String(weapon.versatileDamageFormula || '').toUpperCase().replace(/D/g, 'W'))}" maxlength="40" placeholder="z. B. 1W10"></label>
        <label><span>Schadensart</span><input data-combat-collection="weapons" data-combat-item-id="${escapeMarkup(weapon.id)}" data-combat-property="damageType" value="${escapeMarkup(weapon.damageType)}" maxlength="80"></label>
        <label><span>Waffenart</span><select data-combat-collection="weapons" data-combat-item-id="${escapeMarkup(weapon.id)}" data-combat-property="weaponType">${COMBAT_WEAPON_TYPE_OPTIONS.map(option => `<option value="${option.id}"${selected(weapon.weaponType, option.id)}>${option.label}</option>`).join('')}</select></label>
        <label><span>Ausbildung</span><select data-combat-collection="weapons" data-combat-item-id="${escapeMarkup(weapon.id)}" data-combat-property="training"><option value="simple"${selected(weapon.training, 'simple')}>Schlicht / simpel</option><option value="martial"${selected(weapon.training, 'martial')}>Kriegerisch</option><option value="special"${selected(weapon.training, 'special')}>Besonders</option></select></label>
        <label><span>Attribut</span><select data-combat-collection="weapons" data-combat-item-id="${escapeMarkup(weapon.id)}" data-combat-property="attackAttribute">${renderAttributeOptions(weapon.attackAttribute)}</select></label>
        <label><span>Reichweite</span><input data-combat-collection="weapons" data-combat-item-id="${escapeMarkup(weapon.id)}" data-combat-property="range" value="${escapeMarkup(weapon.range)}" maxlength="80"></label>
        <label><span>Angriff extra</span><input type="number" min="-99" max="99" data-combat-collection="weapons" data-combat-item-id="${escapeMarkup(weapon.id)}" data-combat-property="attackBonus" value="${weapon.attackBonus}"></label>
        <label><span>Schaden extra</span><input type="number" min="-99" max="99" data-combat-collection="weapons" data-combat-item-id="${escapeMarkup(weapon.id)}" data-combat-property="damageBonus" value="${weapon.damageBonus}"></label>
        <label class="check"><input type="checkbox" data-combat-collection="weapons" data-combat-item-id="${escapeMarkup(weapon.id)}" data-combat-property="proficient"${checked(weapon.proficient)}> Geübt</label>
        <label class="wide"><span>Eigenschaften</span><input data-combat-collection="weapons" data-combat-item-id="${escapeMarkup(weapon.id)}" data-combat-property="properties" value="${escapeMarkup(weapon.properties)}" maxlength="500"></label>
        <label class="wide"><span>Notizen / besondere Regeln</span><textarea data-combat-collection="weapons" data-combat-item-id="${escapeMarkup(weapon.id)}" data-combat-property="notes" maxlength="800">${escapeMarkup(weapon.notes)}</textarea></label>
      </div>
      <div class="cp-sheet-item-derived">Angriff <strong data-combat-weapon-attack="${escapeMarkup(weapon.id)}">${displayModifier(getWeaponAttackModifier(profile, weapon))}</strong> · Schaden <strong data-combat-weapon-damage="${escapeMarkup(weapon.id)}">${displayModifier(getWeaponDamageModifier(profile, weapon))}</strong></div>
    </article>`).join('') : '<p class="cp-sheet-empty">Noch keine Waffe. Manuell hinzufügen oder aus dem Inventar übernehmen.</p>'}</div>
  </section>`;
}

function renderArmor(profile) {
  return `<section class="cp-sheet-card">
    <div class="cp-sheet-section-head"><div><span>Mehrere Schutzquellen kombinierbar</span><h4>Rüstung &amp; Schutz</h4></div><div class="cp-sheet-head-actions"><select data-combat-inventory-picker="armor">${renderInventoryOptions('armor')}</select><button type="button" data-combat-action="copy-inventory" data-combat-kind="armor">Übernehmen</button><button type="button" data-combat-action="add-item" data-combat-collection="armorItems">+ Schutz</button></div></div>
    <div class="cp-sheet-item-list">${profile.armorItems.length ? profile.armorItems.map(armor => `<article class="cp-sheet-item ${armor.equipped ? 'equipped' : ''}">
      <div class="cp-sheet-item-title"><label class="cp-sheet-equipped"><input type="checkbox" data-combat-collection="armorItems" data-combat-item-id="${escapeMarkup(armor.id)}" data-combat-property="equipped"${checked(armor.equipped)}> angelegt</label><input data-combat-collection="armorItems" data-combat-item-id="${escapeMarkup(armor.id)}" data-combat-property="name" value="${escapeMarkup(armor.name)}" maxlength="120" placeholder="Rüstung / Schild / Schutz">${armor.inventoryItemId ? '<span class="cp-sheet-equipment-link">Inventar verknüpft</span>' : ''}<button type="button" class="cp-sheet-remove" data-combat-action="remove-item" data-combat-collection="armorItems" data-combat-item-id="${escapeMarkup(armor.id)}">×</button></div>
      <div class="cp-sheet-fields armor">
        <label><span>Art</span><select data-combat-collection="armorItems" data-combat-item-id="${escapeMarkup(armor.id)}" data-combat-property="kind"><option value="armor"${selected(armor.kind, 'armor')}>Rüstung</option><option value="shield"${selected(armor.kind, 'shield')}>Schild</option><option value="ward"${selected(armor.kind, 'ward')}>Schutz / Magie</option></select></label>
        <label><span>Basis-RK</span><input type="number" min="0" max="99" data-combat-collection="armorItems" data-combat-item-id="${escapeMarkup(armor.id)}" data-combat-property="baseArmorClass" value="${armor.baseArmorClass ?? ''}" placeholder="keine"></label>
        <label><span>RK-Bonus</span><input type="number" min="-99" max="99" data-combat-collection="armorItems" data-combat-item-id="${escapeMarkup(armor.id)}" data-combat-property="armorClassBonus" value="${armor.armorClassBonus}"></label>
        <label><span>Geschick</span><select data-combat-collection="armorItems" data-combat-item-id="${escapeMarkup(armor.id)}" data-combat-property="dexterityMode"><option value="full"${selected(armor.dexterityMode, 'full')}>Voll</option><option value="capped"${selected(armor.dexterityMode, 'capped')}>Begrenzt</option><option value="none"${selected(armor.dexterityMode, 'none')}>Nicht</option></select></label>
        <label><span>GES-Limit</span><input type="number" min="-20" max="20" data-combat-collection="armorItems" data-combat-item-id="${escapeMarkup(armor.id)}" data-combat-property="dexterityCap" value="${armor.dexterityCap}"></label>
        <label><span>GES zählt ab Stufe</span><input type="number" min="0" max="30" data-combat-collection="armorItems" data-combat-item-id="${escapeMarkup(armor.id)}" data-combat-property="dexterityUnlockLevel" value="${armor.dexterityUnlockLevel || 0}" title="0 bedeutet: sofort"></label>
        <label class="wide"><span>Eigenschaften</span><input data-combat-collection="armorItems" data-combat-item-id="${escapeMarkup(armor.id)}" data-combat-property="properties" value="${escapeMarkup(armor.properties)}" maxlength="500"></label>
        <label class="wide"><span>Notizen / besondere Regeln</span><textarea data-combat-collection="armorItems" data-combat-item-id="${escapeMarkup(armor.id)}" data-combat-property="notes" maxlength="800">${escapeMarkup(armor.notes)}</textarea></label>
      </div>
    </article>`).join('') : '<p class="cp-sheet-empty">Noch kein Schutz eingetragen.</p>'}</div>
  </section>`;
}

function renderDamageAffinities(profile) {
  const labels = { normal: 'Normal', resistant: 'Resistent', vulnerable: 'Verwundbar', immune: 'Immun' };
  return `<section class="cp-sheet-card">
    <div class="cp-sheet-section-head"><div><span>Schadensart und magische Herkunft</span><h4>Resistenzen, Immunitäten &amp; Verwundbarkeiten</h4></div><button type="button" data-combat-action="add-item" data-combat-collection="damageAffinities">+ Eintrag</button></div>
    <div class="cp-sheet-table" role="table">
      <div class="cp-sheet-table-head" role="row"><span>Wirkung</span><span>Schadensart</span><span>Magie</span><span>Quelle</span><span>Notiz</span><span></span></div>
      ${profile.damageAffinities.map(item => `<div class="cp-sheet-table-row" role="row">
        <select data-combat-collection="damageAffinities" data-combat-item-id="${escapeMarkup(item.id)}" data-combat-property="response" aria-label="Wirkung">${Object.entries(labels).map(([value, label]) => `<option value="${value}"${selected(item.response, value)}>${label}</option>`).join('')}</select>
        <input data-combat-collection="damageAffinities" data-combat-item-id="${escapeMarkup(item.id)}" data-combat-property="damageType" value="${escapeMarkup(item.damageType)}" placeholder="z. B. Feuer oder all">
        <select data-combat-collection="damageAffinities" data-combat-item-id="${escapeMarkup(item.id)}" data-combat-property="magicScope"><option value="any"${selected(item.magicScope, 'any')}>Beliebig</option><option value="magical"${selected(item.magicScope, 'magical')}>Nur magisch</option><option value="nonmagical"${selected(item.magicScope, 'nonmagical')}>Nur nichtmagisch</option></select>
        <input data-combat-collection="damageAffinities" data-combat-item-id="${escapeMarkup(item.id)}" data-combat-property="source" value="${escapeMarkup(item.source)}" placeholder="Rüstung, Volk, Zauber …">
        <input data-combat-collection="damageAffinities" data-combat-item-id="${escapeMarkup(item.id)}" data-combat-property="notes" value="${escapeMarkup(item.notes)}" placeholder="Hinweis">
        <button type="button" class="cp-sheet-remove" data-combat-action="remove-item" data-combat-collection="damageAffinities" data-combat-item-id="${escapeMarkup(item.id)}">×</button>
      </div>`).join('') || '<p class="cp-sheet-empty">Keine besonderen Schadensreaktionen eingetragen.</p>'}
    </div>
  </section>`;
}

function renderMechanicsFields(collection, item) {
  return `<div class="cp-sheet-mechanics"><span>Strukturierte Wirkung</span>
    <label>Angriff<input type="number" min="-99" max="99" data-combat-collection="${collection}" data-combat-item-id="${escapeMarkup(item.id)}" data-combat-property="mechanics.attack" value="${item.mechanics.attack}"></label>
    <label>Schaden<input type="number" min="-99" max="99" data-combat-collection="${collection}" data-combat-item-id="${escapeMarkup(item.id)}" data-combat-property="mechanics.damage" value="${item.mechanics.damage}"></label>
    <label>RK<input type="number" min="-99" max="99" data-combat-collection="${collection}" data-combat-item-id="${escapeMarkup(item.id)}" data-combat-property="mechanics.armorClass" value="${item.mechanics.armorClass}"></label>
    <label>Initiative<input type="number" min="-99" max="99" data-combat-collection="${collection}" data-combat-item-id="${escapeMarkup(item.id)}" data-combat-property="mechanics.initiative" value="${item.mechanics.initiative}"></label>
    <label>Fertigkeiten<input type="number" min="-99" max="99" data-combat-collection="${collection}" data-combat-item-id="${escapeMarkup(item.id)}" data-combat-property="mechanics.skill" value="${item.mechanics.skill}"></label>
    <label>Rettungswürfe<input type="number" min="-99" max="99" data-combat-collection="${collection}" data-combat-item-id="${escapeMarkup(item.id)}" data-combat-property="mechanics.savingThrow" value="${item.mechanics.savingThrow}"></label>
    <label>Zauberangriff<input type="number" min="-99" max="99" data-combat-collection="${collection}" data-combat-item-id="${escapeMarkup(item.id)}" data-combat-property="mechanics.spellAttack" value="${item.mechanics.spellAttack}"></label>
    <label>Zauber-SG<input type="number" min="-99" max="99" data-combat-collection="${collection}" data-combat-item-id="${escapeMarkup(item.id)}" data-combat-property="mechanics.spellSaveDc" value="${item.mechanics.spellSaveDc}"></label>
    <label>Wurfmodus<select data-combat-collection="${collection}" data-combat-item-id="${escapeMarkup(item.id)}" data-combat-property="mechanics.attackRollMode"><option value="normal"${selected(item.mechanics.attackRollMode, 'normal')}>Normal</option><option value="advantage"${selected(item.mechanics.attackRollMode, 'advantage')}>Vorteil</option><option value="disadvantage"${selected(item.mechanics.attackRollMode, 'disadvantage')}>Nachteil</option></select></label>
  </div>`;
}

const CARD_MECHANIC_LABELS = Object.freeze({
  attack: 'Angriff', damage: 'Schaden', armorClass: 'RK', initiative: 'Initiative',
  skill: 'Fertigkeiten', savingThrow: 'Rettungswürfe', spellAttack: 'Zauberangriff',
  spellSaveDc: 'Zauber-SG', movement: 'Bewegung', maximumHitPoints: 'Max. TP',
  passivePerception: 'Wahrnehmung'
});

function renderMechanicsSummary(mechanics = {}) {
  const values = Object.entries(CARD_MECHANIC_LABELS)
    .map(([key, label]) => [label, Number(mechanics[key]) || 0])
    .filter(([, value]) => value !== 0)
    .map(([label, value]) => `${label} ${displayModifier(value)}`);
  if (mechanics.attackRollMode === 'advantage') values.push('Angriff mit Vorteil');
  if (mechanics.attackRollMode === 'disadvantage') values.push('Angriff mit Nachteil');
  return values.join(' · ');
}

function getActivationLabel(value) {
  return ({
    action: 'Aktion',
    'bonus-action': 'Bonusaktion',
    reaction: 'Reaktion',
    'special-action': 'Besondere Aktion',
    passive: 'Passiv'
  })[value] || value || 'Aktion';
}

function getResolutionLabel(spell) {
  if (spell.resolutionType === 'saving-throw') {
    const attribute = COMBAT_ATTRIBUTE_DEFINITIONS.find(entry => entry.key === spell.saveAttribute)?.label || 'Attribut';
    return `${attribute}-Rettungswurf${spell.halfDamageOnSave ? ' · halber Schaden bei Erfolg' : ''}`;
  }
  if (spell.resolutionType === 'automatic') return 'Automatische Wirkung';
  return 'Zauberangriff';
}

function renderCardProperty(iconSource, label, value) {
  if (!String(value || '').trim()) return '';
  return `<div class="cp-card-property">${renderPropertyIcon(iconSource)}<div><span>${escapeMarkup(label)}</span><strong>${escapeMarkup(value)}</strong></div></div>`;
}

function renderPresentationDetailCards(collection, title, kicker, kind, addLabel, items) {
  return `<article class="cp-sheet-card cp-sheet-detail-cards cp-sheet-presentation-cards">
    <div class="cp-sheet-section-head"><div><span>${kicker}</span><h4>${title}</h4></div><button type="button" data-combat-action="add-detail-item" data-combat-collection="${collection}" data-combat-entry-kind="${kind}">+ ${addLabel}</button></div>
    <div class="cp-entry-card-list">${items.map(item => {
      const costs = (item.costs || []).map(cost => `${cost.amount} ${cost.name}`).join(' · ');
      const meta = kind === 'quirk'
        ? [item.type, item.appliesWhen, item.target].filter(Boolean).join(' · ')
        : [getActivationLabel(item.activationType), item.delivery, costs].filter(Boolean).join(' · ');
      const mechanics = renderMechanicsSummary(item.mechanics);
      const propertyRows = kind === 'ability'
        ? [
          renderCardProperty(getActivationIconSource(item.activationType), 'Aktivierung', getActivationLabel(item.activationType)),
          renderCardProperty(getRollIconSource(item.rollFormula, item.damageType), 'Wirkung', [String(item.rollFormula || '').toUpperCase().replace(/D/g, 'W'), item.damageType].filter(Boolean).join(' · ')),
          renderCardProperty(getRangeIconSource(), 'Ziel & Reichweite', [item.target, item.range].filter(Boolean).join(' · '))
        ].join('')
        : [
          renderCardProperty(getActivationIconSource('passive'), 'Gilt', item.appliesWhen || 'Dauerhaft'),
          renderCardProperty(getRangeIconSource(), 'Betroffene', item.target || 'Selbst')
        ].join('');
      return `<details class="cp-entry-card ${item.active ? 'active' : 'inactive'}">
        <summary>${renderEntryIcon(kind, item, 'cp-entry-card-icon')}<span class="cp-entry-card-heading"><small>${escapeMarkup(meta || (item.active ? 'Aktiv' : 'Inaktiv'))}</small><strong>${escapeMarkup(item.name || 'Unbenannter Eintrag')}</strong><span>${escapeMarkup(item.description || 'Noch keine Beschreibung.')}</span></span><i class="cp-card-disclosure" aria-hidden="true"></i></summary>
        <div class="cp-entry-card-body">
          <section><h5>Beschreibung</h5><p>${escapeMarkup(item.description || 'Noch keine Beschreibung eingetragen.')}</p></section>
          ${propertyRows ? `<section><h5>Eigenschaften</h5><div class="cp-card-property-grid">${propertyRows}</div></section>` : ''}
          ${mechanics ? `<p class="cp-entry-mechanics-note"><strong>Strukturierte Wirkung:</strong> ${escapeMarkup(mechanics)}</p>` : ''}
          ${item.requirements || item.limitations ? `<p class="cp-entry-limitations"><strong>Grenzen:</strong> ${escapeMarkup(item.requirements || item.limitations)}</p>` : ''}
          <div class="cp-sheet-detail-actions"><button type="button" data-combat-action="edit-detail-item" data-combat-collection="${collection}" data-combat-item-id="${escapeMarkup(item.id)}" data-combat-entry-kind="${kind}">Bearbeiten</button><button type="button" class="cp-sheet-remove" data-combat-action="remove-item" data-combat-collection="${collection}" data-combat-item-id="${escapeMarkup(item.id)}" aria-label="${escapeMarkup(item.name || 'Eintrag')} entfernen">×</button></div>
        </div>
      </details>`;
    }).join('') || `<p class="cp-sheet-empty">Noch keine ${title.toLowerCase()} eingetragen.</p>`}</div>
  </article>`;
}

function renderDetailCards(profile, collection, title, kicker, kind, addLabel, itemsOverride = null, defaultActivation = '') {
  const items = itemsOverride || profile[collection] || [];
  if (kind === 'quirk' || kind === 'ability') {
    return renderPresentationDetailCards(collection, title, kicker, kind, addLabel, items);
  }
  const activeWeapon = profile.weapons.find(weapon => weapon.equipped) || profile.weapons[0] || null;
  return `<article class="cp-sheet-card cp-sheet-detail-cards">
    <div class="cp-sheet-section-head"><div><span>${kicker}</span><h4>${title}</h4></div><button type="button" data-combat-action="add-detail-item" data-combat-collection="${collection}" data-combat-entry-kind="${kind}"${defaultActivation ? ` data-combat-default-activation="${defaultActivation}"` : ''}>+ ${addLabel}</button></div>
    <div class="cp-sheet-detail-list">${items.map(item => {
      const costs = (item.costs || []).map(cost => `${cost.amount} ${cost.name}`).join(' · ');
      const meta = kind === 'quirk'
        ? [item.type, item.appliesWhen, item.target].filter(Boolean).join(' · ')
        : [item.activationType, item.delivery, costs].filter(Boolean).join(' · ');
      const compatible = kind !== 'technique' || isTechniqueCompatibleWithWeapon(item, activeWeapon);
      const stateClass = item.active && compatible ? 'active' : 'inactive';
      const compatibilityNote = compatible ? '' : `Nicht mit ${activeWeapon?.name || 'der aktiven Waffe'} verfügbar.`;
      return `<article class="cp-sheet-detail-card ${stateClass}" data-compatible="${compatible}">
        <div><span>${escapeMarkup([meta || (item.active ? 'Aktiv' : 'Inaktiv'), compatibilityNote].filter(Boolean).join(' · '))}</span><strong>${escapeMarkup(item.name || 'Unbenannter Eintrag')}</strong><p>${escapeMarkup(item.description || 'Noch keine Beschreibung.')}</p></div>
        <div class="cp-sheet-detail-actions"><button type="button" data-combat-action="edit-detail-item" data-combat-collection="${collection}" data-combat-item-id="${escapeMarkup(item.id)}" data-combat-entry-kind="${kind}">Bearbeiten</button><button type="button" class="cp-sheet-remove" data-combat-action="remove-item" data-combat-collection="${collection}" data-combat-item-id="${escapeMarkup(item.id)}">×</button></div>
      </article>`;
    }).join('') || `<p class="cp-sheet-empty">Noch keine ${title.toLowerCase()} eingetragen.</p>`}</div>
  </article>`;
}

function renderConditionCollection(profile, title, kicker, addLabel) {
  const collection = 'conditions';
  return `<article class="cp-sheet-card cp-sheet-conditions">
    <div class="cp-sheet-section-head"><div><span>${kicker}</span><h4>${title}</h4></div><button type="button" data-combat-action="add-item" data-combat-collection="${collection}">+ ${addLabel}</button></div>
    <div class="cp-condition-card-list">${profile.conditions.map(item => {
      const meta = [item.duration, item.source].filter(Boolean).join(' · ') || (item.active ? 'Aktiver Zustand' : 'Inaktiv');
      return `<details class="cp-condition-card ${item.active ? 'active' : 'inactive'}">
        <summary>${renderEntryIcon('condition', item, 'cp-condition-card-icon')}<span class="cp-entry-card-heading"><small>${escapeMarkup(meta)}</small><strong>${escapeMarkup(item.name || 'Unbenannter Zustand')}</strong><span>${escapeMarkup(item.description || 'Noch keine Beschreibung.')}</span></span><i class="cp-card-disclosure" aria-hidden="true"></i></summary>
        <div class="cp-condition-card-body">
          <div class="cp-sheet-narrative-title"><label><input type="checkbox" data-combat-collection="conditions" data-combat-item-id="${escapeMarkup(item.id)}" data-combat-property="active"${checked(item.active)}> aktiv</label><input data-combat-collection="conditions" data-combat-item-id="${escapeMarkup(item.id)}" data-combat-property="name" value="${escapeMarkup(item.name)}" maxlength="100" placeholder="Name"><button type="button" class="cp-sheet-remove" data-combat-action="remove-item" data-combat-collection="conditions" data-combat-item-id="${escapeMarkup(item.id)}" aria-label="${escapeMarkup(item.name || 'Zustand')} entfernen">×</button></div>
          <div class="cp-sheet-fields compact"><label><span>Dauer</span><input data-combat-collection="conditions" data-combat-item-id="${escapeMarkup(item.id)}" data-combat-property="duration" value="${escapeMarkup(item.duration)}" maxlength="100"></label><label><span>Quelle</span><input data-combat-collection="conditions" data-combat-item-id="${escapeMarkup(item.id)}" data-combat-property="source" value="${escapeMarkup(item.source)}" maxlength="160"></label></div>
          <textarea data-combat-collection="conditions" data-combat-item-id="${escapeMarkup(item.id)}" data-combat-property="description" maxlength="1200" placeholder="Beschreibung und erzählerische Bedeutung">${escapeMarkup(item.description)}</textarea>
          ${renderMechanicsFields(collection, item)}
        </div>
      </details>`;
    }).join('') || `<p class="cp-sheet-empty">Noch keine ${title.toLowerCase()} eingetragen.</p>`}</div>
  </article>`;
}

function renderNarrativeCollection(profile, collection, title, kicker, addLabel) {
  if (collection === 'quirks') return renderDetailCards(profile, collection, title, kicker, 'quirk', addLabel);
  return renderConditionCollection(profile, title, kicker, addLabel);
}

function renderAbilities(profile) {
  return renderDetailCards(profile, 'abilities', 'Besondere Fähigkeiten', 'Aktiv, passiv, begrenzt oder kampfrelevant', 'ability', 'Fähigkeit');
}

function renderTechniques(profile) {
  const standard = profile.techniques.filter(item => !['reaction', 'bonus-action'].includes(item.activationType));
  const reactive = profile.techniques.filter(item => ['reaction', 'bonus-action'].includes(item.activationType));
  return `<section class="cp-sheet-grid cp-sheet-grid-two cp-sheet-technique-grid">
    ${renderDetailCards(profile, 'techniques', 'Techniken & Formen', 'Waffenabhängige Spezialangriffe und Haltungen', 'technique', 'Technik', standard, 'action')}
    ${renderDetailCards(profile, 'techniques', 'Reaktionen & Bonusaktionen', 'Schnelle Antworten und zusätzliche Manöver', 'technique', 'Reaktion / Bonusaktion', reactive, 'bonus-action')}
  </section>`;
}

const AURA_MECHANIC_FIELDS = Object.freeze([
  ['attack', 'Angriff'], ['damage', 'Schaden'], ['armorClass', 'RK'], ['savingThrow', 'Rettung'],
  ['skill', 'Fertigkeit'], ['spellAttack', 'Zauberangriff'], ['spellSaveDc', 'Zauber-SG'],
  ['movement', 'Bewegung'], ['maximumHitPoints', 'Max. TP'],
  ['combatStartTemporaryHitPoints', 'Temp. TP bei Kampfbeginn', 0, 9999], ['passivePerception', 'Wahrnehmung']
]);

function renderAuraMechanics(path, title, mechanics = {}) {
  return `<fieldset class="cp-aura-mechanics"><legend>${title}</legend>${AURA_MECHANIC_FIELDS.map(([key, label, minimum = -9999, maximum = 9999]) => `<label><span>${label}</span><input type="number" min="${minimum}" max="${maximum}" data-combat-path="${path}.${key}" value="${mechanics[key] ?? 0}"></label>`).join('')}<label><span>Wurfmodus</span><select data-combat-path="${path}.attackRollMode"><option value="normal"${selected(mechanics.attackRollMode, 'normal')}>Normal</option><option value="advantage"${selected(mechanics.attackRollMode, 'advantage')}>Vorteil</option><option value="disadvantage"${selected(mechanics.attackRollMode, 'disadvantage')}>Nachteil</option></select></label></fieldset>`;
}

function renderAuraComponent(component, path, title) {
  return `<details class="cp-aura-component" open><summary>${title} · ${escapeMarkup(component.name || '')}</summary>
    <div class="cp-sheet-fields compact">
      <label class="check"><input type="checkbox" data-combat-path="${path}.enabled"${checked(component.enabled)}> Vorhanden</label>
      <label class="check"><input type="checkbox" data-combat-path="${path}.active"${checked(component.active)}> Wirkt aktuell</label>
      <label><span>Name</span><input data-combat-path="${path}.name" value="${escapeMarkup(component.name)}"></label>
      <label><span>Radius / Reichweite</span><input data-combat-path="${path}.radius" value="${escapeMarkup(component.radius)}"></label>
      <label><span>Zielgruppe</span><input data-combat-path="${path}.target" value="${escapeMarkup(component.target)}"></label>
      <label><span>Dauer</span><input data-combat-path="${path}.duration" value="${escapeMarkup(component.duration)}"></label>
      <label class="wide"><span>Auslöser</span><input data-combat-path="${path}.trigger" value="${escapeMarkup(component.trigger)}"></label>
      <label class="wide"><span>Beschreibung</span><textarea data-combat-path="${path}.description" rows="4">${escapeMarkup(component.description)}</textarea></label>
      <label class="wide"><span>Voraussetzungen</span><textarea data-combat-path="${path}.requirements" rows="2">${escapeMarkup(component.requirements)}</textarea></label>
      <label class="wide"><span>Hinweise an AleriaGPT</span><textarea data-combat-path="${path}.aiInstructions" rows="3">${escapeMarkup(component.aiInstructions)}</textarea></label>
    </div>
    <div class="cp-aura-mechanics-grid">${renderAuraMechanics(`${path}.selfMechanics`, 'Auf den Träger', component.selfMechanics)}${renderAuraMechanics(`${path}.allyMechanics`, 'Auf Verbündete', component.allyMechanics)}${renderAuraMechanics(`${path}.enemyMechanics`, 'Auf Gegner', component.enemyMechanics)}</div>
  </details>`;
}

function renderAura(profile) {
  const aura = profile.aura;
  return `<section class="cp-sheet-card cp-sheet-aura">
    <div class="cp-sheet-section-head"><div><span>Wille, Ausstrahlung und beherrschter Einfluss</span><h4>Aura, Präsenz &amp; Domäne</h4></div><label class="cp-sheet-toggle"><input type="checkbox" data-combat-path="aura.enabled"${checked(aura.enabled)}> Aura aktiv</label></div>
    <div class="cp-sheet-fields compact">
      <label><span>Name</span><input data-combat-path="aura.name" value="${escapeMarkup(aura.name)}"></label>
      <label><span>Domäne</span><input data-combat-path="aura.domain" value="${escapeMarkup(aura.domain)}" placeholder="Herrschaft, Sturm, Furcht, Schutz …"></label>
      <label><span>Fokusressource</span><select data-combat-path="aura.focusResourceId">${profile.resources.map(resource => `<option value="${escapeMarkup(resource.id)}"${selected(aura.focusResourceId, resource.id)}>${escapeMarkup(resource.name)}</option>`).join('')}</select></label>
      <label><span>Fokuskosten zum Umgehen</span><input type="number" min="1" max="999" data-combat-path="aura.focusBypassCost" value="${aura.focusBypassCost}"></label>
      <label class="wide"><span>Domänenregeln & Notizen</span><textarea data-combat-path="aura.notes" rows="4">${escapeMarkup(aura.notes)}</textarea></label>
    </div>
    ${renderAuraComponent(aura.activeForm, 'aura.activeForm', 'Aktive Form')}
    ${renderAuraComponent(aura.latentPresence, 'aura.latentPresence', 'Latente Präsenz')}
  </section>`;
}

function renderCheats(profile) {
  return `<section class="cp-sheet-card cp-sheet-cheats">
    <div class="cp-sheet-section-head"><div><span>Nur für Tests und bewusst regelbrechende Szenen</span><h4>Spielleiter-Cheat</h4></div></div>
    <label class="cp-sheet-cheat-toggle"><input type="checkbox" data-combat-path="cheats.enabled"${checked(profile.cheats.enabled)}> Alle Kosten entfallen und alle Angriffe gelingen automatisch.</label>
    <label class="cp-sheet-cheat-toggle"><input type="checkbox" data-combat-path="cheats.automaticCritical"${checked(profile.cheats.automaticCritical)}> Automatische Erfolge zusätzlich als kritischen Treffer behandeln.</label>
  </section>`;
}

function renderSpellSlotProfile(profile) {
  const slots = getOrderedSpellSlotResources(profile.resources, profile.magic.slotResourceIds);
  return `<section class="cp-sheet-spell-slots" aria-label="Zauberplätze nach Grad">
    <div class="cp-sheet-subhead"><div><strong>Zauberplätze I–X</strong><small>Eigenständige Magieressourcen · Auffüllung durch lange Rast</small></div></div>
    <div class="cp-sheet-spell-slot-grid"><div class="cp-sheet-cantrip-slot" data-spell-slot-level="0">
      <span class="cp-sheet-resource-icon-frame" aria-hidden="true"><span class="cp-sheet-resource-icon-fallback">∞</span></span>
      <span>Zaubertricks</span><strong>Unerschöpflich</strong>
    </div>${slots.map(resource => `<label data-spell-slot-level="${getSpellSlotLevel(resource) || ''}">
      ${renderResourceIcon(resource)}
      <span>${escapeMarkup(getSpellLevelLabel(getSpellSlotLevel(resource)))}</span>
      <span><input type="number" min="0" max="9999" data-combat-collection="resources" data-combat-item-id="${escapeMarkup(resource.id)}" data-combat-property="current" value="${resource.current}" aria-label="${escapeMarkup(resource.name)} aktuell"><i>/</i><input type="number" min="0" max="9999" data-combat-collection="resources" data-combat-item-id="${escapeMarkup(resource.id)}" data-combat-property="maximum" value="${resource.maximum}" aria-label="${escapeMarkup(resource.name)} maximum"></span>
    </label>`).join('')}</div>
  </section>`;
}

function renderSpellCard(spell) {
  const icon = getCombatEntryIconPresentation('spell', spell);
  const fallbackSource = getSafeImageSource(icon.fallbackSource);
  const iconSource = getSafeImageSource(icon.source, fallbackSource);
  const rollFormula = String(spell.rollFormula || '').toUpperCase().replace(/D/g, 'W');
  const presentationLabel = ({ spell: 'Zauberformel', prayer: 'Gebet', song: 'Gesang' })[spell.presentationKind] || 'Zauberformel';
  const damageLabel = [rollFormula, spell.damageType].filter(Boolean).join(' · ');
  const costLabel = Number(spell.level) === 0
    ? 'Kein Mana · kein Zauberplatz'
    : `${spell.manaCost} Mana · ${spell.slotCost || 1} ${getSpellLevelLabel(spell.level)}`;
  const upcast = spell.upcast || {};
  const upcastParts = [
    upcast.formulaPerLevel ? `${String(upcast.formulaPerLevel).toUpperCase().replace(/D/g, 'W')} je Grad` : '',
    Number(upcast.amountPerLevel) ? `+${upcast.amountPerLevel} je Grad` : '',
    upcast.maximumLevel ? `bis Grad ${upcast.maximumLevel}` : ''
  ].filter(Boolean);
  return `<details class="cp-spell-card ${spell.prepared ? 'prepared' : 'unprepared'}">
    <summary>${renderEntryIcon('spell', spell, 'cp-spell-summary-icon')}<span class="cp-entry-card-heading"><small>${escapeMarkup([spell.school, presentationLabel, getSpellLevelLabel(spell.level)].filter(Boolean).join(' · '))}</small><strong>${escapeMarkup(spell.name || 'Unbenannter Zauber')}</strong><span>${escapeMarkup(spell.description || 'Noch keine Zauberbeschreibung.')}</span></span><span class="cp-spell-ready-state">${spell.prepared ? 'Bereit' : 'Nicht bereit'}</span><i class="cp-card-disclosure" aria-hidden="true"></i></summary>
    <div class="cp-spell-card-body">
      <section class="cp-spell-card-hero">
        <div><p><strong>${escapeMarkup(spell.name || 'Dieser Zauber')}</strong> ist ${escapeMarkup(getSpellLevelLabel(spell.level).toLowerCase())}${spell.damageType ? ` und wirkt mit ${escapeMarkup(spell.damageType)}.` : '.'}</p><h5>Beschreibung</h5><p>${escapeMarkup(spell.description || 'Noch keine Wirkung beschrieben.')}</p></div>
        <img class="cp-spell-card-art" data-combat-entry-icon src="${escapeMarkup(iconSource)}" data-fallback-src="${escapeMarkup(fallbackSource)}" alt="" loading="lazy" decoding="async">
      </section>
      <section><h5>Eigenschaften</h5><div class="cp-card-property-grid cp-spell-property-grid">
        ${renderCardProperty(getActivationIconSource(spell.activationType), 'Kosten', `${getActivationLabel(spell.activationType)} · ${costLabel}`)}
        ${renderCardProperty(getRollIconSource(spell.rollFormula, spell.damageType), 'Schaden / Wurf', damageLabel || 'Keine Schadensformel')}
        ${renderCardProperty(getDamageTypeIconSource(spell.damageType), 'Auflösung', getResolutionLabel(spell))}
        ${renderCardProperty(getRangeIconSource(), 'Reichweite', spell.range || 'Zauberreichweite')}
        ${renderCardProperty(getActivationIconSource(spell.concentration ? 'reaction' : 'passive'), 'Dauer', [spell.duration, spell.concentration ? 'Konzentration' : ''].filter(Boolean).join(' · ') || 'Sofort')}
      </div></section>
      ${upcast.enabled ? `<section class="cp-spell-upcast"><h5>Auf höheren Graden</h5><p>${escapeMarkup(upcastParts.join(' · ') || 'Der Zauber kann mit einem höheren Zauberplatz gewirkt werden.')}</p></section>` : ''}
      <details class="cp-spell-technical"><summary>Technische Details</summary><div><p><strong>Voraussetzungen:</strong> ${escapeMarkup(spell.requirements || 'Keine besonderen Voraussetzungen.')}</p><p><strong>Schlagworte:</strong> ${escapeMarkup(spell.tags || 'Keine Schlagworte.')}</p>${spell.aiInstructions ? `<p><strong>AleriaGPT:</strong> ${escapeMarkup(spell.aiInstructions)}</p>` : ''}</div></details>
      <div class="cp-spell-card-actions"><label class="check"><input type="checkbox" data-combat-collection="magic.spells" data-combat-item-id="${escapeMarkup(spell.id)}" data-combat-property="prepared"${checked(spell.prepared)}> vorbereitet</label><button type="button" data-combat-action="edit-action-rules" data-combat-collection="magic.spells" data-combat-item-id="${escapeMarkup(spell.id)}" data-combat-entry-kind="spell">Zauber bearbeiten</button><button type="button" class="cp-sheet-remove" data-combat-action="remove-item" data-combat-collection="magic.spells" data-combat-item-id="${escapeMarkup(spell.id)}" aria-label="${escapeMarkup(spell.name || 'Zauber')} entfernen">×</button></div>
    </div>
  </details>`;
}

function renderMagic(profile) {
  const magic = profile.magic;
  return `<article class="cp-sheet-card cp-sheet-magic">
    <div class="cp-sheet-section-head"><div><span>Mana, Zauberwerte &amp; Repertoire</span><h4>Magie</h4></div><label class="cp-sheet-toggle"><input type="checkbox" data-combat-path="magic.enabled"${checked(magic.enabled)}> Magie aktiv</label></div>
    <div class="cp-sheet-fields compact">
      <label><span>Zauberattribut</span><select data-combat-path="magic.castingAttribute">${renderAttributeOptions(magic.castingAttribute)}</select></label>
      <label><span>Zauberangriff</span><input type="number" min="-99" max="99" data-combat-path="magic.spellAttackOverride" value="${magic.spellAttackOverride ?? ''}" placeholder="automatisch"><small>Aktuell <b data-combat-derived="spell-attack">+0</b></small></label>
      <label><span>Zauber-SG</span><input type="number" min="0" max="999" data-combat-path="magic.spellSaveDcOverride" value="${magic.spellSaveDcOverride ?? ''}" placeholder="automatisch"><small>Aktuell <b data-combat-derived="spell-save-dc">10</b></small></label>
      <label><span>Mana-Ressource</span><select data-combat-path="magic.manaResourceId"><option value="">Keine Verknüpfung</option>${profile.resources.map(resource => `<option value="${escapeMarkup(resource.id)}"${selected(magic.manaResourceId, resource.id)}>${escapeMarkup(resource.name)}</option>`).join('')}</select></label>
      <label class="wide"><span>Magische Regeln / Tradition</span><textarea data-combat-path="magic.notes" maxlength="1600" placeholder="Magiesystem, Grenzen, Fokus, Tradition …">${escapeMarkup(magic.notes)}</textarea></label>
    </div>
    ${renderSpellSlotProfile(profile)}
    <div class="cp-sheet-subhead"><div><strong>Zauber</strong><small>Ein Zauber öffnet seine vollständige Karte mit Wirkung, Kosten und Regeln.</small></div><button type="button" data-combat-action="add-detail-item" data-combat-collection="magic.spells" data-combat-entry-kind="spell">+ Zauber</button></div>
    <div class="cp-sheet-spell-list">${magic.spells.map(renderSpellCard).join('') || '<p class="cp-sheet-empty">Noch keine Zauber eingetragen.</p>'}</div>
  </article>`;
}

function renderNotes(profile) {
  return `<section class="cp-sheet-card cp-sheet-notes">
    <div class="cp-sheet-section-head"><div><span>Freitext wird von AleriaGPT interpretiert</span><h4>Notizen &amp; besondere Regeln</h4></div></div>
    <textarea data-combat-path="notes" maxlength="6000" placeholder="Kampfstil, Schwächen, besondere Regeln, Absprachen oder wichtige Hinweise …">${escapeMarkup(profile.notes)}</textarea>
    <p><strong>Regel:</strong> Zahlenwirkungen bitte zusätzlich als strukturierte Wirkung bei Marotten, Zuständen oder Fähigkeiten eintragen. So bleibt die Berechnung eindeutig.</p>
  </section>`;
}

function renderSheet() {
  const root = document.getElementById('cp-combat-sheet-root');
  if (!root) return;
  const profile = sanitizeCharacterCombatProfile(draftProfile);
  root.innerHTML = `<div class="cp-combat-profile">
    ${renderIdentityAndProgression(profile)}
    ${renderAttributeRadar(profile)}
    ${renderDerivedStats(profile)}
    ${renderRules(profile)}
    ${renderProficiencies(profile)}
    ${renderResources(profile)}
    ${renderSkills(profile)}
    ${renderWeapons(profile)}
    ${renderTechniques(profile)}
    ${renderArmor(profile)}
    ${renderDamageAffinities(profile)}
    ${renderAura(profile)}
    <section class="cp-sheet-grid cp-sheet-grid-two">${renderNarrativeCollection(profile, 'quirks', 'Marotten & Eigenschaften', 'Persönlichkeit und Sonderregeln', 'Marotte')}${renderNarrativeCollection(profile, 'conditions', 'Zustände & Effekte', 'Dauerhafte und temporäre Einflüsse', 'Zustand')}</section>
    <section class="cp-sheet-grid cp-sheet-grid-two">${renderAbilities(profile)}${renderMagic(profile)}</section>
    ${renderCheats(profile)}
    ${renderNotes(profile)}
    ${renderLevelUpDialog(profile)}
  </div>`;
  activateResourceIconFallbacks(root);
  activateEntryIconFallbacks(root);
  updateDerivedView();
}

function openLevelUp() {
  const profile = sanitizeCharacterCombatProfile(draftProfile);
  levelUpNotice = '';
  levelUpState = { plan: createCharacterLevelUpPlan(profile) };
  renderSheet();
  document.querySelector('.cp-level-up-close')?.focus();
}

function closeLevelUp() {
  levelUpState = null;
  renderSheet();
}

function updateLevelUpPlan(target) {
  if (!levelUpState) return false;
  const path = target.dataset.levelUpPath;
  const attributeKey = target.dataset.levelUpAttribute;
  const resourceId = target.dataset.levelUpResource;
  const resourceProperty = target.dataset.levelUpResourceProperty;
  if (path) setAtPath(levelUpState.plan, path, inputValue(target));
  else if (attributeKey) levelUpState.plan.attributeIncreases[attributeKey] = inputValue(target);
  else if (resourceId && resourceProperty) {
    if (!levelUpState.plan.resourceIncreases[resourceId]) levelUpState.plan.resourceIncreases[resourceId] = {};
    levelUpState.plan.resourceIncreases[resourceId][resourceProperty] = inputValue(target);
  } else return false;
  refreshLevelUpPreview();
  return true;
}

function refreshLevelUpPreview() {
  if (!levelUpState) return;
  const preview = previewCharacterLevelUp(draftProfile, levelUpState.plan);
  levelUpState.plan = preview.plan;
  const output = document.querySelector('[data-level-up-role="preview"]');
  if (output) output.innerHTML = renderLevelUpChanges(preview);
  const applyButton = document.querySelector('[data-combat-action="apply-level-up"]');
  if (applyButton) applyButton.disabled = !preview.ready;
}

function applyLevelUp() {
  if (!levelUpState) return;
  const preview = previewCharacterLevelUp(draftProfile, levelUpState.plan);
  if (!preview.ready) {
    refreshLevelUpPreview();
    return;
  }
  draftProfile = preview.profile;
  levelUpState = null;
  levelUpNotice = `Stufenaufstieg auf Gesamtstufe ${preview.after.level} wurde in den Entwurf übernommen. Bitte „Figur speichern“ verwenden, um ihn dauerhaft zu sichern.`;
  renderSheet();
}

function findCollectionItem(collectionPath, itemId) {
  const collection = getAtPath(draftProfile, collectionPath);
  if (!Array.isArray(collection)) return null;
  return collection.find(item => String(item.id || item.key || item.attributeKey) === String(itemId));
}

function updateDraftField(target) {
  const directPath = target.dataset.combatPath;
  if (directPath) {
    setAtPath(draftProfile, directPath, inputValue(target));
    if (directPath === 'magic.enabled') {
      draftProfile = sanitizeCharacterCombatProfile(draftProfile);
      renderSheet();
    }
    return true;
  }
  const collectionPath = target.dataset.combatCollection;
  const itemId = target.dataset.combatItemId;
  const property = target.dataset.combatProperty;
  if (!collectionPath || !itemId || !property) return false;
  const item = findCollectionItem(collectionPath, itemId);
  if (!item) return false;
  setAtPath(item, property, inputValue(target));
  if (collectionPath === 'magic.spells' && property === 'level') {
    const level = Math.max(0, Math.min(10, Number(target.value) || 0));
    item.level = level;
    item.manaCost = level === 0 ? 0 : Math.max(0, Number(item.manaCost) || 0);
    item.slotCost = level === 0 ? 0 : Math.max(1, Number(item.slotCost) || 1);
    item.slotResourceId = level === 0 ? '' : findSpellSlotResourceId(draftProfile.resources, level);
    draftProfile = sanitizeCharacterCombatProfile(draftProfile);
    renderSheet();
    return true;
  }
  if (collectionPath === 'magic.spells' && property === 'activationType') {
    const resource = draftProfile.resources.find(entry => entry.id === target.value);
    const actionResourceIds = new Set(['action', 'bonus-action', 'reaction', 'special-action']);
    const remainingCosts = (item.costs || []).filter(cost => !actionResourceIds.has(String(cost.resourceId || '')));
    item.costs = target.value === 'passive' ? remainingCosts : [{
      id: `${item.id}-activation-cost`, resourceId: target.value, name: resource?.name || target.value,
      amount: 1, scope: resource?.scope || 'comment'
    }, ...remainingCosts];
  }
  return true;
}

function getRadarPoints(profile) {
  const centerX = 130;
  const centerY = 125;
  const maximumRadius = 105;
  return profile.attributes.map((attribute, index) => {
    const angle = -Math.PI / 2 + index * Math.PI / 3;
    const ratio = Math.max(0.08, Math.min(1, Number(attribute.score || 0) / 30));
    return `${(centerX + Math.cos(angle) * maximumRadius * ratio).toFixed(1)},${(centerY + Math.sin(angle) * maximumRadius * ratio).toFixed(1)}`;
  }).join(' ');
}

function setDerived(role, value) {
  document.querySelectorAll(`#cp-tab-combat [data-combat-derived="${role}"]`).forEach(element => {
    element.textContent = String(value);
  });
}

function updateDerivedView() {
  const profile = sanitizeCharacterCombatProfile(draftProfile);
  const resolved = resolveCharacterCombatProfile({ ...(activeCharacter || {}), combatProfile: profile });
  setDerived('effective-level', resolved.effectiveLevel);
  setDerived('proficiency', displayModifier(resolved.proficiencyBonus));
  setDerived('maximum-hit-points', resolved.maximumHitPoints);
  setDerived('armor-class', resolved.totalDefense);
  setDerived('initiative', displayModifier(resolved.initiative));
  setDerived('passive-perception', resolved.passivePerception);
  setDerived('spell-attack', displayModifier(resolved.spellAttackModifier));
  setDerived('spell-save-dc', resolved.spellSaveDc);
  profile.attributes.forEach(attribute => {
    const output = document.querySelector(`[data-combat-attribute-modifier="${attribute.key}"]`);
    if (output) output.textContent = displayModifier(getAttributeModifier(attribute));
    const label = document.querySelector(`[data-combat-radar-label="${attribute.key}"]`);
    if (label) label.textContent = attribute.shortLabel || attribute.label.slice(0, 3).toUpperCase();
  });
  profile.savingThrows.forEach(save => {
    const output = document.querySelector(`[data-combat-save-total="${save.attributeKey}"]`);
    if (output) output.textContent = displayModifier(getSavingThrowTotal(profile, save.attributeKey));
  });
  profile.skills.forEach(skill => {
    const output = document.querySelector(`[data-combat-skill-total="${CSS.escape(skill.id)}"]`);
    if (output) output.textContent = displayModifier(getSkillTotal(profile, skill));
  });
  profile.weapons.forEach(weapon => {
    const attack = document.querySelector(`[data-combat-weapon-attack="${CSS.escape(weapon.id)}"]`);
    const damage = document.querySelector(`[data-combat-weapon-damage="${CSS.escape(weapon.id)}"]`);
    if (attack) attack.textContent = displayModifier(getWeaponAttackModifier(profile, weapon));
    if (damage) damage.textContent = displayModifier(getWeaponDamageModifier(profile, weapon));
  });
  const radar = document.querySelector('[data-combat-radar-polygon]');
  if (radar) radar.setAttribute('points', getRadarPoints(profile));
}

function createEmptyItem(collection) {
  const id = createItemId(collection.replace('.', '-'));
  if (collection === 'skills') return { id, name: '', attributeKey: 'dexterity', proficiency: 'none', bonus: 0, notes: '' };
  if (collection === 'weapons') return { id, inventoryItemId: '', name: '', weaponType: 'unarmed', training: 'simple', damageFormula: '', versatileDamageFormula: '', damageType: 'physisch', attackAttribute: 'strength', proficient: true, attackBonus: 0, damageBonus: 0, range: 'Nahkampf', activationType: 'action', costs: [{ id: `${id}-cost`, resourceId: 'action', name: 'Aktion', amount: 1, scope: 'comment' }], auraBypass: { allowed: true, cost: 1 }, requirements: '', aiInstructions: '', equipped: draftProfile.weapons.length === 0 };
  if (collection === 'armorItems') return { id, inventoryItemId: '', name: '', kind: 'armor', baseArmorClass: '', armorClassBonus: 0, dexterityMode: 'full', dexterityCap: 2, dexterityUnlockLevel: 0, equipped: true };
  if (collection === 'resources') return { id, name: '', current: 0, maximum: 0, recovery: 'manual', scope: 'persistent', category: '', icon: '' };
  if (collection === 'techniques') return { id, name: '', trainingForm: '', minimumLevel: 1, category: 'technique', description: '', effect: '', activationType: 'action', weaponTypes: [], compatibleWeaponIds: [], damageFormula: '', damageType: '', attackBonus: 0, damageBonus: 0, rollMode: 'normal', range: '', target: '', duration: '', requirements: '', tags: '', aiInstructions: '', costs: [{ id: `${id}-cost`, resourceId: 'action', name: 'Aktion', amount: 1, scope: 'comment' }], auraBypass: { allowed: true, cost: 1 }, active: true, mechanics: {}, secondarySave: { enabled: false, attributeKey: 'constitution', dcBase: 8, dcAttributeKey: 'strength', addProficiency: true, failureCondition: { id: `${id}-condition`, name: '', duration: '', description: '', mechanics: {} } }, followUpAttack: { enabled: false, sameTarget: true, damageFormula: '', damageType: '', attackBonus: 0, damageBonus: 0, triggerReactions: true, repeatPerAttackRules: true, triggerFurtherEffects: false } };
  if (collection === 'quirks') return { id, name: '', type: 'quirk', description: '', appliesWhen: '', trigger: '', target: 'Selbst', duration: '', stacking: 'normal', tags: '', limitations: '', aiInstructions: '', priority: 0, active: true, mechanics: {} };
  if (collection === 'conditions') return { id, name: '', duration: '', source: '', description: '', active: true, mechanics: {} };
  if (collection === 'damageAffinities') return { id, damageType: 'all', response: 'resistant', magicScope: 'any', source: '', notes: '' };
  if (collection === 'abilities') return { id, name: '', description: '', usesCurrent: 0, usesMaximum: 0, recovery: 'none', recoveryDayKey: '', rollFormula: '', damageType: 'physisch', activationType: 'action', delivery: 'ability', combatUsable: false, target: '', range: '', duration: '', requirements: '', tags: '', aiInstructions: '', costs: [{ id: `${id}-cost`, resourceId: 'action', name: 'Aktion', amount: 1, scope: 'comment' }], auraBypass: { allowed: true, cost: 1 }, active: true, mechanics: {}, inventoryUseTrigger: { enabled: false, itemTags: [], restoreResources: [], requireActualRecovery: true } };
  if (collection === 'magic.spells') return { id, name: '', icon: '', level: 0, manaCost: 0, slotResourceId: '', slotCost: 0, presentationKind: 'spell', activationType: 'action', resolutionType: 'spell-attack', saveAttribute: 'dexterity', halfDamageOnSave: false, damageType: 'Magie', range: 'Zauber', rollFormula: '', description: '', costs: [{ id: `${id}-cost`, resourceId: 'action', name: 'Aktion', amount: 1, scope: 'comment' }], auraBypass: { allowed: true, cost: 1 }, prepared: true };
  return { id };
}

function addItem(collectionPath, item = null) {
  const collection = getAtPath(draftProfile, collectionPath);
  if (!Array.isArray(collection)) return;
  collection.push(item || createEmptyItem(collectionPath));
  if (collectionPath === 'weapons' || collectionPath === 'armorItems') synchronizeDraftFromCombat();
  renderSheet();
}

function openDetailItemEditor(collectionPath, itemId, kind, defaultActivation = '') {
  const existing = itemId ? findCollectionItem(collectionPath, itemId) : null;
  const item = existing ? structuredClone(existing) : createEmptyItem(collectionPath);
  if (!existing && defaultActivation) {
    item.activationType = defaultActivation;
    const resourceId = defaultActivation;
    const resource = draftProfile.resources.find(entry => entry.id === resourceId);
    item.costs = resourceId === 'passive' ? [] : [{
      id: `${item.id}-cost`,
      resourceId,
      name: resource?.name || defaultActivation,
      amount: 1,
      scope: resource?.scope || 'comment'
    }];
  }
  openCombatEntryEditor({
    kind,
    item,
    resources: draftProfile.resources,
    weapons: draftProfile.weapons,
    inventoryItems: Array.isArray(getInventoryDraft()?.items) ? getInventoryDraft().items : [],
    onSave: updated => {
      const collection = getAtPath(draftProfile, collectionPath);
      if (!Array.isArray(collection)) return;
      const index = collection.findIndex(entry => String(entry.id) === String(updated.id));
      if (index >= 0) collection[index] = updated;
      else collection.push(updated);
      draftProfile = sanitizeCharacterCombatProfile(draftProfile);
      if (collectionPath === 'weapons' || collectionPath === 'armorItems') synchronizeDraftFromCombat();
      renderSheet();
    }
  });
}

function removeItem(collectionPath, itemId) {
  const collection = getAtPath(draftProfile, collectionPath);
  if (!Array.isArray(collection)) return;
  const index = collection.findIndex(item => String(item.id || item.key || item.attributeKey) === String(itemId));
  if (index >= 0) collection.splice(index, 1);
  if (collectionPath === 'weapons' && collection.length && !collection.some(item => item.equipped)) collection[0].equipped = true;
  renderSheet();
}

function copyInventoryEquipment(kind, trigger) {
  const picker = trigger.closest('.cp-sheet-section-head')?.querySelector(`[data-combat-inventory-picker="${kind}"]`);
  const itemId = picker?.value;
  if (!itemId) return;
  const item = getCharacterCombatInventoryOptions(activeCharacter || {}, kind)
    .find(candidate => candidate.inventoryItemId === itemId);
  if (!item) return;
  const collectionName = kind === 'weapon' ? 'weapons' : 'armorItems';
  const linked = draftProfile[collectionName].find(entry => entry.inventoryItemId === itemId);
  if (linked) {
    if (kind === 'weapon') equipWeapon(linked.id);
    return;
  }
  item.id = createItemId(kind);
  if (kind === 'weapon') {
    item.equipped = draftProfile.weapons.length === 0;
    addItem('weapons', item);
  } else {
    item.equipped = true;
    addItem('armorItems', item);
  }
}

function equipWeapon(itemId) {
  draftProfile.weapons.forEach(weapon => { weapon.equipped = weapon.id === itemId; });
  synchronizeDraftFromCombat();
  renderSheet();
}

function init(character = {}) {
  activeCharacter = character;
  draftProfile = sanitizeCharacterCombatProfile(character.combatProfile);
  synchronizeDraftFromInventory(character.inventory || {});
  synchronizeDraftFromCombat({ inventory: character.inventory || {}, renderInventory: true });
  levelUpState = null;
  levelUpNotice = '';
  setupNotice = '';
  renderSheet();
}

function collect() {
  synchronizeDraftFromCombat();
  return sanitizeCharacterCombatProfile(draftProfile);
}

function prepareImported(character = {}) {
  const inventory = typeof globalThis.sanitizeCharacterInventoryData === 'function'
    ? globalThis.sanitizeCharacterInventoryData(character.inventory || {})
    : structuredClone(character.inventory || {});
  const result = synchronizeEquipmentFromCombat({
    inventory,
    combatProfile: sanitizeCharacterCombatProfile(character.combatProfile || {}),
    characterId: character.id || '',
    characterName: character.name || '',
    now: new Date().toISOString()
  });
  return {
    inventory: result.inventory,
    combatProfile: sanitizeCharacterCombatProfile(result.combatProfile)
  };
}

function refreshInventory(character = activeCharacter || {}) {
  activeCharacter = character;
  synchronizeDraftFromInventory(character.inventory || {});
  renderSheet();
}

document.addEventListener('input', event => {
  const target = event.target;
  if (!target?.closest?.('#cp-tab-combat')) return;
  if (updateLevelUpPlan(target)) return;
  if (updateDraftField(target)) {
    if (['weapons', 'armorItems'].includes(target.dataset.combatCollection)) synchronizeDraftFromCombat();
    updateDerivedView();
  }
});

document.addEventListener('change', event => {
  const target = event.target;
  if (!target?.closest?.('#cp-tab-combat')) return;
  if (updateLevelUpPlan(target)) return;
  if (target.dataset.combatAction === 'equip-weapon') return;
  if (updateDraftField(target)) {
    if (['weapons', 'armorItems'].includes(target.dataset.combatCollection)) synchronizeDraftFromCombat();
    updateDerivedView();
  }
});

document.addEventListener('click', event => {
  const trigger = event.target?.closest?.('[data-combat-action]');
  if (!trigger || !trigger.closest('#cp-tab-combat')) return;
  const action = trigger.dataset.combatAction;
  if (action === 'add-item') addItem(trigger.dataset.combatCollection);
  if (action === 'add-detail-item') openDetailItemEditor(trigger.dataset.combatCollection, '', trigger.dataset.combatEntryKind, trigger.dataset.combatDefaultActivation || '');
  if (action === 'edit-detail-item') openDetailItemEditor(trigger.dataset.combatCollection, trigger.dataset.combatItemId, trigger.dataset.combatEntryKind);
  if (action === 'edit-action-rules') openDetailItemEditor(trigger.dataset.combatCollection, trigger.dataset.combatItemId, trigger.dataset.combatEntryKind);
  if (action === 'remove-item') removeItem(trigger.dataset.combatCollection, trigger.dataset.combatItemId);
  if (action === 'copy-inventory') copyInventoryEquipment(trigger.dataset.combatKind, trigger);
  if (action === 'equip-weapon') equipWeapon(trigger.dataset.combatItemId);
  if (action === 'open-character-setup') {
    openCharacterCombatSetup({
      character: activeCharacter || {},
      profile: draftProfile,
      onApply(profile) {
        draftProfile = sanitizeCharacterCombatProfile(profile);
        synchronizeDraftFromCombat();
        setupNotice = 'Die Stufe-1-Starthilfe wurde in den Entwurf übernommen. Bitte „Figur speichern“ verwenden, um den Bogen dauerhaft zu sichern.';
        renderSheet();
      }
    });
  }
  if (action === 'open-level-up') openLevelUp();
  if (action === 'close-level-up') closeLevelUp();
  if (action === 'apply-level-up') applyLevelUp();
});

document.addEventListener('keydown', event => {
  if (event.key !== 'Escape' || !levelUpState) return;
  if (!document.querySelector('.cp-level-up-dialog')) return;
  closeLevelUp();
});

globalThis.AleriaCharacterCombatProfile = Object.freeze({
  init,
  collect,
  refreshInventory,
  collectLinked(inventory = getInventoryDraft()) {
    synchronizeDraftFromInventory(inventory);
    const result = synchronizeDraftFromCombat({ inventory });
    return { inventory: result.inventory, combatProfile: sanitizeCharacterCombatProfile(draftProfile) };
  },
  prepareImported,
  sanitize: sanitizeCharacterCombatProfile,
  refreshDerived: updateDerivedView,
  hasUnsavedDraftNotice: () => !!(levelUpNotice || setupNotice)
});
