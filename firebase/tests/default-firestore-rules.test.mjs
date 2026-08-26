import { readFile } from 'node:fs/promises';
import test, { after, before } from 'node:test';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment
} from '@firebase/rules-unit-testing';
import { deleteDoc, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

const PROJECT_ID = 'aleria-default-rules-test';
let environment;

function comment(createdBy, overrides = {}) {
  return {
    entryId: 'brandhof-test',
    text: 'Ein unverfänglicher Beitrag.',
    charName: 'Testfigur',
    createdBy,
    createdAtClient: 1,
    ...overrides
  };
}

before(async () => {
  environment = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: {
      rules: await readFile(new URL('../firestore.rules', import.meta.url), 'utf8'),
      host: '127.0.0.1',
      port: 8080
    }
  });
});

after(async () => environment?.cleanup());
test.beforeEach(async () => environment.clearFirestore());

test('öffentliche Spieldaten bleiben ohne Anmeldung lesbar', async () => {
  await environment.withSecurityRulesDisabled(async context => {
    await setDoc(doc(context.firestore(), 'characters/gawain'), { name: 'Gawain', ownerUid: 'owner' });
  });
  await assertSucceeds(getDoc(doc(environment.unauthenticatedContext().firestore(), 'characters/gawain')));
});

test('Kommentare brauchen eine Anmeldung, aber keinen bestimmten Verfasser mehr', async () => {
  const anonymous = environment.unauthenticatedContext().firestore();
  const owner = environment.authenticatedContext('owner').firestore();
  const other = environment.authenticatedContext('other').firestore();
  const moderator = environment.authenticatedContext('mod', { aleriaRole: 'moderator' }).firestore();
  await assertFails(setDoc(doc(anonymous, 'comments/a'), comment('owner')));
  await assertFails(setDoc(doc(owner, 'comments/a'), comment('other')));
  await assertFails(setDoc(doc(owner, 'comments/a'), comment('owner')));
  await environment.withSecurityRulesDisabled(async context => {
    await setDoc(doc(context.firestore(), 'comments/a'), comment('owner'));
  });
  await assertFails(updateDoc(doc(anonymous, 'comments/a'), { text: 'Ohne Anmeldung' }));
  await assertSucceeds(updateDoc(doc(other, 'comments/a'), { text: 'Fremdänderung' }));
  await assertSucceeds(updateDoc(doc(owner, 'comments/a'), { text: 'Eigene Änderung' }));
  await assertSucceeds(updateDoc(doc(moderator, 'comments/a'), { text: 'Moderiert' }));
});

test('jeder angemeldete Nutzer darf einen normalen fremden Kommentar löschen, aber niemand ohne Anmeldung', async () => {
  const anonymous = environment.unauthenticatedContext().firestore();
  const other = environment.authenticatedContext('other').firestore();
  await environment.withSecurityRulesDisabled(async context => {
    await setDoc(doc(context.firestore(), 'comments/deletable'), comment('owner'));
  });
  await assertFails(deleteDoc(doc(anonymous, 'comments/deletable')));
  await assertSucceeds(deleteDoc(doc(other, 'comments/deletable')));
});

test('mechanische Kommentare können nur serverseitig entstehen und nie verändert werden', async () => {
  const owner = environment.authenticatedContext('owner').firestore();
  const moderator = environment.authenticatedContext('mod', { aleriaRole: 'moderator' }).firestore();
  await assertFails(setDoc(doc(owner, 'comments/forged'), comment('owner', {
    combatTransaction: { transactionId: 'forged' }
  })));
  await environment.withSecurityRulesDisabled(async context => {
    await setDoc(doc(context.firestore(), 'comments/mechanical'), comment('owner', {
      combatTransaction: { transactionId: 'trusted' },
      serverValidatedMechanics: true
    }));
  });
  await assertFails(updateDoc(doc(owner, 'comments/mechanical'), { text: 'Umschreiben' }));
  await assertFails(deleteDoc(doc(moderator, 'comments/mechanical')));
});

test('reine Zeit- und Würfelbelege dürfen entstehen, bleiben danach aber unveränderlich', async () => {
  const owner = environment.authenticatedContext('owner').firestore();
  await assertFails(setDoc(doc(owner, 'comments/dice'), comment('owner', {
    sceneDiceRoll: { notation: '1W20', results: [12] }
  })));
  await environment.withSecurityRulesDisabled(async context => {
    await setDoc(doc(context.firestore(), 'comments/dice'), comment('owner', {
      sceneDiceRoll: { notation: '1W20', results: [12] },
      mechanicalAudit: true
    }));
  });
  await assertFails(updateDoc(doc(owner, 'comments/dice'), { text: 'Nachträglich geändert' }));
});

test('jeder angemeldete Nutzer darf jede Spielfigur pflegen, aber niemand ohne Anmeldung', async () => {
  const anonymous = environment.unauthenticatedContext().firestore();
  const owner = environment.authenticatedContext('owner').firestore();
  const other = environment.authenticatedContext('other').firestore();
  await assertSucceeds(setDoc(doc(owner, 'characters/gawain'), { name: 'Gawain', ownerUid: 'owner' }));
  await assertFails(updateDoc(doc(anonymous, 'characters/gawain'), { name: 'Ohne Anmeldung' }));
  await assertSucceeds(updateDoc(doc(other, 'characters/gawain'), { name: 'Von anderem Spieler gepflegt' }));
  await assertSucceeds(updateDoc(doc(other, 'characters/gawain'), { ownerUid: 'other' }));
});

