import { ALERIA_CURRENT_YEAR } from '../config/chronology.js';
import { resolvePortraitSource } from '../config/portrait-placeholders.js';
import { listFamilyRecords } from '../services/family-library.js';
import { escapeHtml } from './dom.js';

const PARTNER_ACTIONS = new Set(['marry', 'betroth', 'import-ward']);

const ACTION_DEFINITIONS = Object.freeze([
  {
    id: 'marry',
    group: 'Bund & Ehe',
    glyph: '⚭',
    label: 'Verheiraten',
    hint: 'Ehe mit einer Person aus diesem Baum, dem Register oder einer neuen Person schließen'
  },
  {
    id: 'betroth',
    group: 'Bund & Ehe',
    glyph: '⚯',
    label: 'Verloben',
    hint: 'Verlöbnis mit einer Person aus diesem Baum, dem Register oder einer neuen Person'
  },
  {
    id: 'upgrade-engagement',
    group: 'Bund & Ehe',
    glyph: '✽',
    label: 'Verlobung in Ehe wandeln',
    hint: 'Ein bestehendes Verlöbnis wird zur Ehe',
    requires: 'engagement'
  },
  {
    id: 'divorce',
    group: 'Bund & Ehe',
    glyph: '⚮',
    label: 'Verbindung lösen',
    hint: 'Eine bestehende Ehe scheiden oder ein Verlöbnis auflösen',
    requires: 'partnership'
  },
  {
    id: 'beget-child',
    group: 'Familie & Obhut',
    glyph: '✚',
    label: 'Kind zeugen',
    hint: 'Neues leibliches Kind dieser Person anlegen'
  },
  {
    id: 'adopt',
    group: 'Familie & Obhut',
    glyph: '❦',
    label: 'Adoptieren',
    hint: 'Neues Adoptivkind dieser Person anlegen'
  },
  {
    id: 'add-parent',
    group: 'Familie & Obhut',
    glyph: '☩',
    label: 'Elternteil ergänzen',
    hint: 'Neues Elternteil über dieser Person anlegen'
  },
  {
    id: 'import-ward',
    group: 'Familie & Obhut',
    glyph: '⇠',
    label: 'Mündel aufnehmen',
    hint: 'Eine Person als Mündel in die Obhut dieser Person geben'
  },
  {
    id: 'send-ward',
    group: 'Familie & Obhut',
    glyph: '⇢',
    label: 'Als Mündel wegschicken',
    hint: 'Diese Person einem anderen Haus des Registers als Mündel anvertrauen'
  },
  {
    id: 'die',
    group: 'Leben & Stand',
    glyph: '✝',
    label: 'Sterben lassen',
    hint: 'Todesjahr eintragen und die Person als verstorben führen',
    requires: 'not-dead'
  },
  {
    id: 'revive',
    group: 'Leben & Stand',
    glyph: '❁',
    label: 'Wiederbeleben',
    hint: 'Todesdatum entfernen und die Person wieder als lebend führen',
    requires: 'dead'
  },
  {
    id: 'legitimize',
    group: 'Leben & Stand',
    glyph: '◆',
    label: 'Legitimieren',
    hint: 'Uneheliche Abstammung dieser Person legitimieren',
    requires: 'non-legitimate'
  },
  {
    id: 'marry-away',
    group: 'Erweitert',
    glyph: '➳',
    label: 'Wegverheiraten (Wappenknoten)',
    hint: 'Wappen-Medaillon der wegverheirateten Linie unter der Ehe anlegen',
    requires: 'partnership'
  },
  {
    id: 'add-related',
    group: 'Erweitert',
    glyph: '✦',
    label: 'Neue Person mit freier Beziehung',
    hint: 'Voller Dialog für alle Beziehungs- und Abstammungsarten'
  },
  {
    id: 'link-existing',
    group: 'Erweitert',
    glyph: '∞',
    label: 'Bestehende Personen verknüpfen',
    hint: 'Zwei vorhandene Personen frei verbinden (auch Affäre, politisch, erzwungen …)'
  }
]);

function partnershipTypeLabel(type) {
  if (type === 'marriage') return 'Ehe';
  if (type === 'engagement') return 'Verlöbnis';
  if (type === 'affair') return 'Affäre';
  if (type === 'forced') return 'Erzwungene Verbindung';
  return 'Verbindung';
}

