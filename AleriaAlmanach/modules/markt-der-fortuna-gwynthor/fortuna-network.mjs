import { vannPerson } from '../letzte-rast/rast-people.mjs';
import { eleganzPerson } from '../goettliche-eleganz/eleganz-family-people.mjs';
import { storePerson } from '../pendrwn-general-store/store-people.mjs';

// A connection does not imply guild membership, ownership or a council seat.
export const FORTUNA_BUSINESSES = Object.freeze([
  { person: vannPerson('brenn'), family: 'Vann', entryId: 'celtigerns-letzte-rast', business: 'Celtigerns Letzte Rast', status: 'member', relation: 'Mitglied und Verbündeter', bank: 'Belegter Kunde der Blauen Bank',
    text: 'Brenn Vann verbindet seine feine Tafel und Herberge mit dem Markt der Fortuna. Die Letzte Rast bleibt ein selbständig geführter Familienbetrieb.', source: 'modules/letzte-rast/sources/module-before.json' },
  { person: eleganzPerson('eleonora'), family: 'Raves', entryId: 'goettliche-eleganz', business: 'Göttliche Eleganz', status: 'cooperation', relation: 'Handelskooperation', bank: '',
    text: 'Eleonora Cassia Raves führt das Schneiderhaus. Tiberian Raves pflegt den Fortuna-Kontakt und die Stoffroute zum Stammhaus Veltrane in Tirnara.', source: 'modules/goettliche-eleganz/eleganz-module.mjs' },
  { person: storePerson('cadwgan'), family: 'Pendrwn', entryId: 'gwynthor-zum-vollen-korb', business: 'Zum Vollen Korb', status: 'supply', relation: 'Regelmäßige Lieferbeziehung', bank: '',
    text: 'Cadwgan und Idwal Pendrwn beziehen den Nachschub für ihren Gemischtwarenladen über Fortuna. Die Zweige Meilyrs und Gweniths führen diesen Laden nicht.', source: 'modules/pendrwn-general-store/store-module.mjs' }
]);
export const FORTUNA_AFFILIATED_IDS = Object.freeze(FORTUNA_BUSINESSES.map(partner => partner.entryId));
export function fortunaBusinessNodes(prefix, bankOnly = false) {
  return FORTUNA_BUSINESSES.filter(partner => !bankOnly || partner.bank).map(partner => ({
    id: `${prefix}-${partner.person.key}`, title: partner.person.name, subtitle: `${partner.business} · ${bankOnly ? partner.bank : partner.relation}`,
    portrait: partner.person.portrait, text: `<p>${partner.text}</p>`, memberEntryId: partner.entryId, relationship: partner.status,
    worldPersonId: partner.person.worldPersonId
  }));
}

export const FORTUNA_EXTERNAL_RELATIONS = Object.freeze([
  { id: 'veltrane', name: 'Haus Veltrane', region: 'Tirnara · Kaiserreich Argentum', relationship: 'Handelspartner · Stammhaus der Raves',
    text: 'Die Veltrane bringen seit Jahrhunderten Stoffe, Seide, Gewürze und Olivenöl nach Lothir und Estryll. Über Tiberian und die Raves reicht diese Fortuna-Verbindung unmittelbar nach Gwynthor.', source: 'Stammbäume/assets/js/data/eleganz-family-records.js' }
]);
