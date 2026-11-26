import { buildCathedralHierarchy } from '../../AleriaAlmanach/modules/gwynthor-cathedral/cathedral-hierarchy.mjs';
import { countyAreas, countyLeadershipRole } from './county-reference.mjs';
import { deaconSection, localOfficeSection } from './local-offices.mjs';
import { repeatableKind } from './office-roles.mjs';
import { FLOTILLA_ROLE, RETIRED_WATCH_MARSHAL, SEA_CAPTAIN_ROLE, repeatableNavalPost, watchSection, watchServiceSection } from './military-organization.mjs';

const icons = {
  militaer: 'command', klerus: 'faith', gerichtsbarkeit: 'justice', finanzen: 'money',
  spionage: 'secrecy', diplomatie: 'diplomacy', magie: 'arcane', unterhaltung: 'music',
};

const groupIcons = {
  'militaer-marschaelle': 'command', 'militaer-landdienste': 'arms', 'militaer-seedienste': 'sailing',
  'militaer-flottenstab': 'sailing', 'militaer-flottillen': 'sailing', 'militaer-kapitaene': 'sailing',
  'militaer-cochllamwyr-hauptmaenner': 'watch', 'militaer-hauptleute': 'watch',
  schattenadjutantur: 'records', vertragsstube: 'records', 'klerus-adjutantur': 'records',
};
const navalTemplates = { 'militaer-flottillen': FLOTILLA_ROLE, 'militaer-kapitaene': SEA_CAPTAIN_ROLE };
const repeatableCrew = new Set(['seedienst-steuermann', 'seedienst-bootsmann', 'seedienst-artilleriemeister',
  'seedienst-schiffszimmermeister', 'seedienst-schiffsarzt']);

const localDepartments = {
  gerichtsbarkeit: { replace: 'rechtsweg', omit: ['landrichter', 'dienste'], repeat: ['gerichtsvogt', 'schultheiss', 'dorfvogt'] },
  finanzen: { replace: 'aemter', omit: ['rentmeister', 'dienste'], repeat: ['zoll', 'markt', 'magazin', 'pruefer'] },
  spionage: { replace: 'oertliche-zellen', omit: ['zellenleitung-burg-hof', 'zellenleitung-stadt', 'zellenleitung-grenze'], repeat: ['kurier'] },
};

const moreRecurring = {
  militaer: ['militaer-bannerfuehrer', 'militaer-leutnant', 'militaer-unteroffizier'],
  diplomatie: ['gesandte', 'schreiber', 'siegel', 'blodwen', 'rice'],
  magie: ['bors', 'ludd'],
  unterhaltung: ['spielmann', 'saal', 'ansager'],
};

const titleVariants = {
  militaer: ['Marschall der Grafschaft', 'Marschallin der Grafschaft'],
  klerus: ['Patriarch von Celtigerns Wacht', 'Patriarchin von Celtigerns Wacht'],
  gerichtsbarkeit: ['Justiziar des Grafen', 'Justiziarin des Grafen'],
  finanzen: ['Kämmerer des Grafen', 'Kämmerin des Grafen'],
  spionage: ['Schatten des Grafen', 'Schatten des Grafen'],
  diplomatie: ['Herold des Grafen', 'Heroldin des Grafen'],
  magie: ['Ratszauberer des Grafen', 'Ratszauberin des Grafen'],
  unterhaltung: ['Barde des Grafen', 'Bardin des Grafen'],
};

function mapSlot(area, group, role) {
  const { id, title, description, reportsTo } = role;
  const kind = repeatableKind(area, id)
    || (group.kind === 'special' ? 'special' : '')
    || (localDepartments[area]?.repeat.includes(id) || moreRecurring[area]?.includes(id) ? 'other' : '');
  return { id, title, description, ...(reportsTo ? { reportsTo } : {}), ...(kind ? { kind } : {}) };
}

function mapGroup(area, group, roles = group.roles) {
  const { id, title, description, kind } = group;
  return {
    id, title, description, icon: groupIcons[id] || icons[area], core: kind === 'core',
    slots: roles.map(role => mapSlot(area, group, role)),
  };
}

