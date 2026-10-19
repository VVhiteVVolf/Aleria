import { KANNE_PEOPLE, KANNE_PETS } from '../krumme-kanne/krumme-kanne-roster.mjs';
import { DURST_LIVING, DURST_MAID, DURST_DOG } from '../kleiner-durst/durst-people.mjs';
import { VANN_PEOPLE } from '../letzte-rast/rast-people.mjs';
import { RAST_STAFF } from '../letzte-rast/rast-staff.mjs';
import { rolePay, buildVenueWorkforce } from './economy-venue-workforce.mjs';

// Only ownership, family allowances, training and part-time exceptions live
// here. Ordinary role wages have one source: rolePay in venue-workforce.
const inactive = kind => ({ kind, days: 0, dailyCash: 0 });
const DURST_PAY = {
  efa: { kind: 'owner', days: 3, dailyCash: 0, ownerShare: .25 }, iorwerth: { kind: 'owner', dailyCash: 0, ownerShare: .75 },
  nia: { kind: 'family', dailyCash: .2 }, meleri: { kind: 'family', dailyCash: .15 },
  dewi: { kind: 'apprentice', days: 4, dailyCash: .08 }, bram: inactive('animal')
};
const KANNE_PAY = {
  merrik: { kind: 'owner', dailyCash: 0, ownerShare: 1 / 3 }, hrolf: { kind: 'owner', dailyCash: 0, ownerShare: 1 / 3 }, aedan: { kind: 'owner', dailyCash: 0, ownerShare: 1 / 3 },
  nestwen: { days: 3 }, styr: { kind: 'apprentice', days: 4, dailyCash: .25 }, neifion: { kind: 'apprentice', days: 4, dailyCash: .2 },
  cadri: inactive('dependent'), heledd: inactive('dependent'), eirlys: inactive('dependent'), enlli: inactive('dependent'),
  carreg: inactive('animal'), briwsion: inactive('animal')
};
const RAST_PAY = {
  brenn: { kind: 'owner', days: 5, dailyCash: 0, ownerShare: .5 }, madoc: { kind: 'owner', days: 6, dailyCash: 0, ownerShare: .5 },
  seren: { days: 5 }, lowri: { days: 5 }, gwenna: { kind: 'apprentice', days: 4, dailyCash: .6 }, rhys: { kind: 'apprentice', days: 2, dailyCash: .12 }
};

function metadataFor(id) {
  if (id === 'gwynthor-zum-kleinen-durst') return { people: [...DURST_LIVING, DURST_MAID, DURST_DOG], wages: DURST_PAY, board: .5 };
  if (id === 'modul-1781474092957') return { people: [...KANNE_PEOPLE, ...KANNE_PETS], wages: KANNE_PAY, board: .5 };
  return { people: [...VANN_PEOPLE, ...RAST_STAFF], wages: RAST_PAY, board: .7 };
}

