// Data contract for the house-warriors template. Rendering and both editors consume
// this single normalized shape so limits and fallbacks cannot drift apart.
(function registerHouseWarriorsData(global) {
  const LIMITS = Object.freeze({ knightlyClasses: 8, menAtArms: 4 });

  function text(value) {
    return String(value || '').trim();
  }

  function createId(kind, index = 0) {
    return `house-warrior-${kind}-${index + 1}`;
  }

  function sanitizeCard(card, kind, index) {
    const source = card && typeof card === 'object' ? card : {};
    const rawId = text(source.id).toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '');
    return {
      id: rawId || createId(kind, index),
      name: text(source.name),
      subtitle: text(source.subtitle),
      image: text(source.image),
      badge: text(source.badge),
      description: text(source.description),
      duty: text(source.duty),
      equipment: text(source.equipment),
      hallmark: text(source.hallmark)
    };
  }

  function defaultCard(kind, index = 0) {
    if (kind === 'knight') {
      const names = ['Cantref', 'Ritterliche Gattung II', 'Morwyr'];
      return sanitizeCard({
        name: names[index] || `Ritterliche Gattung ${index + 1}`,
        subtitle: 'Rang und Aufgabe',
        badge: `Gattung ${index + 1}`,
        description: 'Kurzbeschreibung dieser ritterlichen Gattung und ihrer Stellung im Haus.',
        duty: 'Aufgabenbereich festlegen',
        equipment: 'Bewaffnung und Rüstung festlegen',
        hallmark: 'Erkennungsmerkmal festlegen'
      }, kind, index);
    }
    if (kind === 'page') {
      return sanitizeCard({
        name: 'Page',
        subtitle: 'Erste Stufe der Ausbildung',
        badge: 'Ausbildung I',
        description: 'Grundlagen von Hofdienst, Disziplin und Waffenpflege.',
        duty: 'Dienst und Grundlagen',
        equipment: 'Übungswaffen',
        hallmark: 'Vorbereitung auf die Knappenzeit'
      }, kind, index);
    }
    if (kind === 'squire') {
      return sanitizeCard({
        name: 'Knappe',
        subtitle: 'Ritterliche Lehrzeit',
        badge: 'Ausbildung II',
        description: 'Begleitung eines Ritters und fortgeschrittene militärische Ausbildung.',
        duty: 'Felddienst und Begleitung',
        equipment: 'Hausübliche Bewaffnung',
        hallmark: 'Anwärter auf den Ritterschlag'
      }, kind, index);
    }
    return sanitizeCard({
      name: index ? `Waffenknechte ${index + 1}` : 'Waffenknechte',
      subtitle: 'Bewaffnetes Gefolge',
      badge: `Gefolge ${index + 1}`,
      description: 'Bewaffnete Gefolgsleute im Dienst des Hauses.',
      duty: 'Wachdienst und Feldzug',
      equipment: 'Hausübliche Bewaffnung',
      hallmark: 'Zuordnung und Kennzeichen festlegen'
    }, 'man-at-arms', index);
  }

  function ensureUniqueIds(cards, kind) {
    const used = new Set();
    return cards.map((card, index) => {
      let id = card.id || createId(kind, index);
      let suffix = 2;
      while (used.has(id)) id = `${card.id || createId(kind, index)}-${suffix++}`;
      used.add(id);
      return { ...card, id };
    });
  }

  function sanitize(data) {
    const source = data && typeof data === 'object' ? data : {};
    const knightlyClasses = (Array.isArray(source.knightlyClasses) ? source.knightlyClasses : [])
      .slice(0, LIMITS.knightlyClasses)
      .map((card, index) => sanitizeCard(card, 'knight', index));
    const menAtArms = (Array.isArray(source.menAtArms) ? source.menAtArms : [])
      .slice(0, LIMITS.menAtArms)
      .map((card, index) => sanitizeCard(card, 'man-at-arms', index));
    const training = source.trainingRanks && typeof source.trainingRanks === 'object'
      ? source.trainingRanks
      : {};

    return {
      houseName: text(source.houseName),
      title: text(source.title),
      crest: text(source.crest),
      bannerImage: text(source.bannerImage),
      motto: text(source.motto),
      introduction: text(source.introduction),
      knightlyClasses: ensureUniqueIds(
        knightlyClasses.length ? knightlyClasses : [defaultCard('knight', 0)],
        'knight'
      ),
      trainingRanks: {
        page: sanitizeCard(training.page || defaultCard('page'), 'page', 0),
        squire: sanitizeCard(training.squire || defaultCard('squire'), 'squire', 0)
      },
      menAtArms: ensureUniqueIds(
        menAtArms.length ? menAtArms : [defaultCard('man-at-arms', 0)],
        'man-at-arms'
      )
    };
  }

  function createDefaultPage(index = 0) {
    const pageLabel = typeof global.getRomanPageLabel === 'function'
      ? global.getRomanPageLabel(index)
      : `${index + 1}.`;
    return {
      pageTitle: `${pageLabel} — Hauskrieger`,
      image: '',
      houseWarriorsPage: true,
      description: '',
      houseWarriors: sanitize({
        houseName: 'Haus Draig',
        title: 'Kriegerische Traditionen',
        motto: 'Ehre im Dienst des Hauses',
        introduction: 'Die Krieger des Hauses folgen einer klaren Ordnung aus ritterlichen Gattungen, Ausbildung und bewaffnetem Gefolge.',
        knightlyClasses: [defaultCard('knight', 0), defaultCard('knight', 1), defaultCard('knight', 2)],
        trainingRanks: { page: defaultCard('page'), squire: defaultCard('squire') },
        menAtArms: [defaultCard('man-at-arms', 0)]
      })
    };
  }

  function getBalancedRows(cards) {
    const items = Array.isArray(cards) ? cards : [];
    if (items.length <= 4) return items.length ? [items] : [];
    const firstSize = Math.ceil(items.length / 2);
    return [items.slice(0, firstSize), items.slice(firstSize)];
  }

  global.HouseWarriorsData = Object.freeze({
    limits: LIMITS,
    sanitize,
    sanitizeCard,
    defaultCard,
    createDefaultPage,
    getBalancedRows
  });
})(globalThis);
