import { ALERIA_CURRENT_YEAR } from '../config/chronology.js';
import { resolvePortraitSource } from '../config/portrait-placeholders.js';
import { listLineagePartnerships } from '../modules/relationships/lineage-partnership-policy.js';
import { listFamilyRecords } from '../services/family-library.js';
import { escapeHtml } from './dom.js';

const PARTNER_ACTIONS = new Set(['marry', 'betroth', 'import-ward']);

const ACTION_DEFINITIONS = Object.freeze([
  {
    id: 'marry',
    group: 'Bund & Ehe',
    glyph: '⚭',
    label: 'Einheiraten / wegverheiraten',
    hint: 'Eine Ehe anlegen und bei Registerpersonen automatisch in beiden Stammbäumen spiegeln'
  },
  {
    id: 'betroth',
    group: 'Bund & Ehe',
    glyph: '⚯',
    label: 'Verloben',
    hint: 'Ein Verlöbnis anlegen; ersetzbare Platzhalter werden dabei sauber ausgetauscht'
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
    requires: 'separable'
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
    label: 'Zielhaus als Wappenknoten',
    hint: 'Optional ein Medaillon für die wegverheiratete Linie unter einer bestehenden Ehe anlegen',
    requires: 'lineage-partnership'
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
  if (type === 'union') return 'Lebensgemeinschaft';
  if (type === 'affair') return 'Affäre';
  if (type === 'forced') return 'Erzwungene Verbindung';
  return 'Verbindung';
}

function partnershipStatusLabel(status) {
  if (status === 'active') return 'aktiv';
  if (status === 'secret') return 'geheim';
  if (status === 'widowed') return 'verwitwet';
  if (status === 'divorced') return 'geschieden';
  if (status === 'ended') return 'beendet';
  return status || 'Status unbekannt';
}

export function createRelationActionsDialog(
  documentRef = document,
  runtime = globalThis,
  latestLocalFamilySource = null
) {
  const dialog = documentRef.getElementById('relation-actions-dialog');
  const form = documentRef.getElementById('relation-actions-form');
  const hero = documentRef.getElementById('relation-actions-hero');
  const menu = documentRef.getElementById('relation-actions-menu');
  const step = documentRef.getElementById('relation-actions-step');
  const footer = documentRef.getElementById('relation-actions-footer');
  const submitButton = documentRef.getElementById('relation-actions-submit');
  let context = null;
  const listAvailableFamilyRecords = () => latestLocalFamilySource?.listRecords?.()
    || listFamilyRecords(runtime.localStorage);

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
    const separable = partnerships.filter(partnership => (
      ['marriage', 'engagement', 'union'].includes(partnership.type)
      && ['active', 'secret'].includes(partnership.status)
    ));
    const lineagePartnerships = listLineagePartnerships(context.family, person.id);
    const nonLegitimate = context.family.parentages.filter(parentage => (
      parentage.childId === person.id && !['legitimate', 'legitimized'].includes(parentage.legitimacy)
    ));
    return {
      engagement: engagements.length > 0,
      partnership: partnerships.length > 0,
      'lineage-partnership': lineagePartnerships.length > 0,
      separable: separable.length > 0,
      dead: person.status === 'dead' || Boolean(person.death),
      'not-dead': person.status !== 'dead',
      'non-legitimate': nonLegitimate.length > 0,
      partnerships,
      engagements,
      separable_list: separable,
      lineage_partnerships: lineagePartnerships,
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
    return listAvailableFamilyRecords()
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
    const otherFamilyOptions = registryOptions(true);
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
          <select name="registryFamilyId">${otherFamilyOptions || '<option value="">Kein anderes Haus gespeichert</option>'}</select>
        </label>
        <label class="field">Person
          <select name="registryPersonId"></select>
        </label>
        ${action === 'marry' || action === 'betroth' ? '<p class="relation-step-note">Registerverbindungen werden in beiden Familienakten gespeichert. Im jeweiligen Heimatbaum bleibt die eigene Person Kernfamilie; die andere Person erscheint eingeheiratet.</p>' : ''}
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
    const candidates = action === 'upgrade-engagement'
      ? available.engagements
      : action === 'marry-away'
        ? available.lineage_partnerships
        : available.separable_list;
    const prompt = action === 'upgrade-engagement'
      ? 'Welches Verlöbnis wird zur Ehe?'
      : action === 'marry-away'
        ? 'Unter welcher Ehe oder Lebensgemeinschaft soll der Wappenknoten stehen?'
        : 'Welche Verbindung wird gelöst?';
    step.innerHTML = `
      <p class="relation-step-lead">${prompt}</p>
      <label class="field">Verbindung
        <select name="partnershipId">
          ${candidates.map(partnership => `
            <option value="${escapeHtml(partnership.id)}">
              ${escapeHtml(partnershipTypeLabel(partnership.type))} mit ${escapeHtml(partnerName(partnership, person.id))} · ${escapeHtml(partnershipStatusLabel(partnership.status))}${partnership.start ? ` seit ${escapeHtml(partnership.start)}` : ''}
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
    const registryPersonSelect = form.elements.namedItem('registryPersonId');
    submitButton.disabled = source === 'registry' && !registryPersonSelect?.value;
  }

  function populateRegistryPersons() {
    const familySelect = form.elements.namedItem('registryFamilyId');
    const personSelect = form.elements.namedItem('registryPersonId');
    if (!familySelect || !personSelect) return;
    const record = listAvailableFamilyRecords().find(item => item.id === familySelect.value);
    const currentPerson = personById(context?.personId);
    personSelect.replaceChildren();
    const candidates = (record?.family.persons || []).filter(person => (
      !(currentPerson?.worldPersonId && person.worldPersonId === currentPerson.worldPersonId)
      && !(record?.id === context?.family.document.id && person.id === context?.personId)
    ));
    candidates.forEach(person => {
      const life = person.birth ? ` (${person.birth}${person.death ? `–${person.death}` : ''})` : '';
      personSelect.add(new Option(`${person.name}${life}`, person.id));
    });
    if (!candidates.length) personSelect.add(new Option('Keine andere Person in dieser Akte', ''));
    const registryContainer = personSelect.closest('[data-partner-source="registry"]');
    personSelect.disabled = !candidates.length || registryContainer?.hidden === true;
    submitButton.disabled = form.elements.namedItem('partnerSource')?.value === 'registry' && !personSelect.value;
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
    submitButton.disabled = false;
    form.elements.namedItem('relationAction').value = actionId;
    if (PARTNER_ACTIONS.has(actionId)) renderPartnerStep(person, actionId);
    else if (actionId === 'die') renderDeathStep(person);
    else if (actionId === 'send-ward') renderSendWardStep(person);
    else if (['divorce', 'upgrade-engagement', 'marry-away'].includes(actionId)) renderPartnershipStep(person, actionId);
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
    if (event.target.name === 'partnerSource') {
      syncPartnerSource();
      if (event.target.value === 'registry') populateRegistryPersons();
    }
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
