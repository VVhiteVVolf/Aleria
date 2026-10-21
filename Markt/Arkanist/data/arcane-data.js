window.ARCANE_DATA = {
  currency: {
    copperIcon: 'https://i.imgur.com/rp3IIJu.png',
    silverIcon: 'https://i.imgur.com/hgYhPCT.png',
    goldIcon: 'https://i.imgur.com/nypnWlN.png',
    silverToCopper: 100,
    goldToCopper: 1000
  },
  profileLabels: ['Macht', 'Speicher', 'Kontrolle', 'Schutz', 'Seltenheit', 'Risiko'],
  items: [
    {
      id: 'zauberstein',
      name: 'Zauberstein',
      category: 'Katalysatoren',
      rarity: 'Beliebig',
      weight: '0.05 kg',
      magical: 'Ja',
      requirement: 'Magie Basiswissen',
      material: 'Edelstein',
      unit: 'Stück',
      price: { min: 1, max: 10, unit: 'G' },
      image: 'https://i.imgur.com/o9m4s8F.png',
      tags: ['Magicka', 'Energiequelle', 'Ritual'],
      desc: 'Ein Zauberstein ist ein mit reiner Magicka aufgeladener Edelstein. Er dient als externe Energiequelle für Rituale, Verzauberungen und Zauberwirker, speichert jedoch keine Seele und ist dadurch berechenbarer als ein Seelenstein.',
      stats: [6, 8, 7, 2, 5, 3]
    },
    {
      id: 'seelenstein',
      name: 'Seelenstein',
      category: 'Katalysatoren',
      rarity: 'Beliebig',
      weight: '0.05 kg',
      magical: 'Ja',
      requirement: 'Magie Basiswissen',
      material: 'Edelstein',
      unit: 'Stück',
      price: { min: 1, max: 10, unit: 'G' },
      image: 'https://i.imgur.com/bT4n0Qs.png',
      tags: ['Seelengefäß', 'Magickaquelle', 'Instabil'],
      desc: 'Ein Seelenstein enthält die Seele einer Kreatur und regeneriert dadurch stetig Magicka. Seine Macht hängt von der gefangenen Seele ab, doch die Handhabung ist riskanter als bei einem gewöhnlichen Zauberstein.',
      stats: [8, 9, 4, 1, 7, 8]
    },
    {
      id: 'zauberschriftrolle',
      name: 'Zauberschriftrolle',
      category: 'Schriftstücke',
      rarity: 'Beliebig',
      weight: '-',
      magical: 'Ja',
      requirement: 'Magie Basiswissen',
      material: 'Schriftrolle',
      unit: 'Stück',
      price: { min: 0.1, max: 10, unit: 'G' },
      image: 'https://i.imgur.com/PmyI5Wz.png',
      tags: ['Einwegzauber', 'Runen', 'Notfall'],
      desc: 'Zauberschriftrollen enthalten einen einzelnen Zauber. Beim lauten Vortragen der Runen wird der Zauber ausgelöst, danach zerfällt die Rolle meist zu Staub oder Asche.',
      stats: [7, 3, 5, 2, 5, 6]
    },
    {
      id: 'zauberdieb-amulett',
      name: 'Zauberdieb Amulett',
      category: 'Schutzartefakte',
      rarity: 'Beliebig',
      weight: '-',
      magical: 'Ja',
      requirement: 'Keine',
      material: 'Amulett',
      unit: 'Stück',
      price: { min: 1, max: 1, unit: 'G' },
      image: 'https://i.imgur.com/coRUZ0I.png',
      tags: ['Zauberfang', 'Schutz', 'Limit'],
      desc: 'Der Zauberdieb ist ein verzaubertes Amulett, das den ersten gegen den Träger gewirkten Zauber einfängt und neutralisiert. Wird sein energetisches Limit überschritten, kann es zerspringen oder gefährlich entladen.',
      stats: [5, 4, 6, 9, 7, 6]
    },
    {
      id: 'seelenhaescher-gefaess',
      name: 'Seelenhäscher Gefäß',
      category: 'Seelenmagie',
      rarity: 'Beliebig',
      weight: '-',
      magical: 'Ja',
      requirement: 'Expertenwissen',
      material: 'Gefäß',
      unit: 'Stück',
      price: { min: 10, max: 100, unit: 'G' },
      image: 'https://i.imgur.com/Tzb4c94.png',
      tags: ['Seelenbindung', 'Dämonen', 'Gefäß'],
      desc: 'Ein Seelenhäscher dient dazu, eine Seele dauerhaft einzusperren. Besonders gegen infernale Kreaturen ist ein solches Gefäß wertvoll, da es ihre Rückkehr in andere Ebenen verhindern kann.',
      stats: [9, 9, 5, 5, 9, 10]
    },
    {
      id: 'zaubergrimoire',
      name: 'Zaubergrimoire',
      category: 'Schriftstücke',
      rarity: 'Beliebig',
      weight: '-',
      magical: 'Ja',
      requirement: 'Expertenwissen',
      material: 'Grimoire',
      unit: 'Buch',
      price: { min: 1, max: 1, unit: 'G' },
      image: 'https://i.imgur.com/PhnoJEY.png',
      tags: ['Zaubersammlung', 'Gedächtnisstütze', 'Studium'],
      desc: 'Ein Zaubergrimoire ist Nachschlagewerk, Gedächtnisstütze und Werkzeug eines Magiers. Es speichert Formeln, Runen, Diagramme und Zauber, die bei Bedarf erweitert werden können.',
      stats: [4, 8, 8, 2, 6, 4]
    },
    {
      id: 'verzaubertes-diadem',
      name: 'Verzaubertes Diadem',
      category: 'Verzauberte Ausrüstung',
      rarity: 'Beliebig',
      weight: '-',
      magical: 'Ja',
      requirement: 'Keine',
      material: 'Metall, Edelstein',
      unit: 'Stück',
      price: { min: 1, max: 100, unit: 'G' },
      image: 'https://i.imgur.com/LqDKBxS.png',
      tags: ['Veränderung', 'Bolg', 'Prestige'],
      desc: 'Verzauberte Diademe dienen als Schmuck, Warnung und magischer Fokus. Viele tragen Zauber der Veränderung, Gedankenübertragung, Telekinese, Illusionen oder automatische Schutzschilde.',
      stats: [6, 5, 7, 7, 8, 5]
    },
    {
      id: 'verzaubertes-amulett',
      name: 'Verzaubertes Amulett',
      category: 'Verzauberte Ausrüstung',
      rarity: 'Beliebig',
      weight: '-',
      magical: 'Ja',
      requirement: 'Keine',
      material: 'Amulett',
      unit: 'Stück',
      price: { min: 1, max: 100, unit: 'G' },
      image: 'https://i.imgur.com/BZVWYdX.png',
      tags: ['Talisman', 'Schutz', 'Fokus'],
      desc: 'Verzauberte Amulette reichen von einfachen Glücksbringern bis zu ernsthaften Schutz- und Fokusartefakten. Ihre Wirkung hängt stark von Fassung, Edelstein, Verzauberer und eingesetzter Schule ab.',
      stats: [5, 5, 6, 7, 7, 5]
    },
    {
      id: 'verzauberter-ring',
      name: 'Verzauberter Ring',
      category: 'Verzauberte Ausrüstung',
      rarity: 'Beliebig',
      weight: '-',
      magical: 'Ja',
      requirement: 'Keine',
      material: 'Ring',
      unit: 'Stück',
      price: { min: 1, max: 100, unit: 'G' },
      image: 'https://i.imgur.com/1PbUfIu.png',
      tags: ['Diskret', 'Fokus', 'Artefakt'],
      desc: 'Verzauberte Ringe sind klein, unauffällig und deshalb begehrt. Sie tragen meist begrenzte Verzauberungen, Schutzsegen, kleine Speicherwirkungen oder Effekte, die im Alltag nützlich sind.',
      stats: [4, 4, 7, 5, 7, 4]
    },
    {
      id: 'verzauberter-stab',
      name: 'Verzauberter Stab',
      category: 'Foki & Stäbe',
      rarity: 'Beliebig',
      weight: '-',
      magical: 'Ja',
      requirement: 'Magie Basiswissen',
      material: 'Stab, Kristall',
      unit: 'Stück',
      price: { min: 1, max: 100, unit: 'G' },
      image: 'https://i.imgur.com/UenM5xg.png',
      tags: ['Fokus', 'Zauberhilfe', 'Kanalisation'],
      desc: 'Ein verzauberter Stab dient als Fokus und Kanal für Magicka. Gute Stäbe stabilisieren Zauber, senken Ermüdung und erlauben präzisere arkane Entladungen.',
      stats: [8, 6, 8, 3, 7, 5]
    },
    {
      id: 'tenebrium-ketten',
      name: 'Tenebrium Ketten',
      category: 'Antimagie',
      rarity: 'Beliebig',
      weight: '-',
      magical: 'Nein',
      requirement: 'Keine',
      material: 'Tenebrium',
      unit: 'Satz',
      price: { min: 5, max: 5, unit: 'G' },
      image: 'https://i.imgur.com/a9S2P8q.png',
      tags: ['Antimagie', 'Fesseln', 'Hexenjäger'],
      desc: 'Tenebrium-Ketten unterdrücken magische Aktivität bei direktem Hautkontakt. Sie werden von Hexenjägern, Inquisitoren und Gildenwächtern genutzt, um Zauberwirker festzusetzen.',
      stats: [2, 1, 8, 10, 8, 7]
    },
    {
      id: 'stuemperhaft-verzauberter-stab',
      name: 'Stümperhaft verzauberter Stab',
      category: 'Foki & Stäbe',
      rarity: 'Beliebig',
      weight: '-',
      magical: 'Ja',
      requirement: 'Keine',
      material: 'Holz, Kristall',
      unit: 'Stück',
      price: { min: 1, max: 1, unit: 'G' },
      image: 'https://i.imgur.com/2ehFoyi.png',
      tags: ['Lehrlingsarbeit', 'Instabil', 'Billig'],
      desc: 'Ein stümperhaft verzauberter Stab ist eine improvisierte Lehrlingsarbeit aus fragwürdigem Material. Seine Verzauberung kann verblassen, versagen oder sich im schlechtesten Moment entladen.',
      stats: [3, 2, 2, 1, 3, 9]
    },
    {
      id: 'grundlagen-der-magie',
      name: 'Grundlagen der Magie I-VI',
      category: 'Schriftstücke',
      rarity: 'Beliebig',
      weight: '-',
      magical: 'Nein',
      requirement: 'Keine',
      material: 'Buch',
      unit: 'Buch',
      price: { min: 1, max: 1, unit: 'G', note: 'pro Buch' },
      image: 'https://i.imgur.com/yULOc1T.png',
      tags: ['Lehrbuch', 'Magiergilde', 'Basiswissen'],
      desc: 'Die Grundlagen der Magie sind eine sechsbändige Einführung in arkane Prinzipien, Zauberschulen, Rituale und erste Übungen. Ohne Mentor bleibt das Studium riskant.',
      stats: [2, 3, 9, 1, 5, 5]
    },
    {
      id: 'heiltrank',
      name: 'Heiltrank',
      category: 'Tränke',
      rarity: 'Beliebig',
      weight: '-',
      magical: 'Nein',
      requirement: 'Keine',
      material: 'Alchemie',
      unit: 'Flasche',
      price: { min: 20, max: 100, unit: 'K' },
      image: 'https://i.imgur.com/v0ijyb6.png',
      tags: ['Heilung', 'Notfall', 'Alchemie'],
      desc: 'Ein Heiltrank beschleunigt körperliche Heilung, stillt Blutungen und stabilisiert je nach Qualität sogar schwere Verletzungen. Schlechte Mischungen heilen wenig und schmecken entsprechend.',
      stats: [5, 1, 5, 4, 3, 3]
    },
    {
      id: 'manatrank',
      name: 'Manatrank',
      category: 'Tränke',
      rarity: 'Beliebig',
      weight: '-',
      magical: 'Nein',
      requirement: 'Keine',
      material: 'Alchemie',
      unit: 'Flasche',
      price: { min: 20, max: 100, unit: 'K' },
      image: 'https://i.imgur.com/OD2ZbSA.png',
      tags: ['Mana', 'Regeneration', 'Magicka'],
      desc: 'Ein Manatrank stellt magische Energie wieder her. Je nach Qualität kann er leichte Erschöpfung lindern oder einen ausgebrannten Magier kurzfristig kampffähig machen.',
      stats: [3, 7, 5, 2, 3, 4]
    }
  ]
};

