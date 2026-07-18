import {
  ALERIA_CURRENT_YEAR,
  DEFAULT_CHILDBEARING_AGE,
  DEFAULT_LIFESPAN_YEARS,
  DEFAULT_MARRIAGE_AGE
} from '../config/chronology.js';
import { PORTRAIT_PLACEHOLDERS, resolvePortraitSource } from '../config/portrait-placeholders.js';
import { fillHouseRankSelect } from './house-profile-fields.js';
import { escapeHtml } from './dom.js';

// Deckt die vom User vorgegebene Parameterliste 1:1 ab. "wired: true" beeinflusst
// die Generierung in dieser Ausbaustufe bereits tatsächlich; "wired: false" ist
// bewusst nur vorbereitetes Gerüst für eine spätere Ausbaustufe (siehe Plan).
export const PARAMETER_DEFINITIONS = Object.freeze([
  { id: 'minChildren', group: 'Familienstruktur', label: 'Mindestanzahl Kinder', kind: 'number', wired: true, defaultValue: 1 },
  { id: 'maxChildren', group: 'Familienstruktur', label: 'Maximalanzahl Kinder', kind: 'number', wired: true, defaultValue: 4 },
  { id: 'allowTwins', group: 'Familienstruktur', label: 'Zwillinge erlauben', kind: 'checkbox', wired: true, defaultValue: true },
  { id: 'allowAdoption', group: 'Familienstruktur', label: 'Adoptionen erlauben', kind: 'checkbox', wired: true, defaultValue: true },
  { id: 'allowBastards', group: 'Familienstruktur', label: 'Bastarde erlauben', kind: 'checkbox', wired: true, defaultValue: true },
  { id: 'allowAffairs', group: 'Familienstruktur', label: 'Affären erlauben', kind: 'checkbox', wired: false, defaultValue: false },
  { id: 'allowMultipleMarriages', group: 'Familienstruktur', label: 'Mehrfache Ehen erlauben', kind: 'checkbox', wired: true, defaultValue: true },
  { id: 'allowRemarriage', group: 'Familienstruktur', label: 'Wiederverheiratung erlauben', kind: 'checkbox', wired: true, defaultValue: true },
  { id: 'allowChildlessMarriage', group: 'Familienstruktur', label: 'Kinderlose Ehe erlauben', kind: 'checkbox', wired: true, defaultValue: true },
  { id: 'allowLineExtinction', group: 'Familienstruktur', label: 'Aussterben einer Linie erlauben', kind: 'checkbox', wired: true, defaultValue: true },
  { id: 'earlyDeath', group: 'Lebensereignisse', label: 'Früher Tod', kind: 'checkbox', wired: false },
  { id: 'warCasualties', group: 'Lebensereignisse', label: 'Kriegstote', kind: 'checkbox', wired: false },
  { id: 'diseases', group: 'Lebensereignisse', label: 'Krankheiten', kind: 'checkbox', wired: false },
  { id: 'murders', group: 'Lebensereignisse', label: 'Ermordungen', kind: 'checkbox', wired: false },
  { id: 'disappearances', group: 'Lebensereignisse', label: 'Verschwundene Personen', kind: 'checkbox', wired: false },
  { id: 'disinheritance', group: 'Lebensereignisse', label: 'Enterbungen', kind: 'checkbox', wired: false },
  { id: 'houseFoundings', group: 'Lebensereignisse', label: 'Hausgründungen', kind: 'checkbox', wired: false },
  { id: 'houseChanges', group: 'Lebensereignisse', label: 'Hauswechsel', kind: 'checkbox', wired: false },
  { id: 'dynastyChanges', group: 'Lebensereignisse', label: 'Dynastiewechsel', kind: 'checkbox', wired: false },
  { id: 'inheritTitles', group: 'Adel', label: 'Titel vererben', kind: 'checkbox', wired: false },
  { id: 'loseTitles', group: 'Adel', label: 'Titel verlieren', kind: 'checkbox', wired: false },
  { id: 'enfeoffments', group: 'Adel', label: 'Belehnungen', kind: 'checkbox', wired: false },
  { id: 'changeFealty', group: 'Adel', label: 'Lehnstreue ändern', kind: 'checkbox', wired: false },
  { id: 'changeCrest', group: 'Adel', label: 'Wappen ändern', kind: 'checkbox', wired: false },
  { id: 'changeMotto', group: 'Adel', label: 'Hausmotto ändern', kind: 'checkbox', wired: false },
  { id: 'marriageAge', group: 'Zeit', label: 'Durchschnittliches Heiratsalter', kind: 'number', wired: true, defaultValue: DEFAULT_MARRIAGE_AGE },
  { id: 'childbearingAge', group: 'Zeit', label: 'Durchschnittliches Gebäralter', kind: 'number', wired: true, defaultValue: DEFAULT_CHILDBEARING_AGE },
  { id: 'lifespan', group: 'Zeit', label: 'Durchschnittliche Lebensdauer', kind: 'number', wired: true, defaultValue: DEFAULT_LIFESPAN_YEARS },
  { id: 'timeJumpAfterGeneration', group: 'Zeit', label: 'Zeitsprung nach Generation', kind: 'number', wired: true, defaultValue: 0 },
  { id: 'autoCalculateYearGaps', group: 'Zeit', label: 'Jahresabstände automatisch berechnen', kind: 'checkbox', wired: false },
  { id: 'autoGenerateNames', group: 'KI-Unterstützung', label: 'Namen automatisch erzeugen', kind: 'checkbox', wired: true, defaultValue: false },
  { id: 'autoCalculateBirth', group: 'KI-Unterstützung', label: 'Geburtsdaten berechnen', kind: 'checkbox', wired: true, defaultValue: false },
  { id: 'autoCalculateDeath', group: 'KI-Unterstützung', label: 'Sterbedaten berechnen', kind: 'checkbox', wired: true, defaultValue: false },
  { id: 'autoPlausibilizeRelationships', group: 'KI-Unterstützung', label: 'Beziehungen automatisch plausibilisieren', kind: 'checkbox', wired: false },
  { id: 'autoFillMissingData', group: 'KI-Unterstützung', label: 'Fehlende Daten ergänzen', kind: 'checkbox', wired: false },
  { id: 'usePlaceholders', group: 'KI-Unterstützung', label: 'Platzhalter verwenden', kind: 'checkbox', wired: true, defaultValue: true },
  { id: 'allowSpecialAging', group: 'Sonderarten', label: 'Priester/Magier/Druiden-Alterung erlauben', kind: 'checkbox', wired: true, defaultValue: true },
  { id: 'considerMageFertility', group: 'Sonderarten', label: 'Magier-Fruchtbarkeit berücksichtigen (~5 % gegenüber Normalsterblichen)', kind: 'checkbox', wired: true, defaultValue: true }
]);