test('laufende Kämpfe sperren nur kampfrelevante Profilfelder', async () => {
  const owner = environment.authenticatedContext('owner').firestore();
  await environment.withSecurityRulesDisabled(async context => {
    const database = context.firestore();
    await setDoc(doc(database, 'characters/gawain'), {
      name: 'Gawain', ownerUid: 'owner',
      combatProfile: { progression: { level: 4 } },
      inventory: { items: [] }
    });
    await setDoc(doc(database, 'combat_profile_locks/characters/records/gawain'), {
      activeEncounterKeys: ['brandhof:encounter-1']
    });
  });
  await assertSucceeds(updateDoc(doc(owner, 'characters/gawain'), {
    bio: 'Darf erzählerisch weiter gepflegt werden.'
  }));
  await assertFails(updateDoc(doc(owner, 'characters/gawain'), {
    combatProfile: { progression: { level: 9 } }
  }));
  await assertFails(updateDoc(doc(owner, 'characters/gawain'), {
    inventory: { items: [{ id: 'free-arrow' }] }
  }));
  await assertFails(deleteDoc(doc(owner, 'characters/gawain')));
});

test('nested skill evaluations are locked by the server audit marker', async () => {
  const owner = environment.authenticatedContext('owner').firestore();
  await environment.withSecurityRulesDisabled(async context => {
    await setDoc(doc(context.firestore(), 'comments/skill'), comment('owner', {
      commentSegments: [{ skillChallenge: { id: 'challenge-1', difficulty: 14 } }],
      mechanicalAudit: true
    }));
  });
  await assertFails(updateDoc(doc(owner, 'comments/skill'), {
    commentSegments: [{ text: 'The challenge never existed.' }]
  }));
  await assertFails(deleteDoc(doc(owner, 'comments/skill')));
});

test('geteilte Konfiguration darf jeder angemeldete Spieler pflegen', async () => {
  const anonymous = environment.unauthenticatedContext().firestore();
  const player = environment.authenticatedContext('player').firestore();
  await assertFails(setDoc(doc(anonymous, 'char_tabs/config'), { tabs: [] }));
  await assertSucceeds(setDoc(doc(player, 'char_tabs/config'), { tabs: [] }));
});

test('Themenvorschlaege sind oeffentlich lesbar und gemeinsam pflegbar', async () => {
  const anonymous = environment.unauthenticatedContext().firestore();
  const owner = environment.authenticatedContext('owner').firestore();
  const other = environment.authenticatedContext('other').firestore();
  const proposal = {
    title: 'Reise nach Abergwint',
    status: 'open',
    votes: {},
    voteCount: 0,
    travel: {
      enabled: true,
      distance: 420,
      distanceUnit: 'km',
      dailyDistance: 90,
      travelDays: 5,
      totalDays: 6,
      stopovers: [{ place: 'Dunvar', stayDays: 1 }]
    },
    createdBy: 'owner',
    createdAtClient: 1,
    updatedAtClient: 1
  };

  await assertFails(setDoc(doc(anonymous, 'topic_proposals/reise'), proposal));
  await assertSucceeds(setDoc(doc(owner, 'topic_proposals/reise'), proposal));
  await assertSucceeds(getDoc(doc(anonymous, 'topic_proposals/reise')));
  await assertSucceeds(updateDoc(doc(other, 'topic_proposals/reise'), {
    votes: { other: true },
    voteCount: 1,
    updatedAtClient: 2
  }));
  await assertFails(updateDoc(doc(other, 'topic_proposals/reise'), { createdBy: 'other' }));
  await assertFails(deleteDoc(doc(owner, 'topic_proposals/reise')));
});

test('das aktuelle Aleria-Datum ist öffentlich lesbar und nur gültig aktualisierbar', async () => {
  const anonymous = environment.unauthenticatedContext().firestore();
  const player = environment.authenticatedContext('player').firestore();
  const other = environment.authenticatedContext('other').firestore();
  const dateRef = doc(player, 'almanach_settings/current-date');
  const validDate = {
    year: 1740,
    month: 3,
    day: 9,
    schemaVersion: 1,
    updatedAtClient: 1,
    updatedBy: 'player'
  };

  await assertFails(setDoc(doc(anonymous, 'almanach_settings/current-date'), validDate));
  await assertSucceeds(setDoc(dateRef, validDate));
  await assertSucceeds(getDoc(doc(anonymous, 'almanach_settings/current-date')));
  await assertSucceeds(setDoc(doc(other, 'almanach_settings/current-date'), {
    ...validDate,
    day: 10,
    updatedAtClient: 2,
    updatedBy: 'other'
  }));
  await assertFails(setDoc(dateRef, { ...validDate, month: 14 }));
  await assertFails(setDoc(dateRef, { ...validDate, updatedBy: 'other' }));
  await assertFails(deleteDoc(dateRef));
});
