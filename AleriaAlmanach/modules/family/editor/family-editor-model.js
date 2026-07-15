// Domain schema and safe editing operations for versioned family documents.

(function installFamilyEditorModel(global) {
  'use strict';

  const ASSERTION_FIELDS = Object.freeze([
    { path: 'assertion.certainty', label: 'Gewissheit', type: 'select', options: ['confirmed', 'probable', 'rumored', 'disputed', 'unknown', 'denied'] },
    { path: 'assertion.visibility', label: 'Sichtbarkeit', type: 'select', options: ['public', 'private', 'secret'] },
    { path: 'assertion.sourceIds', label: 'Quellen-IDs', type: 'array', wide: true }
  ]);

  const COLLECTIONS = deepFreeze([
    {
      path: 'document.facts', label: 'Aktenangaben', singular: 'Angabe', idPrefix: 'fact', group: 'document',
      fields: [
        { path: 'icon', label: 'Icon', placeholder: '✦' },
        { path: 'label', label: 'Bezeichnung', placeholder: 'Sitz' },
        { path: 'value', label: 'Wert', placeholder: 'Nordturm', wide: true }
      ]
    },
    {
      path: 'genealogy.sources', label: 'Quellen', singular: 'Quelle', idPrefix: 'source', group: 'document',
      fields: [
        { path: 'id', label: 'Quellen-ID' },
        { path: 'title', label: 'Titel' },
        { path: 'url', label: 'URL', type: 'url' },
        { path: 'note', label: 'Notiz', type: 'textarea', wide: true }
      ]
    },
    {
      path: 'genealogy.persons', label: 'Personen', singular: 'Person', idPrefix: 'person', group: 'genealogy',
      description: 'Nur direkte Fakten erfassen. Verwandtschaften wie Geschwister oder Onkel werden nicht gespeichert.',
      fields: [
        { path: 'id', label: 'Personen-ID', placeholder: 'cassian-vael' },
        { path: 'recordType', label: 'Datensatztyp', type: 'select', options: ['person', 'placeholder'] },
        { path: 'identity.status', label: 'Identitätsstatus', type: 'select', options: ['known', 'unknown', 'missing', 'secret'] },
        { path: 'identity.displayName', label: 'Anzeigename', placeholder: 'Cassian Vael' },
        { path: 'identity.givenNames', label: 'Vornamen', type: 'array', placeholder: 'Cassian, Aeron' },
        { path: 'identity.familyName', label: 'Familienname', placeholder: 'Vael' },
        { path: 'identity.aliases', label: 'Aliasse', type: 'array', placeholder: 'Der Silberne' },
        { path: 'sex', label: 'Biologisches Geschlecht', type: 'select', options: ['unknown', 'female', 'male', 'intersex'] },
        { path: 'profile.tagline', label: 'Titel / Rang', placeholder: 'Erbe von Haus Vael' },
        { path: 'profile.portrait.src', label: 'Portrait-URL', type: 'url', placeholder: 'https://…' },
        { path: 'profile.portrait.alt', label: 'Portrait-Alternativtext', placeholder: 'Portrait von …' },
        { path: 'life.status', label: 'Lebensstatus', type: 'select', options: ['unknown', 'alive', 'dead', 'missing', 'undead'] },
        { path: 'life.birth', label: 'Geburt', placeholder: '412 n. E.' },
        { path: 'life.death', label: 'Tod', placeholder: 'leer oder Datum' },
        { path: 'tags', label: 'Merkmale', type: 'array', placeholder: 'Hauptlinie, legitim' },
        { path: 'profile.summary', label: 'Kurzbeschreibung', type: 'textarea', wide: true }
      ]
    },
    {
      path: 'genealogy.partnerships', label: 'Partnerschaften', singular: 'Partnerschaft', idPrefix: 'partnership', group: 'relations',
      description: 'Mehrere Partnerschaften pro Person sind erlaubt; Beteiligte werden über Personen-IDs zugeordnet.',
      fields: [
        { path: 'id', label: 'Partnerschafts-ID' },
        { path: 'kind', label: 'Art', type: 'select', options: ['marriage', 'engagement', 'union', 'affair', 'concubinage', 'political', 'magical', 'custom'] },
        { path: 'participantIds', label: 'Beteiligte Personen-IDs', type: 'array', wide: true, placeholder: 'person-1, person-2' },
        { path: 'status', label: 'Status', type: 'select', options: ['active', 'ended', 'unknown'] },
        { path: 'label', label: 'Eigene Beschriftung', placeholder: 'optional' },
        { path: 'start', label: 'Beginn' },
        { path: 'end', label: 'Ende' },
        { path: 'endReason', label: 'Endgrund', type: 'select', options: ['', 'divorce', 'annulment', 'separation', 'broken-engagement', 'death', 'unknown'] },
        ...ASSERTION_FIELDS
      ]
    },
    {
      path: 'genealogy.parentages', label: 'Elternschaften & Abstammung', singular: 'Abstammung', idPrefix: 'parentage', group: 'relations',
      description: 'Kind und Eltern werden über IDs verknüpft. Adoption, Pflege, Magie und umstrittene Herkunft bleiben fachlich getrennt.',
      fields: [
        { path: 'id', label: 'Abstammungs-ID' },
        { path: 'childId', label: 'Kind-ID' },
        { path: 'parentIds', label: 'Eltern-IDs', type: 'array', wide: true, placeholder: 'parent-1, parent-2' },
        { path: 'partnershipId', label: 'Herkunftspartnerschaft-ID', placeholder: 'optional' },
        { path: 'kind', label: 'Art', type: 'select', options: ['biological', 'adoptive', 'foster', 'guardian', 'step', 'magical', 'claimed'] },
        { path: 'legitimacy.status', label: 'Legitimität', type: 'select', options: ['unknown', 'legitimate', 'illegitimate', 'legitimized', 'disputed'] },
        ...ASSERTION_FIELDS
      ]
    },
    {
      path: 'genealogy.associations', label: 'Weitere Bindungen', singular: 'Bindung', idPrefix: 'association', group: 'relations',
      description: 'Nicht-genealogische Beziehungen wie Vormundschaft, Lehen oder Eid.',
      fields: [
        { path: 'id', label: 'Bindungs-ID' },
        { path: 'kind', label: 'Art', placeholder: 'guardianship' },
        { path: 'participants', label: 'Beteiligte (Personen-ID:Rolle)', type: 'participantRoles', wide: true, placeholder: 'person-1:guardian, person-2:ward' },
        { path: 'label', label: 'Beschriftung' },
        ...ASSERTION_FIELDS
      ]
    },
    {
      path: 'genealogy.fantasy.houses', label: 'Häuser & Dynastien', singular: 'Haus', idPrefix: 'house', group: 'fantasy',
      fields: [
        { path: 'id', label: 'Haus-ID' },
        { path: 'name', label: 'Name' },
        { path: 'kind', label: 'Art', type: 'select', options: ['house', 'dynasty', 'clan', 'order', 'custom'] },
        { path: 'status', label: 'Status', type: 'select', options: ['active', 'extinct', 'disputed', 'unknown'] },
        { path: 'motto', label: 'Motto', wide: true }
      ]
    },
    {
      path: 'genealogy.fantasy.lineages', label: 'Linien', singular: 'Linie', idPrefix: 'lineage', group: 'fantasy',
      fields: [
        { path: 'id', label: 'Linien-ID' },
        { path: 'name', label: 'Name' },
        { path: 'kind', label: 'Art', type: 'select', options: ['main', 'branch', 'cadet', 'secret', 'extinct', 'custom'] },
        { path: 'status', label: 'Status', type: 'select', options: ['active', 'extinct', 'hidden', 'disputed', 'unknown'] },
        { path: 'parentLineageId', label: 'Übergeordnete Linien-ID' },
        { path: 'houseId', label: 'Haus-ID' }
      ]
    },
    {
      path: 'genealogy.fantasy.houseAffiliations', label: 'Hauszugehörigkeiten', singular: 'Zugehörigkeit', idPrefix: 'affiliation', group: 'fantasy',
      fields: [
        { path: 'id', label: 'Zuordnungs-ID' },
        { path: 'personId', label: 'Personen-ID' },
        { path: 'houseId', label: 'Haus-ID' },
        { path: 'lineageId', label: 'Linien-ID' },
        { path: 'kind', label: 'Art', type: 'select', options: ['birth', 'marriage', 'adoption', 'oath', 'claim', 'custom'] },
        { path: 'status', label: 'Status', type: 'select', options: ['active', 'former', 'secret', 'disputed'] }
      ]
    },
    {
      path: 'genealogy.fantasy.titles', label: 'Titel', singular: 'Titel', idPrefix: 'title', group: 'fantasy',
      fields: [
        { path: 'id', label: 'Titel-ID' },
        { path: 'name', label: 'Titelname' },
        { path: 'houseId', label: 'Haus-ID' },
        { path: 'status', label: 'Status', type: 'select', options: ['active', 'vacant', 'extinct', 'disputed', 'unknown'] }
      ]
    },
    {
      path: 'genealogy.fantasy.titleHoldings', label: 'Titelinhaber', singular: 'Titelinhaber', idPrefix: 'holding', group: 'fantasy',
      fields: [
        { path: 'id', label: 'Inhaber-ID' },
        { path: 'titleId', label: 'Titel-ID' },
        { path: 'personId', label: 'Personen-ID' },
        { path: 'status', label: 'Status', type: 'select', options: ['current', 'former', 'regent', 'contested'] },
        { path: 'start', label: 'Beginn' },
        { path: 'end', label: 'Ende' }
      ]
    },
    {
      path: 'genealogy.fantasy.claims', label: 'Ansprüche', singular: 'Anspruch', idPrefix: 'claim', group: 'fantasy',
      fields: [
        { path: 'id', label: 'Anspruchs-ID' },
        { path: 'personId', label: 'Personen-ID' },
        { path: 'titleId', label: 'Titel-ID' },
        { path: 'kind', label: 'Art', type: 'select', options: ['birthright', 'marriage', 'adoption', 'conquest', 'magical', 'custom'] },
        { path: 'status', label: 'Status', type: 'select', options: ['active', 'fulfilled', 'renounced', 'denied', 'disputed'] },
        { path: 'strength', label: 'Stärke / Rang' }
      ]
    },
    {
      path: 'genealogy.fantasy.successionRules', label: 'Erbfolgeregeln', singular: 'Regel', idPrefix: 'succession-rule', group: 'fantasy',
      fields: [
        { path: 'id', label: 'Regel-ID' },
        { path: 'name', label: 'Bezeichnung' },
        { path: 'titleId', label: 'Titel-ID' },
        { path: 'houseId', label: 'Haus-ID' },
        { path: 'kind', label: 'Art', placeholder: 'Primogenitur' },
        { path: 'notes', label: 'Erläuterung', type: 'textarea', wide: true }
      ]
    },
    {
      path: 'genealogy.fantasy.successionDecisions', label: 'Erbfolge', singular: 'Erbfolgeeintrag', idPrefix: 'succession', group: 'fantasy',
      fields: [
        { path: 'id', label: 'Eintrags-ID' },
        { path: 'ruleId', label: 'Regel-ID' },
        { path: 'titleId', label: 'Titel-ID' },
        { path: 'personId', label: 'Personen-ID' },
        { path: 'rank', label: 'Rang', type: 'number' },
        { path: 'status', label: 'Status', type: 'select', options: ['heir', 'eligible', 'excluded', 'disputed', 'secret'] },
        { path: 'reason', label: 'Begründung', wide: true }
      ]
    },
    {
      path: 'genealogy.fantasy.bloodlines', label: 'Blutlinien', singular: 'Blutlinie', idPrefix: 'bloodline', group: 'fantasy',
      fields: [
        { path: 'id', label: 'Blutlinien-ID' },
        { path: 'name', label: 'Name' },
        { path: 'kind', label: 'Art', type: 'select', options: ['mundane', 'magical', 'divine', 'cursed', 'custom'] },
        { path: 'status', label: 'Status', type: 'select', options: ['active', 'dormant', 'extinct', 'secret', 'disputed'] }
      ]
    },
    {
      path: 'genealogy.fantasy.bloodlineLinks', label: 'Blutlinien-Zuordnung', singular: 'Zuordnung', idPrefix: 'bloodline-link', group: 'fantasy',
      fields: [
        { path: 'id', label: 'Zuordnungs-ID' },
        { path: 'bloodlineId', label: 'Blutlinien-ID' },
        { path: 'personId', label: 'Personen-ID' },
        { path: 'kind', label: 'Art', type: 'select', options: ['born', 'awakened', 'transferred', 'claimed', 'custom'] },
        { path: 'certainty', label: 'Gewissheit', type: 'select', options: ['confirmed', 'probable', 'rumored', 'disputed', 'unknown'] }
      ]
    }
  ]);

  const FIELD_GROUPS = deepFreeze([
    {
      id: 'document', label: 'Familienakte',
      fields: [
        { path: 'document.eyebrow', label: 'Kopfzeile' },
        { path: 'document.title', label: 'Familienname / Titel' },
        { path: 'document.subtitle', label: 'Unterzeile' },
        { path: 'document.summary', label: 'Beschreibung', type: 'textarea', wide: true },
        { path: 'document.quote', label: 'Hauswort / Zitat', type: 'textarea', wide: true }
      ]
    },
    {
      id: 'presentation', label: 'Darstellung',
      fields: [
        { path: 'presentation.centerLabel', label: 'Mitte oben' },
        { path: 'presentation.emblem', label: 'Emblem-URL', type: 'url' },
        { path: 'presentation.sideImage', label: 'Seitenbild-URL', type: 'url' },
        { path: 'presentation.motto', label: 'Motto' },
        { path: 'presentation.detailsTitle', label: 'Details-Überschrift' },
        { path: 'presentation.quoteLabel', label: 'Zitatlabel' },
        { path: 'presentation.chartTitle', label: 'Baum-Überschrift' },
        { path: 'presentation.chartIntro', label: 'Baum-Einleitung', type: 'textarea', wide: true },
        { path: 'presentation.footerNote', label: 'Footer-Notiz', wide: true },
        { path: 'presentation.cardFontScale', label: 'Kartenschrift (%)', type: 'number' },
        { path: 'presentation.portraitScale', label: 'Portraitgröße (%)', type: 'number' }
      ]
    },
    {
      id: 'view', label: 'Stammbaumansicht',
      fields: [
        { path: 'view.initialFocusPersonId', label: 'Startperson-ID' },
        { path: 'view.orientation', label: 'Ausrichtung', type: 'select', options: ['vertical', 'horizontal'] },
        { path: 'view.showSiblings', label: 'Geschwister der Fokusperson zeigen', type: 'boolean' },
        { path: 'view.fitOnOpen', label: 'Beim Öffnen einpassen', type: 'boolean' },
        { path: 'view.ancestorDepth', label: 'Vorfahren-Generationen', type: 'number' },
        { path: 'view.descendantDepth', label: 'Nachkommen-Generationen', type: 'number' },
        { path: 'view.visibleParentageKinds', label: 'Sichtbare Abstammungsarten', type: 'array', wide: true },
        { path: 'view.visiblePartnershipKinds', label: 'Sichtbare Partnerschaftsarten', type: 'array', wide: true }
      ]
    }
  ]);

  function deepFreeze(value) {
    if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
    Object.values(value).forEach(deepFreeze);
    return Object.freeze(value);
  }

  function clone(value, fallback = {}) {
    try {
      return typeof structuredClone === 'function'
        ? structuredClone(value)
        : JSON.parse(JSON.stringify(value));
    } catch (error) {
      return fallback;
    }
  }

  function isVersioned(family) {
    return family?.schema === 'aleria.family'
      && Number(family?.schemaVersion) >= 2
      && family?.genealogy
      && typeof family.genealogy === 'object';
  }

  function getPath(root, path, fallback = undefined) {
    const value = String(path || '').split('.').filter(Boolean).reduce((current, segment) => current?.[segment], root);
    return value == null ? fallback : value;
  }

  function setPath(root, path, value) {
    const segments = String(path || '').split('.').filter(Boolean);
    if (!root || !segments.length) return root;
    let target = root;
    segments.forEach((segment, index) => {
      if (index === segments.length - 1) {
        target[segment] = value;
        return;
      }
      const nextIsIndex = /^\d+$/.test(segments[index + 1]);
      if (!target[segment] || typeof target[segment] !== 'object') target[segment] = nextIsIndex ? [] : {};
      target = target[segment];
    });
    return root;
  }

  function readFieldValue(input) {
    const type = input?.dataset?.familyValueType || input?.type || 'text';
    if (type === 'boolean' || type === 'checkbox') return Boolean(input.checked);
    if (type === 'array') return String(input.value || '').split(',').map(value => value.trim()).filter(Boolean);
    if (type === 'participantRoles') {
      return String(input.value || '').split(',').map(value => value.trim()).filter(Boolean).map(value => {
        const [personId, ...roleParts] = value.split(':');
        return { personId: personId.trim(), role: roleParts.join(':').trim() || 'participant' };
      }).filter(participant => participant.personId);
    }
    if (type === 'number') {
      const rawValue = String(input.value ?? '').trim();
      if (!rawValue) return null;
      const number = Number(rawValue);
      return Number.isFinite(number) ? number : null;
    }
    return String(input?.value || '').trim();
  }

  function normalize(family) {
    const value = clone(family, {});
    value.document = value.document && typeof value.document === 'object' ? value.document : {};
    value.presentation = value.presentation && typeof value.presentation === 'object' ? value.presentation : {};
    value.view = value.view && typeof value.view === 'object' ? value.view : {};
    value.genealogy = value.genealogy && typeof value.genealogy === 'object' ? value.genealogy : {};
    value.genealogy.fantasy = value.genealogy.fantasy && typeof value.genealogy.fantasy === 'object'
      ? value.genealogy.fantasy
      : {};
    COLLECTIONS.forEach(definition => {
      if (!Array.isArray(getPath(value, definition.path))) setPath(value, definition.path, []);
    });
    if (!Array.isArray(value.genealogy.sources)) value.genealogy.sources = [];
    return value;
  }

  function getCollection(path) {
    return COLLECTIONS.find(definition => definition.path === path) || null;
  }

  function createRecord(path, index = 0, usedIds = []) {
    const definition = getCollection(path);
    const used = new Set(Array.isArray(usedIds) ? usedIds : []);
    const prefix = definition?.idPrefix || 'record';
    let suffix = Math.max(1, Number(index) + 1);
    let id = `${prefix}-${suffix}`;
    while (used.has(id)) {
      suffix += 1;
      id = `${prefix}-${suffix}`;
    }
    const assertion = { certainty: 'confirmed', visibility: 'public', sourceIds: [] };
    const defaults = {
      'document.facts': { icon: '✦', label: 'Neue Angabe', value: '' },
      'genealogy.persons': {
        id, recordType: 'person', characterRef: null,
        identity: { status: 'known', displayName: 'Neue Person', givenNames: [], familyName: '', aliases: [] },
        profile: { tagline: '', summary: '', portrait: { src: '', alt: '' } },
        sex: 'unknown', genderIdentity: null,
        life: { status: 'unknown', birth: null, death: null },
        tags: [], extensions: {}
      },
      'genealogy.partnerships': { id, kind: 'marriage', participantIds: [], status: 'active', label: '', start: null, end: null, endReason: '', assertion, extensions: {} },
      'genealogy.parentages': { id, childId: '', parentIds: [], partnershipId: null, kind: 'biological', legitimacy: { status: 'unknown' }, assertion, extensions: {} },
      'genealogy.associations': { id, kind: 'guardianship', participants: [], label: '', assertion, extensions: {} }
    };
    const record = clone(defaults[path] || { id, extensions: {} });
    definition?.fields?.forEach(field => {
      if (getPath(record, field.path) !== undefined) return;
      const fallback = field.type === 'array' || field.type === 'participantRoles'
        ? []
        : field.type === 'boolean'
          ? false
          : field.type === 'number'
            ? null
            : field.type === 'select'
              ? field.options?.[0] || ''
              : '';
      setPath(record, field.path, fallback);
    });
    return record;
  }

  function createDefaultFamily(index = 0) {
    const suffix = Number(index) + 1;
    return {
      schema: 'aleria.family',
      schemaVersion: 2,
      id: `familie-${suffix}`,
      document: {
        eyebrow: 'Familie', title: `Haus Vael ${suffix}`, subtitle: 'Dynastie & Blutlinie',
        summary: 'Eine alte Linie, deren Bündnisse, Ansprüche und Geheimnisse den Stammbaum prägen.',
        quote: 'Blut erinnert sich.',
        facts: [{ icon: '⌂', label: 'Sitz', value: 'Nordturm' }]
      },
      genealogy: {
        persons: [
          { ...createRecord('genealogy.persons', 0), id: 'aeron-vael', identity: { status: 'known', displayName: 'Aeron Vael', givenNames: ['Aeron'], familyName: 'Vael', aliases: [] }, profile: { tagline: 'Oberhaupt von Haus Vael', summary: '', portrait: { src: '', alt: 'Aeron Vael' } }, sex: 'male', life: { status: 'alive', birth: null, death: null } },
          { ...createRecord('genealogy.persons', 1), id: 'lyria-vael', identity: { status: 'known', displayName: 'Lyria Vael', givenNames: ['Lyria'], familyName: 'Vael', aliases: [] }, profile: { tagline: 'Herrin des Nordturms', summary: '', portrait: { src: '', alt: 'Lyria Vael' } }, sex: 'female', life: { status: 'alive', birth: null, death: null } },
          { ...createRecord('genealogy.persons', 2), id: 'cassian-vael', identity: { status: 'known', displayName: 'Cassian Vael', givenNames: ['Cassian'], familyName: 'Vael', aliases: [] }, profile: { tagline: 'Erbe der Hauptlinie', summary: '', portrait: { src: '', alt: 'Cassian Vael' } }, sex: 'male', life: { status: 'alive', birth: null, death: null } }
        ],
        partnerships: [{ ...createRecord('genealogy.partnerships', 0), id: 'ehe-aeron-lyria', participantIds: ['aeron-vael', 'lyria-vael'] }],
        parentages: [{ ...createRecord('genealogy.parentages', 0), id: 'abstammung-cassian', childId: 'cassian-vael', parentIds: ['aeron-vael', 'lyria-vael'], partnershipId: 'ehe-aeron-lyria', legitimacy: { status: 'legitimate' } }],
        associations: [], sources: [],
        fantasy: {
          houses: [{ id: 'haus-vael', name: 'Haus Vael', kind: 'house', status: 'active', motto: 'Blut erinnert sich.' }],
          lineages: [{ id: 'hauptlinie-vael', name: 'Hauptlinie Vael', kind: 'main', status: 'active', parentLineageId: null, houseId: 'haus-vael' }],
          houseAffiliations: [
            { id: 'affiliation-aeron', personId: 'aeron-vael', houseId: 'haus-vael', lineageId: 'hauptlinie-vael', kind: 'birth', status: 'active' },
            { id: 'affiliation-lyria', personId: 'lyria-vael', houseId: 'haus-vael', lineageId: 'hauptlinie-vael', kind: 'marriage', status: 'active' },
            { id: 'affiliation-cassian', personId: 'cassian-vael', houseId: 'haus-vael', lineageId: 'hauptlinie-vael', kind: 'birth', status: 'active' }
          ],
          titles: [{ id: 'titel-nordturm', name: 'Herr des Nordturms', houseId: 'haus-vael', status: 'active' }],
          titleHoldings: [{ id: 'holding-aeron', titleId: 'titel-nordturm', personId: 'aeron-vael', status: 'current', start: null, end: null }],
          claims: [{ id: 'claim-cassian', personId: 'cassian-vael', titleId: 'titel-nordturm', kind: 'birthright', status: 'active', strength: '1' }],
          successionRules: [], successionDecisions: [], bloodlines: [], bloodlineLinks: []
        }
      },
      view: {
        initialFocusPersonId: 'cassian-vael', orientation: 'vertical', showSiblings: true, fitOnOpen: true,
        ancestorDepth: 4, descendantDepth: 4,
        visibleParentageKinds: ['biological', 'adoptive', 'foster', 'magical'],
        visiblePartnershipKinds: ['marriage', 'engagement', 'union', 'affair', 'concubinage', 'political', 'magical']
      },
      presentation: {
        centerLabel: 'Haus & Blutlinie', emblem: '', sideImage: '', motto: 'Blut. Namen. Bande.',
        detailsTitle: 'Familienakte', quoteLabel: 'Hauswort', chartTitle: 'Stammbaum & Beziehungen',
        chartIntro: 'Wähle eine Person, um ihre Linie in den Mittelpunkt zu rücken.', footerNote: '',
        cardFontScale: 100, portraitScale: 100
      },
      extensions: {}
    };
  }

  const currentApi = global.AleriaFamily && typeof global.AleriaFamily === 'object' ? global.AleriaFamily : {};
  const currentEditor = currentApi.editor && typeof currentApi.editor === 'object' ? currentApi.editor : {};
  global.AleriaFamily = Object.freeze({
    apiVersion: currentApi.apiVersion || 1,
    schema: currentApi.schema || 'aleria.family',
    schemaVersion: currentApi.schemaVersion || 2,
    ...currentApi,
    editor: Object.freeze({
      ...currentEditor,
      model: Object.freeze({
        collections: COLLECTIONS,
        fieldGroups: FIELD_GROUPS,
        isVersioned,
        clone,
        normalize,
        getPath,
        setPath,
        readFieldValue,
        getCollection,
        createRecord,
        createDefaultFamily
      })
    })
  });
})(globalThis);
