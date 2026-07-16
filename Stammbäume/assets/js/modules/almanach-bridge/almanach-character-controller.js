import { createAlmanachCharacterDialog } from '../../ui/almanach-character-dialog.js';
import {
  createAlmanachHouseCandidates,
  createTreePersonFromAlmanach
} from './almanach-character-bridge.js';

function relationDefaults(values) {
  return {
    relationKind: values.placementKind,
    partnershipType: 'union',
    partnershipStatus: 'active',
    secondParentId: values.secondParentId,
    parentageType: 'biological',
    legitimacy: 'unknown',
    certainty: 'confirmed',
    visibility: 'public'
  };
}

export function createAlmanachCharacterController({
  store,
  repository = null,
  documentRef = document,
  notify = () => {},
  focusPerson = () => {},
  logger = console
}) {
  const dialog = createAlmanachCharacterDialog(documentRef);
  let submitting = false;

  async function open() {
    const state = store.getState();
    dialog.open(state.family, [], state.selectedPersonId, { loading: true });
    if (!repository) {
      dialog.setCandidates([], {
        error: 'Die Almanach-Datenquelle ist in dieser Umgebung nicht eingerichtet.'
      });
      return;
    }
    try {
      const characters = await repository.loadCharacters();
      dialog.setCandidates(createAlmanachHouseCandidates(state.family, characters));
    } catch (error) {
      dialog.setCandidates([], {
        error: error.message || 'Die Almanach-Charaktere konnten nicht geladen werden.'
      });
    }
  }

  async function persistLink(candidate, worldPersonId) {
    if (!repository) return false;
    try {
      await repository.linkWorldPersonId(candidate.character.id, worldPersonId);
      return true;
    } catch (error) {
      logger.warn('Die Personen-ID konnte nicht in den Almanach zurückgeschrieben werden.', error);
      return false;
    }
  }

  function finish(personId, messages, linkedInAlmanach) {
    store.selectPerson(personId);
    focusPerson(personId);
    dialog.close();
    notify(linkedInAlmanach ? messages.linked : messages.pending, {
      error: !linkedInAlmanach,
      duration: linkedInAlmanach ? 3500 : 6500
    });
  }

  async function submitSelection() {
    const values = dialog.read();
    const candidate = values.candidate;
    if (!candidate) throw new Error('Bitte einen Almanach-Charakter auswählen.');

    const matchedPerson = candidate.match?.character?.treePerson || null;
    const canUseExisting = matchedPerson
      && ['linked', 'probable', 'name-only'].includes(candidate.match.kind)
      && !values.forceSeparate;

    if (canUseExisting) {
      const worldPersonId = candidate.hasStoredWorldPersonId
        ? candidate.worldPersonId
        : matchedPerson.worldPersonId || candidate.worldPersonId;
      if (matchedPerson.worldPersonId !== worldPersonId) {
        store.updatePerson(matchedPerson.id, { worldPersonId });
      }
      const linkedInAlmanach = candidate.hasStoredWorldPersonId
        || await persistLink(candidate, worldPersonId);
      finish(
        matchedPerson.id,
        {
          linked: `${candidate.character.name} ist dauerhaft mit der vorhandenen Baumperson verbunden.`,
          pending: `${candidate.character.name} wurde im Baum zugeordnet; der Almanach-Rücklink konnte noch nicht gespeichert werden.`
        },
        linkedInAlmanach
      );
      return;
    }

    const state = store.getState();
    const mappedPerson = createTreePersonFromAlmanach(state.family, candidate);
    const worldPersonIdAlreadyUsed = state.family.persons.some(person => (
      person.worldPersonId === mappedPerson.worldPersonId
    ));
    const personValues = worldPersonIdAlreadyUsed
      ? { ...mappedPerson, worldPersonId: '' }
      : mappedPerson;
    let personId = '';
    if (values.placementKind === 'standalone') {
      personId = store.addPerson(personValues);
    } else {
      if (!values.referencePersonId) throw new Error('Bitte eine Bezugsperson für die Platzierung wählen.');
      personId = store.addRelatedPerson(
        values.referencePersonId,
        personValues,
        relationDefaults(values)
      );
    }
    const persistedPerson = store.getState().family.persons.find(person => person.id === personId);
    const linkedInAlmanach = candidate.hasStoredWorldPersonId
      || await persistLink(candidate, persistedPerson?.worldPersonId);
    finish(
      personId,
      {
        linked: `${candidate.character.name} wurde platziert und mit dem Almanach verbunden.`,
        pending: `${candidate.character.name} wurde platziert; der Almanach-Rücklink konnte noch nicht gespeichert werden.`
      },
      linkedInAlmanach
    );
  }

  async function submit() {
    if (submitting) return;
    submitting = true;
    dialog.setBusy(true);
    try {
      await submitSelection();
    } finally {
      submitting = false;
      dialog.setBusy(false);
    }
  }

  return Object.freeze({
    form: dialog.form,
    open,
    close: dialog.close,
    submit
  });
}