const STEP_LABELS = ['Familiendaten', 'Gründerpaar', 'Zeitsprung', 'Generationen'];

export function defaultParams() {
  const params = {};
  PARAMETER_DEFINITIONS.forEach(definition => {
    params[definition.id] = definition.defaultValue ?? (definition.kind === 'checkbox' ? false : '');
  });
  return params;
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
  let activeChildFormPersonId = '';
  let lastAddedChild = null;

  // Der Dialog hat bewusst keinen type="submit"-Button (jede Etappe hat mehrere,
  // ungleichwertige Aktionen) — Enter in einem Textfeld soll trotzdem nie ein
  // implizites Formular-Submit auslösen und den Dialog per "method=dialog" schließen.
  form.addEventListener('keydown', event => {
    if (event.key === 'Enter' && event.target instanceof HTMLInputElement) {
      event.preventDefault();
    }
  });

  function open() {
    if (!dialog.open) dialog.showModal();
  }

  function close() {
    activeChildFormPersonId = '';
    lastAddedChild = null;
    if (dialog.open) dialog.close();
  }

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
        <label class="field">Adelstitel
          <select name="rankId" id="tree-generator-rank"></select>
        </label>
        <label class="field">Stammsitz
          <input name="seat" value="${escapeHtml(family.document.houseProfile?.seat || '')}" placeholder="Unbekannt">
        </label>
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
    fillHouseRankSelect(form.elements.namedItem('rankId'), family.document.houseProfile?.rankId || 'unknown');
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

  function renderPhaseThree() {
    titleEl.textContent = 'Optionaler Zeitsprung';
    renderSteps(3);
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
      <button class="button" type="button" id="tree-generator-commit-time-jump" data-action="tree-generator-commit-time-jump" hidden>Zeitsprung übernehmen</button>
    `;
    bodyEl.querySelector('[data-action="tree-generator-reveal-time-jump"]').addEventListener('click', () => {
      bodyEl.querySelector('#tree-generator-time-jump-fields').hidden = false;
      footerEl.querySelector('#tree-generator-commit-time-jump').hidden = false;
    });
  }

  function personLifeLabel(person) {
    const birth = person.birth || '????';
    const death = person.death || (person.status === 'dead' ? '????' : '');
    return death ? `${birth}–${death}` : `${birth}–lebend`;
  }

  function renderChildForm(person, params) {
    const twinAvailable = params.allowTwins && lastAddedChild && lastAddedChild.referencePersonId === person.id;
    const parentIsMage = (person.tags || []).includes('Magier');
    return `
      <div class="tree-generator-child-form">
        ${parentIsMage && params.considerMageFertility ? `
          <p class="tree-generator-fertility-warning">⚠ ${escapeHtml(person.name)} ist Magier — Magier haben nur ca. 5 % der üblichen Fruchtbarkeit gegenüber Normalsterblichen, Kinder sind eine seltene Ausnahme.</p>
        ` : ''}
        <div class="form-grid">
          <label class="field">Name ${aiButton('name-either', `childName-${person.id}`)}<input name="childName-${person.id}" placeholder="???"></label>
          <label class="field">Geschlecht
            <select name="childSex-${person.id}">
              <option value="unknown">Unbekannt</option>
              <option value="female">Weiblich</option>
              <option value="male">Männlich</option>
            </select>
          </label>
          <label class="field">Geburt ${aiButton('birth-year', `childBirth-${person.id}`)}<input name="childBirth-${person.id}" placeholder="????"></label>
          <label class="field">Tod<input name="childDeath-${person.id}" placeholder="????"></label>
          ${params.allowSpecialAging ? `
            <label class="field">Art
              <select name="childAgingKind-${person.id}">
                <option value="normal">Normal</option>
                <option value="priester">Priester (altert halb so schnell)</option>
                <option value="magier">Magier (altert bis zu 10× langsamer, ~5 % Fruchtbarkeit)</option>
                <option value="druide">Druide (zeitlos, bis zu 10.000 Jahre)</option>
              </select>
            </label>
          ` : ''}
          ${params.allowBastards ? `<label class="checkbox-field"><input type="checkbox" name="childBastard-${person.id}"> Bastard (unehelich)</label>` : ''}
          ${params.allowAdoption ? `<label class="checkbox-field"><input type="checkbox" name="childAdoption-${person.id}"> Adoptiert</label>` : ''}
          ${twinAvailable ? `<label class="checkbox-field"><input type="checkbox" name="childTwin-${person.id}"> Zwilling von ${escapeHtml(lastAddedChild.name)}</label>` : ''}
        </div>
        <div class="tree-generator-child-form-actions">
          <button class="button button--quiet" type="button" data-action="tree-generator-cancel-child" data-person-id="${escapeHtml(person.id)}">Abbrechen</button>
          <button class="button" type="button" data-action="tree-generator-add-child" data-person-id="${escapeHtml(person.id)}">Kind hinzufügen</button>
        </div>
      </div>
    `;
  }

  function renderParamPanel(params) {
    const groups = [];
    PARAMETER_DEFINITIONS.forEach(definition => {
      let group = groups.find(item => item.name === definition.group);
      if (!group) { group = { name: definition.group, rows: [] }; groups.push(group); }
      const value = params[definition.id];
      const inert = definition.wired ? '' : ' tree-generator-param--inert';
      const suffix = definition.wired ? '' : ' <small>· in Vorbereitung</small>';
      const control = definition.kind === 'checkbox'
        ? `<input type="checkbox" name="param-${definition.id}" ${value ? 'checked' : ''}>`
        : `<input type="number" name="param-${definition.id}" value="${escapeHtml(String(value ?? ''))}" min="0">`;
      group.rows.push(`<label class="tree-generator-param${inert}">${control} ${escapeHtml(definition.label)}${suffix}</label>`);
    });
    return `
      <details class="tree-generator-params">
        <summary>Parameter dieser Generation</summary>
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
    titleEl.textContent = `Generation ${phaseInfo.generationIndex}`;
    renderSteps(4);
    const worklistCards = phaseInfo.openLeaves.map(leaf => {
      const person = family.persons.find(item => item.id === leaf.personId);
      if (!person) return '';
      const showChildForm = activeChildFormPersonId === person.id;
      return `
        <div class="tree-generator-worklist-card">
          <img src="${escapeHtml(resolvePortraitSource(person))}" alt="">
          <div class="tree-generator-worklist-info">
            <strong>${escapeHtml(person.name)}</strong>
            <small>${escapeHtml(personLifeLabel(person))}${leaf.unresolvedTimeJumpId ? ' · nach Zeitsprung' : ''}</small>
          </div>
          <div class="tree-generator-worklist-actions">
            <button class="button button--quiet" type="button" data-action="tree-generator-toggle-child-form" data-person-id="${escapeHtml(person.id)}">＋ Kind</button>
            <button class="button button--quiet" type="button" data-action="tree-generator-delegate-marriage" data-person-id="${escapeHtml(person.id)}">⚭ Ehe/Verlobung</button>
            <button class="button button--quiet" type="button" data-action="tree-generator-delegate-cadet" data-person-id="${escapeHtml(person.id)}">Kadettenhaus/Aussterben …</button>
          </div>
          ${showChildForm ? renderChildForm(person, params) : ''}
        </div>
      `;
    }).join('') || '<p class="tree-generator-empty">Keine offenen Personen in dieser Generation.</p>';

    bodyEl.innerHTML = `
      ${renderParamPanel(params)}
      <h3 class="form-section-title">Offene Personen dieser Generation</h3>
      <div class="tree-generator-worklist">${worklistCards}</div>
    `;
    footerEl.innerHTML = `
      <button class="button" type="button" data-action="tree-generator-next-generation">Diese Generation abschließen → nächste Generation</button>
    `;
  }

  function renderPhase(phaseInfo, family, params) {
    if (phaseInfo.phase === 1) renderPhaseOne(family);
    else if (phaseInfo.phase === 2) renderPhaseTwo(family);
    else if (phaseInfo.phase === 3) renderPhaseThree(family);
    else renderPhaseFour(family, phaseInfo, params);
  }

  function toggleChildForm(personId) {
    activeChildFormPersonId = activeChildFormPersonId === personId ? '' : personId;
  }

  function read(section) {
    const values = Object.fromEntries(new FormData(form).entries());
    if (section === 'phase-1') {
      return {
        documentTitle: String(values.documentTitle || '').trim(),
        documentId: String(values.documentTitle || '').trim(),
        emblem: String(values.emblem || '').trim(),
        motto: String(values.motto || '').trim(),
        rankId: String(values.rankId || 'unknown'),
        seat: String(values.seat || '').trim(),
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
      return {
        fromYear: String(values.fromYear || '').trim(),
        toYear: String(values.toYear || '').trim(),
        years: Number(values.years || 0),
        label: String(values.label || '').trim(),
        notes: String(values.notes || '').trim()
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
      return {
        referencePersonId: personId,
        name: String(values[`childName-${personId}`] || '').trim(),
        sex: values[`childSex-${personId}`] || 'unknown',
        birth: String(values[`childBirth-${personId}`] || '').trim(),
        death: String(values[`childDeath-${personId}`] || '').trim(),
        agingKind: values[`childAgingKind-${personId}`] || 'normal',
        bastard: values[`childBastard-${personId}`] === 'on',
        adoption: values[`childAdoption-${personId}`] === 'on',
        twin: values[`childTwin-${personId}`] === 'on'
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
    read,
    toggleChildForm,
    setLastAddedChild,
    clearActiveChildForm: () => { activeChildFormPersonId = ''; }
  });
}