function countyClergySections(house, source) {
  const sacred = new Map(source.groups.flatMap(group => group.roles).map(role => [role.id, role]));
  const named = { 'kathedrale-angharad': 'klerus-angharad', 'kathedrale-arianwen': 'klerus-arianwen' };
  const staff = buildCathedralHierarchy().trees.filter(tree => tree.id !== 'fuehrung').map(tree => {
    const duties = tree.levels.slice(1).flatMap(level => level.nodes).filter(node => node.id !== 'kathedrale-sekretaer');
    const icon = tree.id === 'militaer' ? 'watch' : 'faith';
    return {
      id: `patriarch-${tree.id}`, title: tree.label, icon, repeatableHere: true, staff: tree.id === 'kirchdiener',
      ...(tree.id === 'militaer' ? { description: 'Kirchliches Aufgebot der Kathedrale unter geistlicher Führung.' } : {}),
      slots: duties.map(node => {
        const role = sacred.get(named[node.id]);
        const kind = tree.id === 'kirchdiener' ? 'staff' : 'other';
        const templateId = node.id.replace(/-\d+$/u, '');
        return role ? { ...mapSlot('klerus', { kind: 'service' }, role), kind, templateId: node.id } : {
          id: node.id, title: node.title, description: node.text, kind, templateId, icon,
        };
      }),
    };
  });
  return [
    ...source.groups.filter(group => ['adjutant', 'core'].includes(group.kind)).map(group => mapGroup('klerus', group)),
    deaconSection(house.places.filter(place => place.name !== 'Gwynthor'), 'Die Gemeinde Gwynthors steht unmittelbar unter dem Patriarchen.'),
    ...staff,
  ];
}

function countySections(house, source, sharedWatchPosts) {
  if (source.id === 'klerus') return countyClergySections(house, source);
  const local = localDepartments[source.id];
  return source.groups.slice(1).flatMap(group => {
    const roles = group.roles.filter(role => !local?.omit.includes(role.id));
    const section = mapGroup(source.id, group, roles);
    const navalTemplate = navalTemplates[group.id];
    if (navalTemplate) {
      return [{ ...section, repeatableHere: true, slots: section.slots.map(slot => repeatableNavalPost(slot, navalTemplate)),
        ...(group.id === 'militaer-flottillen' ? { title: 'Flottillenadmiräle' } : {}) }];
    }
    if (group.id === 'militaer-seedienste') {
      return [{ ...section, repeatableHere: true, slots: section.slots.map(slot => repeatableCrew.has(slot.id)
        ? { ...slot, kind: slot.kind || 'other', stationed: true } : slot) }];
    }
    if (group.id === 'militaer-landdienste') {
      section.slots.push({
        id: 'marschall-gefolgswaffenknecht', title: 'Waffenknecht im Gefolge des Marschalls', icon: 'arms', kind: 'service',
        description: 'Versieht den beauftragten Wach- und Begleitdienst im unmittelbaren Gefolge des Marschalls.',
        reportsTo: 'dem Marschall der Grafschaft',
      });
    }
    if (group.id === 'militaer-kommandanten') {
      section.slots[0].place = 'Gwynthor';
    }
    if (group.id === 'militaer-hauptleute') {
      const places = house.places.filter(place => place.name !== 'Gwynthor');
      places.push({ name: 'Caer Ysgellfor' });
      return [watchSection(places, 'dem Marschall der Grafschaft', {
        ...Object.fromEntries(sharedWatchPosts.map(post => [post.place, post])),
        'Caer Ysgellfor': { id: 'hauptmann-caerysgellfor', title: 'Hauptmann von Caer Ysgellfor',
          description: 'Verwaltet die Festung und führt den Wachdienst zum Schutz der umliegenden Höfe und der Hauptstraße nach Gwynthor.' },
      }), watchServiceSection([
        ...section.slots,
        { id: 'knappe-caerysgellfor', title: 'Knappe des Hauptmanns von Caer Ysgellfor', icon: 'learning',
          description: 'Begleitet den örtlichen Hauptmann auf der Festung.', reportsTo: 'dem Hauptmann von Caer Ysgellfor' },
      ])];
    }
    return [...(local?.replace === group.id ? [localOfficeSection(source.id, house.places)] : []), section];
  });
}

export function countyOfficeDefinition(house, id, office, sharedWatchPosts = []) {
  const source = countyAreas[id];
  const leadership = countyLeadershipRole(source);
  return {
    head: {
      title: leadership.title, description: leadership.description, reportsTo: leadership.reportsTo,
      holder: office.holder, titleVariants: titleVariants[id],
    },
    sections: countySections(house, source, sharedWatchPosts),
    retired: id === 'militaer' ? RETIRED_WATCH_MARSHAL : undefined,
    references: id === 'klerus' ? house.contacts : [],
  };
}