export function buildWorkforce(entry) {
  const { people, wages, board } = metadataFor(entry.id);
  const lookup = new Map(people.map(person => [person.name, person]));
  const owners = people.filter(person => wages[person.key || person.id]?.kind === 'owner').map(person => person.name);
  const workers = new Map();
  for (const baseWorker of buildVenueWorkforce(entry, { owners })) {
    const person = lookup.get(baseWorker.name), key = person?.key || person?.id;
    if (!person) { workers.set(baseWorker.id, baseWorker); continue; }
    const id = `person-${key}`, wage = wages[key] || rolePay(baseWorker.role, baseWorker.areas.join(' '));
    const family = person && (entry.id === 'gwynthor-zum-kleinen-durst' ? key !== 'carys' && key !== 'bram'
      : entry.id === 'celtigerns-letzte-rast' ? VANN_PEOPLE.includes(person) : ['merrik', 'hrolf', 'aedan', 'styr', 'neifion', 'cadri', 'heledd', 'eirlys', 'enlli'].includes(key));
    const furnished = !family && !['vacancy', 'animal', 'dependent'].includes(wage.kind);
    workers.set(id, { ...baseWorker, id, name: baseWorker.name, role: person?.role || baseWorker.role, count: 1,
      kind: 'employee', days: 6, dailyCash: 0, fairDaily: 0, boardDays: furnished ? 9 : 0, boardDaily: furnished ? board : 0,
      lodgingWeekly: furnished ? board * 2 : 0, ownerShare: 0, ...wage,
      note: family ? 'Familienunterhalt wird aus dem getrennten Haushaltsbudget bestritten; kein zweites Kostgeld.'
        : furnished ? 'Kost für neun Tage und einfacher Schlafplatz zusätzlich zum Geldlohn; Ansatz zu Selbstkosten.' : '',
      source: `Hierarchie: ${entry.title} / ${baseWorker.areas.join(' · ')}` });
  }
  if (entry.id === 'celtigerns-letzte-rast') {
    const existing = [...workers.values()].filter(row => !['vacancy', 'dependent', 'animal'].includes(row.kind)).length;
    const supplements = [
      ['tafel', 'Weiterer Tischdienst und Ausschank', 10, 'Ausschank & Tafel'],
      ['haus', 'Weiterer Kammer-, Wasch- und Reinigungsdienst', 12, 'Herberge'],
      ['kueche', 'Weitere Küche, Vorräte und Spüle', 8, 'Küche'],
      ['hof', 'Weiterer Hof-, Stall- und Lieferdienst', 4, 'Stallungen'],
      ['wache', 'Weitere Wachleute und Ablösung', 4, 'Sicherheit']
    ];
    let remaining = Math.max(0, 60 - existing);
    for (const [key, role, wanted, area] of supplements) {
      const count = Math.min(wanted, remaining); remaining -= count;
      if (count) workers.set(`anonymous-${key}`, { id: `anonymous-${key}`, name: 'Nicht einzeln benannte Beschäftigte', role, areas: [area],
        kind: 'employee', count, days: 6, dailyCash: 0, fairDaily: 0, boardDays: 9, boardDaily: board, lodgingWeekly: board * 2, anonymous: true,
        note: 'Ergänzende bestehende Belegschaft gemäß Hausangabe von insgesamt etwa 60 tätigen Personen; keine Besetzung ausdrücklich freier Stellen.', source: 'Hausangabe und Nutzervorgabe vom 19. Oktober 2026' });
    }
    if (remaining) workers.set('anonymous-general', { id: 'anonymous-general', name: 'Nicht einzeln benannte Beschäftigte', role: 'Weiterer allgemeiner Hausdienst', areas: ['Hausdienst'],
      kind: 'employee', count: remaining, days: 6, dailyCash: 4.5, fairDaily: 4.5, boardDays: 9, boardDaily: board, lodgingWeekly: board * 2, anonymous: true,
      source: 'Ergänzende Modellgruppe zur überlieferten Gesamtbelegschaft; konkrete Rollen noch offen.' });
  }
  const ownerShares = [...workers.values()].filter(worker => worker.kind === 'owner').reduce((sum, worker) => sum + worker.ownerShare, 0);
  return [...workers.values()].map(worker => {
    if (['vacancy', 'dependent', 'animal'].includes(worker.kind)) return worker;
    const days = Math.min(worker.days, 6), suggested = rolePay(worker.role, worker.areas.join(' '));
    const luxury = entry.id === 'celtigerns-letzte-rast';
    const dailyCash = worker.id === 'person-cadoc' && luxury ? 24 : (suggested.dailyCash || 4.5) * (luxury ? 1.25 : 1);
    return { ...worker, days, dailyCash: worker.kind === 'employee' ? dailyCash : worker.dailyCash,
      ...(worker.kind === 'owner' && ownerShares > 0 ? { ownerShare: worker.ownerShare / ownerShares } : {}),
      fairDaily: dailyCash, ...(worker.boardDays ? { boardDaily: luxury ? .7 : .5, lodgingWeekly: luxury ? 1.4 : 1 } : {}) };
  });
}
