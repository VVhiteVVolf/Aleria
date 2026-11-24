import { ROLE_EXAMPLES } from '../../Kontinente/modules/administration/data/role-examples.mjs';
import { geographicKey } from '../world-directory/geographic-key.mjs';
import { officeIcon } from './office-icons.mjs';

export const ROLE_KINDS = {
  service: { title: 'Niedere Rolle', heading: 'Niedere Rollen', icon: 'coordination' },
  special: { title: 'Sonderrolle', heading: 'Sonderrollen', icon: 'court' },
  other: { title: 'Übrige Rolle', heading: 'Übrige Rollen', icon: 'records' },
  staff: { title: 'Mitglied des Stabs', heading: 'Persönlicher Stab des Vikariats', icon: 'faith' },
};
export const LOWER_ROLE_KINDS = ['service', 'special', 'other'];
export const MAX_ROLE_BATCH = 1000;

// Entries name the existing slots that can have several independent incumbents.
// Site-specific commands, the leading office and the council's core remain singular.
const repeatableSlots = {
  militaer: {
    service: ['marschallschreiber', 'bannerfuehrer', 'seedienst-bootsmann'],
    special: ['landdienst-ermittler', 'landdienst-inspektor', 'landdienst-profoss', 'landdienst-heeresschoeffe', 'landdienst-feldkaplan'],
    other: ['landdienst-feldscher', 'kapitaen', 'seedienst-schiffszimmermeister', 'schiffsheiler'],
  },
  gerichtsbarkeit: {
    service: ['protokoll', 'aktenregistratur', 'empfang', 'justizbote', 'vollzugsdiener'],
    special: ['grenzzeuge', 'ausrufer', 'fuersprecher', 'beweiswart'],
    other: ['gerichtsvogt', 'schultheiss', 'schoeffe', 'spruchmittler', 'kerkermeister'],
  },
  finanzen: {
    service: ['schreiber', 'kassenschreiber', 'waagmeister', 'bauschreiber', 'haushaltsbote'],
    special: ['schaetzer', 'kassenreiter'],
    other: ['marktkasse', 'magazinmeister', 'zahlmeister'],
  },
  spionage: {
    service: ['amtskurier'],
    special: ['ermittler', 'fahnder', 'aussagen'],
    other: ['kundschafter', 'reiseberichte', 'registrator', 'kanzleiwart', 'kuriermeister'],
  },
  diplomatie: {
    service: ['audienzschreiber', 'kanzleischreiber', 'vertragsgehilfe', 'heroldsbote'],
    special: ['grenzgesandter'],
    other: ['gesandter', 'dolmetscher', 'wappenkundiger'],
  },
  magie: {
    service: ['kanzleischreiber', 'amtsbote', 'assistent'],
    special: ['beschaffer'],
    other: ['lehrling', 'magazinwart'],
  },
  unterhaltung: {
    service: ['terminwart', 'gastwart', 'instrumentenwart', 'requisitenwart'],
    special: ['erzaehlmeister', 'turnierrufer', 'preiswart', 'hofausrufer'],
    other: ['hofbarde', 'tanzmeister'],
  },
};
const slotKinds = Object.fromEntries(Object.entries(repeatableSlots).map(([area, kinds]) => [
  area, new Map(Object.entries(kinds).flatMap(([kind, ids]) => ids.map(id => [id, kind]))),
]));

export const repeatableKind = (area, id) => slotKinds[area]?.get(id)
  || (area === 'finanzen' && id?.startsWith('rente-') ? 'service' : '');

