import { resolvePortraitSource } from '../config/portrait-placeholders.js';
import { fillHouseRankSelect } from './house-profile-fields.js';
import { createHousePlacementFields } from './house-placement-fields.js';
import { escapeHtml } from './dom.js';
import {
  defaultGenerationParams,
  GENERATION_PARAMETER_DEFINITIONS
} from '../modules/tree-generator/generation-policy.js';
import { FAMILY_TEMPLATE_DEFINITIONS } from '../modules/tree-generator/family-template-catalog.js';
import { AUTOMATIC_TEMPLATE_GENERATION_LIMITS } from '../modules/tree-generator/automatic-family-template.js';
import { listLineagePartnerships } from '../modules/relationships/lineage-partnership-policy.js';

// Die Oberfläche zeigt ausschließlich Parameter, die von der Generierungsregel
// tatsächlich ausgewertet werden. Dadurch verspricht kein Regler Verhalten, das
// beim Anlegen der Generation wirkungslos bliebe.
export const PARAMETER_DEFINITIONS = GENERATION_PARAMETER_DEFINITIONS;

const STEP_LABELS = ['Familiendaten', 'Gründerpaar', 'Aufbau', 'Generationen'];

export function defaultParams() {
  return { ...defaultGenerationParams() };
}

export function createTreeGeneratorDialog(documentRef = document) {
  const dialog = documentRef.getElementById('tree-generator-dialog');
  const form = documentRef.getElementById('tree-generator-form');
  const titleEl = documentRef.getElementById('tree-generator-title');
  const stepsEl = documentRef.getElementById('tree-generator-steps');
  const bodyEl = documentRef.getElementById('tree-generator-body');
  const footerEl = documentRef.getElementById('tree-generator-footer');

  // Rein lokaler UI-Zustand innerhalb einer offenen Sitzung (nicht in der Familie
  // gespeichert): welche Karte im Arbeitsblatt gerade das Kind-Formular zeigt, und
  // wer zuletzt hinzugefügt wurde (für den "Zwilling"-Kurzweg).
  let activeChildFormLineId = '';
  let lastAddedChild = null;
  let phaseOnePlacementFields = null;

  function resetSessionState() {
    activeChildFormLineId = '';
    lastAddedChild = null;
  }

  // Der Dialog hat bewusst keinen type="submit"-Button (jede Etappe hat mehrere,
  // ungleichwertige Aktionen) — Enter in einem Textfeld soll trotzdem nie ein
  // implizites Formular-Submit auslösen und den Dialog per "method=dialog" schließen.
  form.addEventListener('keydown', event => {
    if (event.key === 'Enter' && event.target instanceof HTMLInputElement) {
      event.preventDefault();
    }
  });

  function open() {
    resetSessionState();
    if (!dialog.open) dialog.showModal();
  }

  function close() {
    resetSessionState();
    if (dialog.open) dialog.close();
  }

  // Escape und andere native <dialog>-Schließwege laufen nicht über close().
  // Der lokale Arbeitsblattzustand darf trotzdem nie in die nächste Sitzung
  // durchsickern.
  dialog.addEventListener('close', resetSessionState);

  function setLastAddedChild(entry) {
    lastAddedChild = entry;
  }

  function renderSteps(activePhase) {
    stepsEl.innerHTML = STEP_LABELS.map((label, index) => {
      const stepNumber = index + 1;
      const state = stepNumber < activePhase ? 'done' : stepNumber === activePhase ? 'current' : 'upcoming';
      return `<span class="tree-generator-step tree-generator-step--${state}">${stepNumber} · ${escapeHtml(label)}</span>`;
    }).join('');
  }

  function aiButton(kind, field, label) {
    return `<button class="ai-suggest-button" type="button" data-action="tree-generator-ai-suggest" data-suggest-kind="${escapeHtml(kind)}" data-suggest-field="${escapeHtml(field)}" title="${escapeHtml(label || 'AleriaGPT fragen')}">🪄</button>`;
  }

  function renderPhaseOne(family) {
    phaseOnePlacementFields?.destroy();
    phaseOnePlacementFields = null;
    titleEl.textContent = 'Familiendaten';
    renderSteps(1);
    const profile = (family.extensions && family.extensions.generatorProfile) || {};
    const title = family.document.title === 'Neue Familie' ? '' : family.document.title;
    bodyEl.innerHTML = `
      <h3 class="form-section-title">Hausstammdaten</h3>
      <div class="form-grid">
        <label class="field">Hausname
          <input name="documentTitle" value="${escapeHtml(title)}" required>
        </label>
        <label class="field">Wappen (Bild-URL)
          <input name="emblem" value="${escapeHtml(family.document.emblem || '')}">
        </label>
        <label class="field">Motto
          <input name="motto" value="${escapeHtml(family.document.motto || '')}">
        </label>
        <label class="field">Rang / Tier-Level
          <select name="rankId" id="tree-generator-rank" required></select>
        </label>
        <section class="house-placement field--wide" data-tree-generator-placement></section>
        <label class="field">Gründungsjahr
          <input name="foundingYear" value="${escapeHtml(profile.foundingYear || '')}" placeholder="????">
        </label>
        <label class="field field--wide">Hausbeschreibung
          <textarea name="description" rows="2">${escapeHtml(family.document.description || '')}</textarea>
        </label>
      </div>
      <h3 class="form-section-title">Ergänzende Angaben <span>optional, sonst Platzhalter</span></h3>
      <div class="form-grid">
        <label class="field">Herkunft ${aiButton('text', 'origin')}
          <input name="origin" value="${escapeHtml(profile.origin || '')}" placeholder="Unbekannt">
        </label>
        <label class="field">Kultur ${aiButton('text', 'culture')}
          <input name="culture" value="${escapeHtml(profile.culture || '')}" placeholder="Nicht festgelegt">
        </label>
        <label class="field">Religion ${aiButton('text', 'religion')}
          <input name="religion" value="${escapeHtml(profile.religion || '')}" placeholder="Nicht festgelegt">
        </label>
        <label class="field">Herrschaft ${aiButton('text', 'governance')}
          <input name="governance" value="${escapeHtml(profile.governance || '')}" placeholder="Unbekannt">
        </label>
        <label class="field">Gründerhaus
          <input name="founderHouseName" value="${escapeHtml(profile.founderHouseName || '')}" placeholder="—">
        </label>
        <label class="field">Hausfarben
          <input name="houseColors" value="${escapeHtml(profile.houseColors || '')}" placeholder="Nicht festgelegt">
        </label>
        <label class="field field--wide">Besonderheiten ${aiButton('text', 'specialTraits')}
          <textarea name="specialTraits" rows="2">${escapeHtml(profile.specialTraits || '')}</textarea>
        </label>
      </div>
    `;
    const rankSelect = form.elements.namedItem('rankId');
    fillHouseRankSelect(rankSelect, family.document.houseProfile?.rankId || 'unknown', {
      requireKnownRank: true
    });
    phaseOnePlacementFields = createHousePlacementFields(
      bodyEl.querySelector('[data-tree-generator-placement]'),
      { rankSelect }
    );
    phaseOnePlacementFields.setFromProfile(family.document.houseProfile, {
      folderPath: family.extensions?.registry?.folderPath || [],
      unclassified: family.extensions?.registry?.unclassified === true
    });
    footerEl.innerHTML = `
      <button class="button" type="button" data-action="tree-generator-commit-phase-1">Weiter zu Gründerpaar</button>
    `;
  }

  function renderPhaseTwo(family) {
    titleEl.textContent = 'Gründerpaar';
    renderSteps(2);
    const profile = (family.extensions && family.extensions.generatorProfile) || {};
    bodyEl.innerHTML = `
      <div class="tree-generator-summary-card">
        <strong>${escapeHtml(family.document.title)}</strong>
        <span>${escapeHtml(family.document.motto || 'Kein Motto')} · ${escapeHtml(profile.culture || 'Kultur unbekannt')}</span>
      </div>
      <h3 class="form-section-title">Gründer</h3>
      <div class="founder-form-card founder-form-card--core">
        <div class="form-grid">
          <label class="field">Name ${aiButton('name-male', 'founderManName')}<input name="founderManName" placeholder="Unbekannter Gründer"></label>
          <label class="field">Titel<input name="founderManTitle" placeholder="Gründer des Hauses"></label>
          <label class="field">Geburt<input name="founderManBirth" placeholder="????"></label>
          <label class="field">Tod<input name="founderManDeath" placeholder="????"></label>
        </div>
      </div>
      <h3 class="form-section-title">Gründerin</h3>
      <div class="founder-form-card founder-form-card--married">
        <div class="form-grid">
          <label class="field">Name ${aiButton('name-female', 'founderWomanName')}<input name="founderWomanName" placeholder="Unbekannte Gründerin"></label>
          <label class="field">Titel<input name="founderWomanTitle" placeholder="Gründerin des Hauses"></label>
          <label class="field">Geburt<input name="founderWomanBirth" placeholder="????"></label>
          <label class="field">Tod<input name="founderWomanDeath" placeholder="????"></label>
        </div>
      </div>
      <div class="form-grid">
        <label class="field">Jahr der Eheschließung ${aiButton('marriage-year', 'marriageYear')}<input name="marriageYear" placeholder="????"></label>
      </div>
    `;
    footerEl.innerHTML = `
      <button class="button" type="button" data-action="tree-generator-commit-phase-2">Gründerpaar anlegen</button>
    `;
  }

  function renderPhaseThree(family, params, automaticState = {}) {
    renderSteps(3);
    if (!automaticState.mode) {
      titleEl.textContent = 'Stammbaum aufbauen';
      bodyEl.innerHTML = `
        <p class="relation-step-lead">Wie möchtest du die neue Gründerfamilie fortsetzen?</p>
        <div class="tree-generator-choice-row">
          <button class="button" type="button" data-action="tree-generator-select-guided-mode">Etappenweise aufbauen</button>
          <button class="button button--quiet" type="button" data-action="tree-generator-select-automatic-mode">Automatische Vorlage erstellen</button>
        </div>
        <p class="relation-step-note">Beide Wege verwenden dieselben Familienregeln. Die Automatik zeigt vor der Übernahme eine reproduzierbare Vorschau.</p>
      `;
      footerEl.innerHTML = '';
      return;
    }
    if (automaticState.mode === 'automatic') {
      renderAutomaticPhaseThree(family, params, automaticState);
      return;
    }
    titleEl.textContent = 'Etappenweise · optionaler Zeitsprung';
    bodyEl.innerHTML = `
      <p class="relation-step-lead">Direkt mit der ersten Kindgeneration beginnen, oder zunächst einen Zeitsprung einfügen?</p>
      <div class="tree-generator-choice-row">
        <button class="button" type="button" data-action="tree-generator-skip-time-jump">Direkt mit erster Kindgeneration beginnen</button>
        <button class="button button--quiet" type="button" data-action="tree-generator-reveal-time-jump">Zeitsprung einfügen …</button>
      </div>
      <div class="form-grid" id="tree-generator-time-jump-fields" hidden>
        <label class="field">Von Jahr<input name="fromYear" placeholder="????"></label>
        <label class="field">Bis Jahr<input name="toYear" placeholder="????"></label>
        <label class="field">Anzahl Jahre<input name="years" type="number" min="0"></label>
        <label class="field field--wide">Bezeichnung<input name="label" placeholder="Nicht einzeln überlieferte Generationen"></label>
        <label class="field field--wide">Notizen<textarea name="notes" rows="2"></textarea></label>
      </div>
    `;
    footerEl.innerHTML = `
      <button class="button button--quiet" type="button" data-action="tree-generator-back-to-mode-choice">Zurück zur Auswahl</button>
      <button class="button" type="button" id="tree-generator-commit-time-jump" data-action="tree-generator-commit-time-jump" hidden>Zeitsprung übernehmen</button>
    `;
  }

  function renderAutomaticPhaseThree(family, params, automaticState) {
    titleEl.textContent = 'Automatische Familienvorlage';
    const options = automaticState.options || {};
    const selectedTemplateId = options.templateId || 'balanced';
    const generationCount = Number(options.generationCount) || 4;
    const seed = options.seed || '';
    const timeJump = options.timeJump || {};
    const preview = automaticState.preview?.summary || null;
    bodyEl.innerHTML = `
      <p class="relation-step-lead">Die Generationenzahl umfasst das vorhandene Gründerpaar. Ein Zeitsprung ist ein Trenner und zählt nicht als eigene Generation.</p>
      <fieldset class="tree-generator-params-group">
        <legend>Vorlage</legend>
        <div class="tree-generator-template-grid">
          ${FAMILY_TEMPLATE_DEFINITIONS.map(template => `
            <label class="tree-generator-template-choice">
              <input type="radio" name="automaticTemplateId" value="${escapeHtml(template.id)}" ${template.id === selectedTemplateId ? 'checked' : ''}>
              <strong>${escapeHtml(template.label)}</strong>
              <span>${escapeHtml(template.description)}</span>
            </label>
          `).join('')}
        </div>
      </fieldset>
      <div class="form-grid">
        <label class="field">Sichtbare Generationen
          <input name="automaticGenerationCount" type="number" value="${escapeHtml(String(generationCount))}" min="${AUTOMATIC_TEMPLATE_GENERATION_LIMITS.minimumGenerations}" max="${AUTOMATIC_TEMPLATE_GENERATION_LIMITS.maximumGenerations}">
        </label>
        <label class="field">Zufalls-Seed
          <input name="automaticSeed" value="${escapeHtml(seed)}" placeholder="z. B. hausname-1">
        </label>
      </div>
      <details class="tree-generator-params">
        <summary>Optionaler Zeitsprung nach dem Gründerwappen</summary>
        <label class="checkbox-field"><input type="checkbox" name="automaticTimeJumpEnabled" ${timeJump.enabled ? 'checked' : ''}> Zeitsprung einfügen</label>
        <div class="form-grid">
          <label class="field">Von Jahr<input name="automaticTimeJumpFromYear" value="${escapeHtml(timeJump.fromYear || '')}" placeholder="wird sonst berechnet"></label>
          <label class="field">Bis Jahr<input name="automaticTimeJumpToYear" value="${escapeHtml(timeJump.toYear || '')}" placeholder="wird sonst berechnet"></label>
          <label class="field">Anzahl Jahre<input name="automaticTimeJumpYears" type="number" min="0" max="10000" value="${escapeHtml(String(timeJump.years ?? 25))}"></label>
          <label class="field field--wide">Bezeichnung<input name="automaticTimeJumpLabel" value="${escapeHtml(timeJump.label || 'Nicht einzeln überlieferte Generationen')}"></label>
        </div>
      </details>
      ${renderParamPanel(params, { automatic: true })}
      ${preview ? `
        <div class="tree-generator-summary-card" data-role="automatic-preview-summary">
          <strong>${escapeHtml(preview.templateLabel)} · ${preview.generationCount} Generationen</strong>
          <span>${preview.personCount} Personen · ${preview.partnershipCount} Verbindungen · ${escapeHtml(preview.fromYear)} bis ${escapeHtml(preview.toYear)}${preview.timeJumpEnabled ? ' · mit Zeitsprung' : ''}</span>
        </div>
        <p class="relation-step-note" data-role="automatic-preview-note">Die Vorschau liegt noch nicht im Stammbaum. Erst „Vorlage übernehmen“ erzeugt einen einzigen lokalen Änderungsschritt.</p>
      ` : ''}
    `;
    footerEl.innerHTML = `
      <button class="button button--quiet" type="button" data-action="tree-generator-back-to-mode-choice">Zurück zur Auswahl</button>
      ${preview
        ? '<button class="button button--quiet" type="button" data-action="tree-generator-reroll-automatic">Neu würfeln</button><button class="button" type="button" data-action="tree-generator-accept-automatic">Vorlage übernehmen</button>'
        : '<button class="button" type="button" data-action="tree-generator-preview-automatic">Vorschau erzeugen</button>'}
    `;
  }

  function revealTimeJumpFields() {
    const fields = bodyEl.querySelector('#tree-generator-time-jump-fields');
    const submit = footerEl.querySelector('#tree-generator-commit-time-jump');
    if (!fields || !submit) return false;
    fields.hidden = false;
    submit.hidden = false;
    fields.querySelector('input')?.focus();
    return true;
  }

  function markAutomaticPreviewStale() {
    const summary = bodyEl.querySelector?.('[data-role="automatic-preview-summary"]');
    const note = bodyEl.querySelector?.('[data-role="automatic-preview-note"]');
    const acceptButton = footerEl.querySelector?.('[data-action="tree-generator-accept-automatic"]');
    const refreshButton = footerEl.querySelector?.('[data-action="tree-generator-reroll-automatic"]');
    if (summary) summary.dataset.previewState = 'stale';
    if (note) {
      note.textContent = 'Optionen wurden geändert. Aktualisiere die Vorschau, bevor du sie übernehmen kannst.';
    }
    if (acceptButton) acceptButton.disabled = true;
    if (refreshButton) {
      refreshButton.dataset.action = 'tree-generator-preview-automatic';
      refreshButton.textContent = 'Vorschau aktualisieren';
    }
    return Boolean(summary || note || acceptButton || refreshButton);
  }

  function personLifeLabel(person) {
    const birth = person.birth || '????';
    const death = person.death || (person.status === 'dead' ? '????' : '');
    return death ? `${birth}–${death}` : `${birth}–lebend`;
  }

  function renderChildForm(leaf, person, params) {
    const lineId = leaf.lineId || `person:${person.id}`;
    const twinAvailable = params.allowTwins && lastAddedChild && lastAddedChild.lineId === lineId;
    const parentIsMage = (person.tags || []).includes('Magier');
    const supportsDirectParentageOptions = !leaf.afterTimeBarrier;
    return `
      <div class="tree-generator-child-form">
        ${supportsDirectParentageOptions ? '' : '<p class="relation-step-note">Hinter einem Zeitsprung wird die Abstammung als später wieder belegte, beanspruchte Linie geführt. Adoption und Unehelichkeit sind für diese Lücke nicht zuverlässig bestimmbar.</p>'}
        ${supportsDirectParentageOptions && parentIsMage && params.considerMageFertility ? `
          <p class="tree-generator-fertility-warning">⚠ ${escapeHtml(person.name)} ist Magier — Magier haben nur ca. 5 % der üblichen Fruchtbarkeit gegenüber Normalsterblichen, Kinder sind eine seltene Ausnahme.</p>
        ` : ''}
        <div class="form-grid">
          <label class="field">Name ${aiButton('name-either', `childName-${lineId}`)}<input name="childName-${escapeHtml(lineId)}" placeholder="???"></label>
          <label class="field">Geschlecht
            <select name="childSex-${escapeHtml(lineId)}">
              <option value="unknown">Unbekannt</option>
              <option value="female">Weiblich</option>
              <option value="male">Männlich</option>
            </select>
          </label>
          <label class="field">Geburt ${aiButton('birth-year', `childBirth-${lineId}`)}<input name="childBirth-${escapeHtml(lineId)}" placeholder="????"></label>
          <label class="field">Tod<input name="childDeath-${escapeHtml(lineId)}" placeholder="????"></label>
          ${params.allowSpecialAging ? `
            <label class="field">Art
              <select name="childAgingKind-${escapeHtml(lineId)}">
                <option value="normal">Normal</option>
                <option value="priester">Priester (altert halb so schnell)</option>
                <option value="magier">Magier (altert bis zu 10× langsamer, ~5 % Fruchtbarkeit)</option>
                <option value="druide">Druide (zeitlos, bis zu 10.000 Jahre)</option>
              </select>
            </label>
          ` : ''}
          ${supportsDirectParentageOptions && params.allowBastards ? `<label class="checkbox-field"><input type="checkbox" name="childBastard-${escapeHtml(lineId)}"> Bastard (unehelich)</label>` : ''}
          ${supportsDirectParentageOptions && params.allowAdoption ? `<label class="checkbox-field"><input type="checkbox" name="childAdoption-${escapeHtml(lineId)}"> Adoptiert</label>` : ''}
          ${twinAvailable ? `<label class="checkbox-field"><input type="checkbox" name="childTwin-${escapeHtml(lineId)}"> Zwilling von ${escapeHtml(lastAddedChild.name)}</label>` : ''}
        </div>
        <div class="tree-generator-child-form-actions">
          <button class="button button--quiet" type="button" data-action="tree-generator-cancel-child" data-person-id="${escapeHtml(person.id)}" data-line-id="${escapeHtml(lineId)}">Abbrechen</button>
          <button class="button" type="button" data-action="tree-generator-add-child" data-person-id="${escapeHtml(person.id)}" data-line-id="${escapeHtml(lineId)}">Kind hinzufügen</button>
        </div>
      </div>
    `;
  }

  function renderParamPanel(params, options = {}) {
    const groups = [];
    PARAMETER_DEFINITIONS
      .filter(definition => !options.automatic || definition.id !== 'autoCalculateBirth')
      .forEach(definition => {
      let group = groups.find(item => item.name === definition.group);
      if (!group) { group = { name: definition.group, rows: [] }; groups.push(group); }
      const value = params[definition.id];
      const control = definition.kind === 'checkbox'
        ? `<input type="checkbox" name="param-${definition.id}" ${value ? 'checked' : ''}>`
        : `<input type="number" name="param-${definition.id}" value="${escapeHtml(String(value ?? ''))}" min="${definition.min ?? 0}" max="${definition.max ?? 10000}">`;
      group.rows.push(`<label class="tree-generator-param">${control} ${escapeHtml(definition.label)}</label>`);
    });
    return `
      <details class="tree-generator-params" open>
        <summary>Regeln für neue Nachkommen</summary>
        <p class="tree-generator-param-note">Hier erscheinen nur Optionen, die das Anlegen in diesem Arbeitsblatt tatsächlich beeinflussen.</p>
        ${groups.map(group => `
          <fieldset class="tree-generator-params-group">
            <legend>${escapeHtml(group.name)}</legend>
            ${group.rows.join('')}
          </fieldset>
        `).join('')}
      </details>
    `;
  }

  function renderPhaseFour(family, phaseInfo, params) {
    titleEl.textContent = phaseInfo.focusedContinuation
      ? phaseInfo.continuationTitle
      : `Nachkommen von Generation ${phaseInfo.generationIndex}`;
    renderSteps(4);
    const worklistCards = phaseInfo.openLeaves.map(leaf => {
      const person = family.persons.find(item => item.id === leaf.personId);
      if (!person) return '';
      const lineId = leaf.lineId || `person:${person.id}`;
      const showChildForm = activeChildFormLineId === lineId;
      return `
        <div class="tree-generator-worklist-card">
          <img src="${escapeHtml(resolvePortraitSource(person))}" alt="">
          <div class="tree-generator-worklist-info">
            <strong>${escapeHtml(person.name)}</strong>
            <small>${escapeHtml(personLifeLabel(person))}${leaf.unresolvedTimeJumpId ? ' · nach Zeitsprung' : ''}</small>
          </div>
          <div class="tree-generator-worklist-actions">
            <button class="button button--quiet" type="button" data-action="tree-generator-toggle-child-form" data-person-id="${escapeHtml(person.id)}" data-line-id="${escapeHtml(lineId)}">${leaf.continuationMode ? '＋ Person / Geschwister' : '＋ Kind'}</button>
            ${leaf.continuationMode ? '' : `
              <button class="button button--quiet" type="button" data-action="tree-generator-delegate-marriage" data-person-id="${escapeHtml(person.id)}">⚭ Ehe/Verlobung</button>
              ${leaf.partnershipId ? `<button class="button button--quiet" type="button" data-action="tree-generator-delegate-cadet" data-person-id="${escapeHtml(person.id)}" data-partnership-id="${escapeHtml(leaf.partnershipId)}">Linie abschließen / Haus verknüpfen</button>` : ''}
            `}
          </div>
          ${showChildForm ? renderChildForm(leaf, person, params) : ''}
        </div>
      `;
    }).join('') || '<p class="tree-generator-empty">Keine offenen Personen in dieser Generation.</p>';

    const continuationCards = (phaseInfo.existingContinuationIds || []).map(personId => {
      const person = family.persons.find(item => item.id === personId);
      if (!person) return '';
      const lineagePartnerships = listLineagePartnerships(family, person.id);
      const unambiguousPartnership = lineagePartnerships.length === 1 ? lineagePartnerships[0] : null;
      return `
        <div class="tree-generator-worklist-card">
          <img src="${escapeHtml(resolvePortraitSource(person))}" alt="">
          <div class="tree-generator-worklist-info"><strong>${escapeHtml(person.name)}</strong><small>${escapeHtml(personLifeLabel(person))}</small></div>
          <div class="tree-generator-worklist-actions">
            <button class="button button--quiet" type="button" data-action="tree-generator-delegate-marriage" data-person-id="${escapeHtml(person.id)}">⚭ Ehe/Verlobung</button>
            ${unambiguousPartnership ? `<button class="button button--quiet" type="button" data-action="tree-generator-delegate-cadet" data-person-id="${escapeHtml(person.id)}" data-partnership-id="${escapeHtml(unambiguousPartnership.id)}">Linie abschließen / Haus verknüpfen</button>` : ''}
          </div>
        </div>
      `;
    }).join('');

    bodyEl.innerHTML = `
      ${renderParamPanel(params)}
      <h3 class="form-section-title">${phaseInfo.focusedContinuation ? 'Ausgangspunkt' : `Personen der Generation ${phaseInfo.generationIndex}`}</h3>
      <div class="tree-generator-worklist">${worklistCards}</div>
      ${phaseInfo.focusedContinuation ? `
        <h3 class="form-section-title">Bereits direkt dieser Linie zugeordnete Personen</h3>
        <div class="tree-generator-worklist">${continuationCards || '<p class="tree-generator-empty">Noch keine Person angelegt. Füge oben nacheinander Einzelpersonen, Geschwister oder anschließend einen Ehepartner hinzu.</p>'}</div>
      ` : ''}
    `;
    footerEl.innerHTML = phaseInfo.focusedContinuation || phaseInfo.canFinish
      ? '<button class="button" type="button" data-action="close-tree-generator">Fertig</button>'
      : `
        <button class="button" type="button" data-action="tree-generator-next-generation" ${phaseInfo.canAdvance ? '' : 'disabled'}>
          ${phaseInfo.canAdvance ? `Generation ${phaseInfo.generationIndex} abschließen → Generation ${phaseInfo.generationIndex + 1}` : 'Zuerst Nachkommen anlegen oder Linien abschließen'}
        </button>
      `;
  }

  function renderPhase(phaseInfo, family, params, automaticState = {}) {
    if (phaseInfo.phase === 1) renderPhaseOne(family);
    else {
      phaseOnePlacementFields?.destroy();
      phaseOnePlacementFields = null;
      if (phaseInfo.phase === 2) renderPhaseTwo(family);
      else if (phaseInfo.phase === 3) renderPhaseThree(family, params, automaticState);
      else renderPhaseFour(family, phaseInfo, params);
    }
  }

  function toggleChildForm(lineId) {
    activeChildFormLineId = activeChildFormLineId === lineId ? '' : lineId;
  }

  function read(section) {
    const values = Object.fromEntries(new FormData(form).entries());
    if (section === 'phase-1') {
      const placement = phaseOnePlacementFields?.read();
      return {
        documentTitle: String(values.documentTitle || '').trim(),
        documentId: String(values.documentTitle || '').trim(),
        emblem: String(values.emblem || '').trim(),
        motto: String(values.motto || '').trim(),
        ...(placement || {}),
        description: String(values.description || '').trim(),
        origin: String(values.origin || '').trim(),
        culture: String(values.culture || '').trim(),
        religion: String(values.religion || '').trim(),
        governance: String(values.governance || '').trim(),
        foundingYear: String(values.foundingYear || '').trim(),
        founderHouseName: String(values.founderHouseName || '').trim(),
        houseColors: String(values.houseColors || '').trim(),
        specialTraits: String(values.specialTraits || '').trim()
      };
    }
    if (section === 'phase-2') {
      return {
        founderManName: String(values.founderManName || '').trim(),
        founderManTitle: String(values.founderManTitle || '').trim(),
        founderManBirth: String(values.founderManBirth || '').trim(),
        founderManDeath: String(values.founderManDeath || '').trim(),
        founderWomanName: String(values.founderWomanName || '').trim(),
        founderWomanTitle: String(values.founderWomanTitle || '').trim(),
        founderWomanBirth: String(values.founderWomanBirth || '').trim(),
        founderWomanDeath: String(values.founderWomanDeath || '').trim(),
        marriageYear: String(values.marriageYear || '').trim()
      };
    }
    if (section === 'phase-3-time-jump') {
      const fromYear = String(values.fromYear || '').trim();
      const toYear = String(values.toYear || '').trim();
      const calculatedYears = /^\d{1,4}$/.test(fromYear) && /^\d{1,4}$/.test(toYear)
        ? Math.max(0, Number(toYear) - Number(fromYear))
        : Number(values.years || 0);
      return {
        fromYear,
        toYear,
        years: calculatedYears,
        label: String(values.label || '').trim(),
        notes: String(values.notes || '').trim()
      };
    }
    if (section === 'automatic-template') {
      return {
        templateId: String(values.automaticTemplateId || 'balanced'),
        generationCount: Number(values.automaticGenerationCount || 4),
        seed: String(values.automaticSeed || '').trim(),
        timeJump: {
          enabled: values.automaticTimeJumpEnabled === 'on',
          fromYear: String(values.automaticTimeJumpFromYear || '').trim(),
          toYear: String(values.automaticTimeJumpToYear || '').trim(),
          years: Number(values.automaticTimeJumpYears || 0),
          label: String(values.automaticTimeJumpLabel || '').trim()
        }
      };
    }
    if (section === 'params') {
      const params = {};
      PARAMETER_DEFINITIONS.forEach(definition => {
        const raw = values[`param-${definition.id}`];
        params[definition.id] = definition.kind === 'checkbox' ? raw === 'on' : Number(raw || 0);
      });
      return params;
    }
    if (typeof section === 'object' && section?.childOf) {
      const personId = section.childOf;
      const lineId = section.lineId || personId;
      return {
        referencePersonId: personId,
        name: String(values[`childName-${lineId}`] || '').trim(),
        sex: values[`childSex-${lineId}`] || 'unknown',
        birth: String(values[`childBirth-${lineId}`] || '').trim(),
        death: String(values[`childDeath-${lineId}`] || '').trim(),
        agingKind: values[`childAgingKind-${lineId}`] || 'normal',
        bastard: values[`childBastard-${lineId}`] === 'on',
        adoption: values[`childAdoption-${lineId}`] === 'on',
        twin: values[`childTwin-${lineId}`] === 'on'
      };
    }
    return {};
  }

  return Object.freeze({
    dialog,
    form,
    open,
    close,
    renderPhase,
    revealTimeJumpFields,
    markAutomaticPreviewStale,
    read,
    toggleChildForm,
    setLastAddedChild,
    getLastAddedChild: () => lastAddedChild ? { ...lastAddedChild } : null,
    clearActiveChildForm: () => { activeChildFormLineId = ''; }
  });
}