// Standardzubehör · Arkaneum-Erweiterung 2026-10-20
window.ARCANE_DATA.items.push({
  "id": "unverzauberter-stab",
  "name": "Stab · unverzaubert",
  "category": "Unverzaubertes Zubehör",
  "type": "Unverzaubertes Zubehör",
  "unit": "1 Stück",
  "price": {
    "min": 12,
    "max": 12,
    "unit": "K"
  },
  "image": "/AleriaAlmanach/assets/herluin-lothaire/goods/unverzauberter-stab.png",
  "tags": [
    "Unverzaubertes Zubehör"
  ],
  "desc": "Ein sorgfältig geglätteter Eschenstab als Rohling; ohne Zauber, Speicher oder eingesetzten Kristall.",
  "stats": [
    0,
    0,
    0,
    0,
    1,
    0
  ]
},
{
  "id": "unverzauberte-zauberkugel",
  "name": "Zauberkugel · unverzaubert",
  "category": "Unverzaubertes Zubehör",
  "type": "Unverzaubertes Zubehör",
  "unit": "1 Kugel · 10 cm",
  "price": {
    "min": 40,
    "max": 40,
    "unit": "K"
  },
  "image": "/AleriaAlmanach/assets/herluin-lothaire/goods/unverzauberte-zauberkugel.png",
  "tags": [
    "Unverzaubertes Zubehör"
  ],
  "desc": "Eine klare geschliffene Glaskugel als Arbeitsrohling; sie enthält keine Vision und keine Verzauberung.",
  "stats": [
    0,
    0,
    0,
    0,
    1,
    0
  ]
},
{
  "id": "leeres-zauberbuch",
  "name": "Zauberbuch · leer",
  "category": "Unverzaubertes Zubehör",
  "type": "Unverzaubertes Zubehör",
  "unit": "1 Buch · 120 Seiten",
  "price": {
    "min": 18,
    "max": 18,
    "unit": "K"
  },
  "image": "/AleriaAlmanach/assets/herluin-lothaire/goods/leeres-zauberbuch.png",
  "tags": [
    "Unverzaubertes Zubehör"
  ],
  "desc": "Ein schlichtes leinengebundenes Arbeitsbuch mit unbeschriebenen Seiten.",
  "stats": [
    0,
    0,
    0,
    0,
    1,
    0
  ]
},
{
  "id": "unverzauberter-ring",
  "name": "Ring · unverzaubert",
  "category": "Unverzaubertes Zubehör",
  "type": "Unverzaubertes Zubehör",
  "unit": "1 Silberring",
  "price": {
    "min": 16,
    "max": 16,
    "unit": "K"
  },
  "image": "/AleriaAlmanach/assets/herluin-lothaire/goods/unverzauberter-ring.png",
  "tags": [
    "Unverzaubertes Zubehör"
  ],
  "desc": "Ein schlichter Silberring ohne Stein und ohne Verzauberung.",
  "stats": [
    0,
    0,
    0,
    0,
    1,
    0
  ]
},
{
  "id": "unverzaubertes-amulett",
  "name": "Amulett · unverzaubert",
  "category": "Unverzaubertes Zubehör",
  "type": "Unverzaubertes Zubehör",
  "unit": "1 Silberamulett",
  "price": {
    "min": 24,
    "max": 24,
    "unit": "K"
  },
  "image": "/AleriaAlmanach/assets/herluin-lothaire/goods/unverzaubertes-amulett.png",
  "tags": [
    "Unverzaubertes Zubehör"
  ],
  "desc": "Ein leeres silbernes Amulett an einer einfachen Kette, bereit für eine spätere Arbeit.",
  "stats": [
    0,
    0,
    0,
    0,
    1,
    0
  ]
},
{
  "id": "unverzaubertes-diadem",
  "name": "Diadem · unverzaubert",
  "category": "Unverzaubertes Zubehör",
  "type": "Unverzaubertes Zubehör",
  "unit": "1 Silberdiadem",
  "price": {
    "min": 45,
    "max": 45,
    "unit": "K"
  },
  "image": "/AleriaAlmanach/assets/herluin-lothaire/goods/unverzaubertes-diadem.png",
  "tags": [
    "Unverzaubertes Zubehör"
  ],
  "desc": "Ein schmales silbernes Diadem ohne Edelstein und ohne Zauber.",
  "stats": [
    0,
    0,
    0,
    0,
    1,
    0
  ]
},
{
  "id": "unverzauberte-schriftrolle",
  "name": "Zauberschriftrolle · unverzaubert",
  "category": "Unverzaubertes Zubehör",
  "type": "Unverzaubertes Zubehör",
  "unit": "1 leere Pergamentrolle",
  "price": {
    "min": 4,
    "max": 4,
    "unit": "K"
  },
  "image": "/AleriaAlmanach/assets/herluin-lothaire/goods/unverzauberte-schriftrolle.png",
  "tags": [
    "Unverzaubertes Zubehör"
  ],
  "desc": "Ein sauber vorbereitetes leeres Pergament; enthält keinen Zauber.",
  "stats": [
    0,
    0,
    0,
    0,
    1,
    0
  ]
},
{
  "id": "runenkreide",
  "name": "Runenkreide",
  "category": "Unverzaubertes Zubehör",
  "type": "Unverzaubertes Zubehör",
  "unit": "5 Stifte",
  "price": {
    "min": 1,
    "max": 1,
    "unit": "K"
  },
  "image": "/AleriaAlmanach/assets/herluin-lothaire/goods/runenkreide.png",
  "tags": [
    "Unverzaubertes Zubehör"
  ],
  "desc": "Weiche helle Kreide für vergängliche Zeichen auf Stein und Holz; ohne eigene magische Wirkung.",
  "stats": [
    0,
    0,
    0,
    0,
    1,
    0
  ]
},
{
  "id": "gravurstichel",
  "name": "Gravurstichel",
  "category": "Unverzaubertes Zubehör",
  "type": "Unverzaubertes Zubehör",
  "unit": "1 Stück",
  "price": {
    "min": 7,
    "max": 7,
    "unit": "K"
  },
  "image": "/AleriaAlmanach/assets/herluin-lothaire/goods/gravurstichel-v2.png",
  "tags": [
    "Unverzaubertes Zubehör"
  ],
  "desc": "Ein feiner Stahlstichel mit Holzgriff für kleine Zeichen und Fassungsarbeiten.",
  "stats": [
    0,
    0,
    0,
    0,
    1,
    0
  ]
},
{
  "id": "fokusfassung",
  "name": "Leere Fokusfassung",
  "category": "Unverzaubertes Zubehör",
  "type": "Unverzaubertes Zubehör",
  "unit": "1 Messingfassung",
  "price": {
    "min": 8,
    "max": 8,
    "unit": "K"
  },
  "image": "/AleriaAlmanach/assets/herluin-lothaire/goods/fokusfassung.png",
  "tags": [
    "Unverzaubertes Zubehör"
  ],
  "desc": "Eine kleine Messingfassung für einen später einzusetzenden Kristall.",
  "stats": [
    0,
    0,
    0,
    0,
    1,
    0
  ]
},
{
  "id": "kristallbeutel",
  "name": "Gepolsterter Kristallbeutel",
  "category": "Unverzaubertes Zubehör",
  "type": "Unverzaubertes Zubehör",
  "unit": "1 Beutel",
  "price": {
    "min": 3,
    "max": 3,
    "unit": "K"
  },
  "image": "/AleriaAlmanach/assets/herluin-lothaire/goods/kristallbeutel.png",
  "tags": [
    "Unverzaubertes Zubehör"
  ],
  "desc": "Ein innen gepolsterter Stoffbeutel zum Transport kleiner empfindlicher Steine.",
  "stats": [
    0,
    0,
    0,
    0,
    1,
    0
  ]
},
{
  "id": "buchschliesse",
  "name": "Buchschließe",
  "category": "Unverzaubertes Zubehör",
  "type": "Unverzaubertes Zubehör",
  "unit": "1 Beschlagsatz",
  "price": {
    "min": 5,
    "max": 5,
    "unit": "K"
  },
  "image": "/AleriaAlmanach/assets/herluin-lothaire/goods/buchschliesse.png",
  "tags": [
    "Unverzaubertes Zubehör"
  ],
  "desc": "Ein kleiner Satz aus Messingschließe und Gegenstück für ein Arbeitsbuch.",
  "stats": [
    0,
    0,
    0,
    0,
    1,
    0
  ]
},
{
  "id": "amethyst",
  "name": "Amethyst",
  "category": "Edel- & Schmucksteine",
  "type": "Edel- & Schmucksteine",
  "unit": "1 kleiner Schmuckstein · etwa 0,2 g",
  "price": {
    "min": 18,
    "max": 18,
    "unit": "K"
  },
  "image": "/AleriaAlmanach/assets/herluin-lothaire/goods/amethyst.png",
  "tags": [
    "Edel- & Schmucksteine"
  ],
  "desc": "Ein kleiner handelsüblicher Amethyst. Größe, Reinheit und Schliff sind bescheiden; ohne gespeicherte Magicka, Seele oder Verzauberung.",
  "stats": [
    0,
    0,
    0,
    0,
    1,
    0
  ]
},
{
  "id": "rubin",
  "name": "Rubin",
  "category": "Edel- & Schmucksteine",
  "type": "Edel- & Schmucksteine",
  "unit": "1 kleiner Schmuckstein · etwa 0,2 g",
  "price": {
    "min": 90,
    "max": 90,
    "unit": "K"
  },
  "image": "/AleriaAlmanach/assets/herluin-lothaire/goods/rubin.png",
  "tags": [
    "Edel- & Schmucksteine"
  ],
  "desc": "Ein kleiner handelsüblicher Rubin. Größe, Reinheit und Schliff sind bescheiden; ohne gespeicherte Magicka, Seele oder Verzauberung.",
  "stats": [
    0,
    0,
    0,
    0,
    1,
    0
  ]
},
{
  "id": "saphir",
  "name": "Saphir",
  "category": "Edel- & Schmucksteine",
  "type": "Edel- & Schmucksteine",
  "unit": "1 kleiner Schmuckstein · etwa 0,2 g",
  "price": {
    "min": 80,
    "max": 80,
    "unit": "K"
  },
  "image": "/AleriaAlmanach/assets/herluin-lothaire/goods/saphir.png",
  "tags": [
    "Edel- & Schmucksteine"
  ],
  "desc": "Ein kleiner handelsüblicher Saphir. Größe, Reinheit und Schliff sind bescheiden; ohne gespeicherte Magicka, Seele oder Verzauberung.",
  "stats": [
    0,
    0,
    0,
    0,
    1,
    0
  ]
},
{
  "id": "smaragd",
  "name": "Smaragd",
  "category": "Edel- & Schmucksteine",
  "type": "Edel- & Schmucksteine",
  "unit": "1 kleiner Schmuckstein · etwa 0,2 g",
  "price": {
    "min": 85,
    "max": 85,
    "unit": "K"
  },
  "image": "/AleriaAlmanach/assets/herluin-lothaire/goods/smaragd.png",
  "tags": [
    "Edel- & Schmucksteine"
  ],
  "desc": "Ein kleiner handelsüblicher Smaragd. Größe, Reinheit und Schliff sind bescheiden; ohne gespeicherte Magicka, Seele oder Verzauberung.",
  "stats": [
    0,
    0,
    0,
    0,
    1,
    0
  ]
},
{
  "id": "diamant",
  "name": "Diamant",
  "category": "Edel- & Schmucksteine",
  "type": "Edel- & Schmucksteine",
  "unit": "1 kleiner Schmuckstein · etwa 0,2 g",
  "price": {
    "min": 160,
    "max": 160,
    "unit": "K"
  },
  "image": "/AleriaAlmanach/assets/herluin-lothaire/goods/diamant-v2.png",
  "tags": [
    "Edel- & Schmucksteine"
  ],
  "desc": "Ein kleiner handelsüblicher Diamant. Größe, Reinheit und Schliff sind bescheiden; ohne gespeicherte Magicka, Seele oder Verzauberung.",
  "stats": [
    0,
    0,
    0,
    0,
    1,
    0
  ]
},
{
  "id": "opal",
  "name": "Opal",
  "category": "Edel- & Schmucksteine",
  "type": "Edel- & Schmucksteine",
  "unit": "1 kleiner Schmuckstein · etwa 0,2 g",
  "price": {
    "min": 55,
    "max": 55,
    "unit": "K"
  },
  "image": "/AleriaAlmanach/assets/herluin-lothaire/goods/opal.png",
  "tags": [
    "Edel- & Schmucksteine"
  ],
  "desc": "Ein kleiner handelsüblicher Opal. Größe, Reinheit und Schliff sind bescheiden; ohne gespeicherte Magicka, Seele oder Verzauberung.",
  "stats": [
    0,
    0,
    0,
    0,
    1,
    0
  ]
},
{
  "id": "topas",
  "name": "Topas",
  "category": "Edel- & Schmucksteine",
  "type": "Edel- & Schmucksteine",
  "unit": "1 kleiner Schmuckstein · etwa 0,2 g",
  "price": {
    "min": 25,
    "max": 25,
    "unit": "K"
  },
  "image": "/AleriaAlmanach/assets/herluin-lothaire/goods/topas.png",
  "tags": [
    "Edel- & Schmucksteine"
  ],
  "desc": "Ein kleiner handelsüblicher Topas. Größe, Reinheit und Schliff sind bescheiden; ohne gespeicherte Magicka, Seele oder Verzauberung.",
  "stats": [
    0,
    0,
    0,
    0,
    1,
    0
  ]
},
{
  "id": "granat",
  "name": "Granat",
  "category": "Edel- & Schmucksteine",
  "type": "Edel- & Schmucksteine",
  "unit": "1 kleiner Schmuckstein · etwa 0,2 g",
  "price": {
    "min": 20,
    "max": 20,
    "unit": "K"
  },
  "image": "/AleriaAlmanach/assets/herluin-lothaire/goods/granat.png",
  "tags": [
    "Edel- & Schmucksteine"
  ],
  "desc": "Ein kleiner handelsüblicher Granat. Größe, Reinheit und Schliff sind bescheiden; ohne gespeicherte Magicka, Seele oder Verzauberung.",
  "stats": [
    0,
    0,
    0,
    0,
    1,
    0
  ]
},
{
  "id": "aquamarin",
  "name": "Aquamarin",
  "category": "Edel- & Schmucksteine",
  "type": "Edel- & Schmucksteine",
  "unit": "1 kleiner Schmuckstein · etwa 0,2 g",
  "price": {
    "min": 35,
    "max": 35,
    "unit": "K"
  },
  "image": "/AleriaAlmanach/assets/herluin-lothaire/goods/aquamarin-v2.png",
  "tags": [
    "Edel- & Schmucksteine"
  ],
  "desc": "Ein kleiner handelsüblicher Aquamarin. Größe, Reinheit und Schliff sind bescheiden; ohne gespeicherte Magicka, Seele oder Verzauberung.",
  "stats": [
    0,
    0,
    0,
    0,
    1,
    0
  ]
},
{
  "id": "turmalin",
  "name": "Turmalin",
  "category": "Edel- & Schmucksteine",
  "type": "Edel- & Schmucksteine",
  "unit": "1 kleiner Schmuckstein · etwa 0,2 g",
  "price": {
    "min": 30,
    "max": 30,
    "unit": "K"
  },
  "image": "/AleriaAlmanach/assets/herluin-lothaire/goods/turmalin.png",
  "tags": [
    "Edel- & Schmucksteine"
  ],
  "desc": "Ein kleiner handelsüblicher Turmalin. Größe, Reinheit und Schliff sind bescheiden; ohne gespeicherte Magicka, Seele oder Verzauberung.",
  "stats": [
    0,
    0,
    0,
    0,
    1,
    0
  ]
},
{
  "id": "jade",
  "name": "Jade",
  "category": "Edel- & Schmucksteine",
  "type": "Edel- & Schmucksteine",
  "unit": "1 kleiner Schmuckstein · etwa 0,2 g",
  "price": {
    "min": 15,
    "max": 15,
    "unit": "K"
  },
  "image": "/AleriaAlmanach/assets/herluin-lothaire/goods/jade.png",
  "tags": [
    "Edel- & Schmucksteine"
  ],
  "desc": "Ein kleiner handelsüblicher Jade. Größe, Reinheit und Schliff sind bescheiden; ohne gespeicherte Magicka, Seele oder Verzauberung.",
  "stats": [
    0,
    0,
    0,
    0,
    1,
    0
  ]
},
{
  "id": "bergkristall",
  "name": "Bergkristall",
  "category": "Edel- & Schmucksteine",
  "type": "Edel- & Schmucksteine",
  "unit": "1 kleiner Schmuckstein · etwa 0,2 g",
  "price": {
    "min": 5,
    "max": 5,
    "unit": "K"
  },
  "image": "/AleriaAlmanach/assets/herluin-lothaire/goods/bergkristall.png",
  "tags": [
    "Edel- & Schmucksteine"
  ],
  "desc": "Ein kleiner handelsüblicher Bergkristall. Größe, Reinheit und Schliff sind bescheiden; ohne gespeicherte Magicka, Seele oder Verzauberung.",
  "stats": [
    0,
    0,
    0,
    0,
    1,
    0
  ]
},
{
  "id": "onyx",
  "name": "Onyx",
  "category": "Edel- & Schmucksteine",
  "type": "Edel- & Schmucksteine",
  "unit": "1 kleiner Schmuckstein · etwa 0,2 g",
  "price": {
    "min": 12,
    "max": 12,
    "unit": "K"
  },
  "image": "/AleriaAlmanach/assets/herluin-lothaire/goods/onyx.png",
  "tags": [
    "Edel- & Schmucksteine"
  ],
  "desc": "Ein kleiner handelsüblicher Onyx. Größe, Reinheit und Schliff sind bescheiden; ohne gespeicherte Magicka, Seele oder Verzauberung.",
  "stats": [
    0,
    0,
    0,
    0,
    1,
    0
  ]
},
{
  "id": "mondstein",
  "name": "Mondstein",
  "category": "Edel- & Schmucksteine",
  "type": "Edel- & Schmucksteine",
  "unit": "1 kleiner Schmuckstein · etwa 0,2 g",
  "price": {
    "min": 22,
    "max": 22,
    "unit": "K"
  },
  "image": "/AleriaAlmanach/assets/herluin-lothaire/goods/mondstein.png",
  "tags": [
    "Edel- & Schmucksteine"
  ],
  "desc": "Ein kleiner handelsüblicher Mondstein. Größe, Reinheit und Schliff sind bescheiden; ohne gespeicherte Magicka, Seele oder Verzauberung.",
  "stats": [
    0,
    0,
    0,
    0,
    1,
    0
  ]
},
{
  "id": "tuerkis",
  "name": "Türkis",
  "category": "Edel- & Schmucksteine",
  "type": "Edel- & Schmucksteine",
  "unit": "1 kleiner Schmuckstein · etwa 0,2 g",
  "price": {
    "min": 12,
    "max": 12,
    "unit": "K"
  },
  "image": "/AleriaAlmanach/assets/herluin-lothaire/goods/tuerkis.png",
  "tags": [
    "Edel- & Schmucksteine"
  ],
  "desc": "Ein kleiner handelsüblicher Türkis. Größe, Reinheit und Schliff sind bescheiden; ohne gespeicherte Magicka, Seele oder Verzauberung.",
  "stats": [
    0,
    0,
    0,
    0,
    1,
    0
  ]
},
{
  "id": "bernstein",
  "name": "Bernstein",
  "category": "Edel- & Schmucksteine",
  "type": "Edel- & Schmucksteine",
  "unit": "1 kleiner Schmuckstein · etwa 0,2 g",
  "price": {
    "min": 10,
    "max": 10,
    "unit": "K"
  },
  "image": "/AleriaAlmanach/assets/herluin-lothaire/goods/bernstein.png",
  "tags": [
    "Edel- & Schmucksteine"
  ],
  "desc": "Ein kleiner handelsüblicher Bernstein. Größe, Reinheit und Schliff sind bescheiden; ohne gespeicherte Magicka, Seele oder Verzauberung.",
  "stats": [
    0,
    0,
    0,
    0,
    1,
    0
  ]
},
{
  "id": "perle",
  "name": "Perle",
  "category": "Edel- & Schmucksteine",
  "type": "Edel- & Schmucksteine",
  "unit": "1 kleiner Schmuckstein · etwa 0,2 g",
  "price": {
    "min": 24,
    "max": 24,
    "unit": "K"
  },
  "image": "/AleriaAlmanach/assets/herluin-lothaire/goods/perle.png",
  "tags": [
    "Edel- & Schmucksteine"
  ],
  "desc": "Ein kleiner handelsüblicher Perle. Größe, Reinheit und Schliff sind bescheiden; ohne gespeicherte Magicka, Seele oder Verzauberung.",
  "stats": [
    0,
    0,
    0,
    0,
    1,
    0
  ]
},
{
  "id": "lapislazuli",
  "name": "Lapislazuli",
  "category": "Edel- & Schmucksteine",
  "type": "Edel- & Schmucksteine",
  "unit": "1 kleiner Schmuckstein · etwa 0,2 g",
  "price": {
    "min": 14,
    "max": 14,
    "unit": "K"
  },
  "image": "/AleriaAlmanach/assets/herluin-lothaire/goods/lapislazuli.png",
  "tags": [
    "Edel- & Schmucksteine"
  ],
  "desc": "Ein kleiner handelsüblicher Lapislazuli. Größe, Reinheit und Schliff sind bescheiden; ohne gespeicherte Magicka, Seele oder Verzauberung.",
  "stats": [
    0,
    0,
    0,
    0,
    1,
    0
  ]
},
{
  "id": "malachit",
  "name": "Malachit",
  "category": "Edel- & Schmucksteine",
  "type": "Edel- & Schmucksteine",
  "unit": "1 kleiner Schmuckstein · etwa 0,2 g",
  "price": {
    "min": 8,
    "max": 8,
    "unit": "K"
  },
  "image": "/AleriaAlmanach/assets/herluin-lothaire/goods/malachit.png",
  "tags": [
    "Edel- & Schmucksteine"
  ],
  "desc": "Ein kleiner handelsüblicher Malachit. Größe, Reinheit und Schliff sind bescheiden; ohne gespeicherte Magicka, Seele oder Verzauberung.",
  "stats": [
    0,
    0,
    0,
    0,
    1,
    0
  ]
},
{
  "id": "zirkon",
  "name": "Zirkon",
  "category": "Edel- & Schmucksteine",
  "type": "Edel- & Schmucksteine",
  "unit": "1 kleiner Schmuckstein · etwa 0,2 g",
  "price": {
    "min": 28,
    "max": 28,
    "unit": "K"
  },
  "image": "/AleriaAlmanach/assets/herluin-lothaire/goods/zirkon.png",
  "tags": [
    "Edel- & Schmucksteine"
  ],
  "desc": "Ein kleiner handelsüblicher Zirkon. Größe, Reinheit und Schliff sind bescheiden; ohne gespeicherte Magicka, Seele oder Verzauberung.",
  "stats": [
    0,
    0,
    0,
    0,
    1,
    0
  ]
});