const additional = {
  klerus: [
    ['other', 'Priester', 'Hält Gottesdienste und betreut den geistlichen Dienst der Gemeinde.'],
    ['service', 'Adept', 'Unterstützt den Kirchendienst unter Anleitung.'],
    ['service', 'Novize', 'Steht am Beginn der geistlichen Ausbildung.'],
    ['service', 'Oblat', 'Versieht zugewiesene Aufgaben der geistlichen Gemeinschaft.'],
    ['other', 'Laie im Kirchendienst', 'Hilft bei den praktischen Aufgaben der Gemeinde.'],
    ['other', 'Glaubensritter', 'Versieht den Schutzdienst der Kirche.'],
    ['service', 'Schwurknecht', 'Unterstützt den kirchlichen Geleit- und Wachdienst.'],
    ['other', 'Mönch oder Nonne', 'Versieht die Dienste der zuständigen geistlichen Gemeinschaft.'],
    ['other', 'Asket', 'Wirkt an der zugeordneten geistlichen Schule oder Übung mit.'],
    ['other', 'Magister', 'Lehrt und bewahrt kirchliches Wissen im Auftrag eines Lehrhauses.'],
  ],
  finanzen: [
    ['service', 'Eintreiber', 'Erhebt fällige Abgaben im Auftrag der Kämmerei und quittiert die Übergabe.'],
    ['service', 'Zöllner', 'Erhebt die geltenden Zölle und stellt Quittungen aus.'],
    ['service', 'Steuereinnehmer', 'Zieht angesetzte Steuern ein und rechnet sie beim Rentamt ab.'],
    ['service', 'Kassenwart', 'Betreut den laufenden Bestand und weist Übergaben nach.'],
    ['other', 'Zinsverwalter', 'Führt die Zinsbücher und meldet fällige Abgaben.'],
    ['special', 'Münzverwalter', 'Betreut die anvertrauten Münzbestände und prüft den Wechsel.'],
  ],
  gerichtsbarkeit: [
    ['other', 'Rechtsprecher', 'Nimmt örtliche Rechtsanliegen auf und prüft den zuständigen Rechtsweg.'],
    ['other', 'Schöffe', 'Wirkt unter dem zuständigen Gerichtsvorsitz an Urteilen mit.'],
    ['other', 'Rechtsarchivar', 'Erschließt Urkunden und verwahrt abgeschlossene Verfahren.'],
    ['special', 'Zensor', 'Erfasst im Auftrag der Justiz, wo sich Rechtsverstöße häufen, und legt seine Beobachtungen vor.'],
    ['special', 'Notar', 'Beurkundet Verträge, Lehensvergaben und andere Rechtsgeschäfte und verwahrt die Ausfertigungen.'],
    ['service', 'Rechtsbote', 'Überbringt Ladungen und Schriftstücke des zuständigen Gerichts.'],
    ['service', 'Gerichtsschreiber', 'Führt die Niederschriften der Verhandlung und die Urteilsabschriften.'],
    ['service', 'Justizbote', 'Stellt Ladungen und Entscheidungen gegen Nachweis zu.'],
    ['service', 'Vollzugsdiener', 'Setzt angeordnete Maßnahmen um und dokumentiert Übergaben.'],
  ],
  diplomatie: [
    ['other', 'Verhandlungsführer', 'Leitet Gespräche im Auftrag der Heroldskanzlei.'],
    ['other', 'Redner', 'Trägt die freigegebenen Anliegen der Herrschaft vor.'],
    ['other', 'Gesandter', 'Vertritt die Herrschaft in übertragenen Angelegenheiten.'],
  ],
  spionage: [
    ['other', 'Agent', 'Bearbeitet zugewiesene Aufgaben des Nachrichtendienstes und berichtet an die zuständige Stelle.'],
    ['other', 'Spion', 'Sammelt beauftragte Beobachtungen für das Amt des Schattens.'],
    ['other', 'Informant', 'Gibt Informationen an die zuständige Meldestelle weiter.'],
  ],
  hof: [
    ['service', 'Hofdiener', 'Versieht die ihm zugeteilten Dienste im Haushalt.'],
    ['service', 'Page', 'Unterstützt den Hofdienst und lernt seine Abläufe.'],
    ['special', 'Leibarzt', 'Betreut die Gesundheit der Hofangehörigen.'],
    ['other', 'Hofdame', 'Begleitet gesellschaftliche Pflichten und Empfänge am Hof.'],
  ],
};
const examples = { regular: 'other', secondary: 'service', special: 'special' };

export function officeRoleTemplates(area, slots, suggestions = []) {
  const templates = new Map();
  const ownArea = area.startsWith('hof-') ? null : area;
  function add(role) {
    const key = `${role.kind}/${geographicKey(role.title)}`;
    if (!templates.has(key)) templates.set(key, role);
  }
  for (const slot of slots) {
    if (!slot.kind) continue;
    add({
      id: slot.templateId, kind: slot.kind, title: slot.templateTitle || slot.title, description: slot.templateDescription || slot.description,
      image: slot.image, placement: slot.placement, reportsTo: slot.reportsTo,
      ...(slot.stationed ? { stationed: true } : {}),
    });
  }
  const external = Object.entries(ROLE_EXAMPLES[ownArea] || {}).flatMap(([kind, roles]) =>
    roles.map(([title, description]) => [examples[kind], title, description]));
  for (const [kind, title, description, icon] of [...suggestions, ...(additional[ownArea] || []), ...external]) {
    if (area !== 'finanzen' || title !== 'Rentmeister') {
      add({ id: `t-${kind}-${geographicKey(title)}`, kind, title, description, image: officeIcon(icon || ROLE_KINDS[kind].icon) });
    }
  }
  return [...templates.values()].sort((a, b) => a.title.localeCompare(b.title, 'de'));
}