export function createRelationActionsDialog(documentRef = document, runtime = globalThis) {
  const dialog = documentRef.getElementById('relation-actions-dialog');
  const form = documentRef.getElementById('relation-actions-form');
  const hero = documentRef.getElementById('relation-actions-hero');
  const menu = documentRef.getElementById('relation-actions-menu');
  const step = documentRef.getElementById('relation-actions-step');
  const footer = documentRef.getElementById('relation-actions-footer');
  const submitButton = documentRef.getElementById('relation-actions-submit');
  let context = null;

  function personById(personId) {
    return context?.family.persons.find(person => person.id === personId) || null;
  }

  function partnerName(partnership, personId) {
    const otherId = partnership.participantIds.find(id => id !== personId);
    return personById(otherId)?.name || 'Unbekannt';
  }

  function availability(person) {
    const partnerships = context.family.partnerships.filter(partnership => (
      partnership.participantIds.includes(person.id)
    ));
    const engagements = partnerships.filter(partnership => partnership.type === 'engagement' && partnership.status === 'active');
    const separable = partnerships.filter(partnership => ['active', 'secret'].includes(partnership.status));
    const nonLegitimate = context.family.parentages.filter(parentage => (
      parentage.childId === person.id && !['legitimate', 'legitimized'].includes(parentage.legitimacy)
    ));
    return {
      engagement: engagements.length > 0,
      partnership: partnerships.length > 0,
      separable: separable.length > 0,
      dead: person.status === 'dead' || Boolean(person.death),
      'not-dead': person.status !== 'dead',
      'non-legitimate': nonLegitimate.length > 0,
      partnerships,
      engagements,
      separable_list: separable,
      nonLegitimate
    };
  }

  function renderHero(person) {
    const house = context.family.houses.find(item => item.id === person.houseId);
    const life = [person.birth || '????', person.death || (person.status === 'dead' ? '????' : 'lebend')].join(' – ');
    hero.innerHTML = `
      <img class="relation-actions-portrait" src="${escapeHtml(resolvePortraitSource(person))}" alt="">
      <div>
        <p class="eyebrow">Beziehung modifizieren</p>
        <h2>${escapeHtml(person.name)}</h2>
        <p class="relation-actions-life">${escapeHtml(person.title || house?.name || 'Ohne Haus')} · ${escapeHtml(life)}</p>
      </div>
    `;
  }

  function renderMenu(person) {
    const available = availability(person);
    const groups = [];
    ACTION_DEFINITIONS.forEach(definition => {
      let group = groups.find(item => item.name === definition.group);
      if (!group) {
        group = { name: definition.group, cards: [] };
        groups.push(group);
      }
      const enabled = !definition.requires || available[definition.requires];
      group.cards.push(`
        <button class="relation-action-card" type="button"
          data-action="relation-action" data-relation-action="${definition.id}" ${enabled ? '' : 'disabled'}>
          <span class="relation-action-glyph" aria-hidden="true">${definition.glyph}</span>
          <span class="relation-action-text">
            <strong>${escapeHtml(definition.label)}</strong>
            <small>${escapeHtml(definition.hint)}</small>
          </span>
        </button>
      `);
    });
    menu.innerHTML = groups.map(group => `
      <section class="relation-action-group">
        <h3 class="relation-action-group-title">${escapeHtml(group.name)}</h3>
        <div class="relation-action-group-grid">${group.cards.join('')}</div>
      </section>
    `).join('');
    menu.hidden = false;
    step.hidden = true;
    footer.hidden = true;
    step.replaceChildren();
  }

  function registryOptions(excludeCurrentFamily) {
    const currentId = context.family.document.id;
    return listFamilyRecords(runtime.localStorage)
      .filter(record => record.family.persons.length > 0)
      .filter(record => !excludeCurrentFamily || record.id !== currentId)
      .map(record => `<option value="${escapeHtml(record.id)}">${escapeHtml(record.title)} · ${record.family.persons.length} Personen</option>`)
      .join('');
  }

  function treePartnerOptions(person) {
    return context.family.persons
      .filter(candidate => candidate.id !== person.id)
      .map(candidate => `<option value="${escapeHtml(candidate.id)}">${escapeHtml(candidate.name)}${candidate.birth ? ` (${escapeHtml(candidate.birth)})` : ''}</option>`)
      .join('');
  }

  function renderPartnerStep(person, action) {
    const verb = action === 'marry' ? 'Ehepartner' : action === 'betroth' ? 'Verlobte Person' : 'Mündel';
    step.innerHTML = `
      <p class="relation-step-lead">${escapeHtml(verb)} wählen:</p>
      <label class="field">Quelle
        <select name="partnerSource">
          <option value="registry">Aus einem Haus des Familienregisters</option>
          <option value="tree">Aus diesem Stammbaum</option>
          <option value="new">Neue Person anlegen …</option>
        </select>
      </label>
      <div data-partner-source="registry">
        <label class="field">Haus / Familienakte
          <select name="registryFamilyId">${registryOptions(false)}</select>
        </label>
        <label class="field">Person
          <select name="registryPersonId"></select>
        </label>
      </div>
      <div data-partner-source="tree" hidden>
        <label class="field">Person aus diesem Baum
          <select name="partnerPersonId">${treePartnerOptions(person)}</select>
        </label>
      </div>
      <div data-partner-source="new" hidden>
        <p class="relation-step-note">Es öffnet sich der Dialog „Neue Person mit Beziehung“ mit passender Voreinstellung.</p>
      </div>
    `;
    syncPartnerSource();
    populateRegistryPersons();
  }

  function renderDeathStep(person) {
    step.innerHTML = `
      <p class="relation-step-lead">${escapeHtml(person.name)} sterben lassen:</p>
      <label class="field">Todesjahr
        <input name="deathYear" value="${ALERIA_CURRENT_YEAR}" maxlength="8" autocomplete="off">
      </label>
      <label class="relation-step-checkbox"><input type="checkbox" name="deathUnknown"> Jahr unbekannt („????“)</label>
    `;
  }

  function renderSendWardStep(person) {
    step.innerHTML = `
      <p class="relation-step-lead">${escapeHtml(person.name)} als Mündel wegschicken:</p>
      <label class="field">Zielhaus im Familienregister
        <select name="targetFamilyId">${registryOptions(true)}</select>
      </label>
      <p class="relation-step-note">Die Person erhält hier den Vermerk als weggegebenes Mündel. Im Stammbaum des Zielhauses kann sie anschließend über „Mündel aufnehmen“ eingebunden werden.</p>
    `;
  }

  function renderPartnershipStep(person, action) {
    const available = availability(person);
    const candidates = action === 'upgrade-engagement' ? available.engagements : available.separable_list;
    step.innerHTML = `
      <p class="relation-step-lead">${action === 'upgrade-engagement' ? 'Welches Verlöbnis wird zur Ehe?' : 'Welche Verbindung wird gelöst?'}</p>
      <label class="field">Verbindung
        <select name="partnershipId">
          ${candidates.map(partnership => `
            <option value="${escapeHtml(partnership.id)}">
              ${escapeHtml(partnershipTypeLabel(partnership.type))} mit ${escapeHtml(partnerName(partnership, person.id))}
            </option>
          `).join('')}
        </select>
      </label>
    `;
  }

  function syncPartnerSource() {
    const source = form.elements.namedItem('partnerSource')?.value || 'registry';
    step.querySelectorAll('[data-partner-source]').forEach(container => {
      container.hidden = container.dataset.partnerSource !== source;
      container.querySelectorAll('select,input').forEach(field => {
        field.disabled = container.hidden;
      });
    });
  }

  function populateRegistryPersons() {
    const familySelect = form.elements.namedItem('registryFamilyId');
    const personSelect = form.elements.namedItem('registryPersonId');
    if (!familySelect || !personSelect) return;
    const record = listFamilyRecords(runtime.localStorage).find(item => item.id === familySelect.value);
    personSelect.replaceChildren();
    (record?.family.persons || []).forEach(person => {
      const life = person.birth ? ` (${person.birth}${person.death ? `–${person.death}` : ''})` : '';
      personSelect.add(new Option(`${person.name}${life}`, person.id));
    });
  }

  function open(person, family) {
    context = { family, personId: person.id };
    form.reset();
    form.elements.namedItem('personId').value = person.id;
    form.elements.namedItem('relationAction').value = '';
    renderHero(person);
    renderMenu(person);
    if (!dialog.open) dialog.showModal();
  }

  function showStep(actionId) {
    const person = personById(context.personId);
    if (!person) throw new Error('Die Person wurde nicht gefunden.');
    form.elements.namedItem('relationAction').value = actionId;
    if (PARTNER_ACTIONS.has(actionId)) renderPartnerStep(person, actionId);
    else if (actionId === 'die') renderDeathStep(person);
    else if (actionId === 'send-ward') renderSendWardStep(person);
    else if (actionId === 'divorce' || actionId === 'upgrade-engagement') renderPartnershipStep(person, actionId);
    else return false;
    const definition = ACTION_DEFINITIONS.find(item => item.id === actionId);
    submitButton.textContent = definition ? definition.label : 'Übernehmen';
    menu.hidden = true;
    step.hidden = false;
    footer.hidden = false;
    return true;
  }

  function showMenu() {
    const person = personById(context?.personId);
    if (person) renderMenu(person);
  }

  function read() {
    const values = Object.fromEntries(new FormData(form).entries());
    return {
      action: values.relationAction,
      personId: values.personId,
      partnerSource: values.partnerSource || '',
      partnerPersonId: values.partnerPersonId || '',
      registryFamilyId: values.registryFamilyId || '',
      registryPersonId: values.registryPersonId || '',
      deathYear: String(values.deathYear || '').trim(),
      deathUnknown: Boolean(values.deathUnknown),
      targetFamilyId: values.targetFamilyId || '',
      partnershipId: values.partnershipId || ''
    };
  }

  form.addEventListener('change', event => {
    if (event.target.name === 'partnerSource') syncPartnerSource();
    if (event.target.name === 'registryFamilyId') populateRegistryPersons();
  });

  return Object.freeze({
    dialog,
    form,
    open,
    close: () => dialog.close(),
    showStep,
    showMenu,
    read,
    getPersonId: () => context?.personId || ''
  });
}
