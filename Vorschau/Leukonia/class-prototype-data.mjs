/** Sieben bestätigte Rollen als Bildentwürfe; eigene Klassennamen bleiben offen. */
export const CLASS_PROTOTYPES = [
  {
    id: 'prototype-01', name: 'Prototyp 1', role: 'Schwerer Infanterist',
    description: 'Schwere Infanterie mit Schwert oder Axt, gelegentlich mit Turmschild. Der Bildentwurf zeigt Schwert und Turmschild.',
    equipment: ['Schwert oder Axt', 'gegebenenfalls Turmschild'],
    image: 'assets/warriors/previews/prototype-01.webp', fullsize: 'assets/warriors/production/prototype-01.png', original: 'assets/warriors/production/prototype-01.png', ready: true,
    mount: null, status: 'proposal', statusNote: 'Klassenname offen',
  },
  {
    id: 'prototype-02', name: 'Prototyp 2', role: 'Schwer gepanzerter Lanzenträger',
    description: 'Ein schwer gepanzerter Kämpfer mit langer Lanze.',
    equipment: ['Lanze', 'schwere Rüstung'],
    image: 'assets/warriors/previews/prototype-02.webp', fullsize: 'assets/warriors/production/prototype-02.png', original: 'assets/warriors/production/prototype-02.png', ready: true,
    mount: null, status: 'proposal', statusNote: 'Klassenname offen',
  },
  {
    id: 'prototype-03', name: 'Prototyp 3', role: 'Berittener mit Schwert · Kataphrakt',
    description: 'Ein gepanzerter Reiter mit Schwert. Der Bildentwurf verwendet den im Bestiarium belegten Equo als militärisches Pferd Argentums.',
    equipment: ['Reiterschwert', 'schwere Rüstung'],
    image: 'assets/warriors/previews/prototype-03.webp', fullsize: 'assets/warriors/production/prototype-03.png', original: 'assets/warriors/production/prototype-03.png', ready: true,
    mount: { name: 'Equo', href: '../../Bestiarium/tiere/pferde/equo/index.html' },
    status: 'proposal', statusNote: 'Klassenname offen',
  },
  {
    id: 'prototype-04', name: 'Prototyp 4', role: 'Fernkämpfer mit Speer und Rückenköcher',
    description: 'Ein Fernkämpfer mit sichtbarem Rückenköcher und einem Speer in der Hand. Eine bestimmte zusätzliche Fernwaffenart ist noch nicht benannt.',
    equipment: ['Speer', 'Rückenköcher'],
    image: 'assets/warriors/previews/prototype-04.webp', fullsize: 'assets/warriors/production/prototype-04.png', original: 'assets/warriors/production/prototype-04.png', ready: true,
    mount: null, status: 'proposal', statusNote: 'Klassenname offen',
  },
  {
    id: 'prototype-05', name: 'Prototyp 5', role: 'Mariner und Kleriker des Zephyr',
    description: 'Ein besonderer, seltener Mariner und Kleriker des Zephyr. Edle, pompöse Ausrüstung, Säbel und Rückenköcher prägen diesen Entwurf.',
    equipment: ['Säbel', 'Rückenköcher'],
    image: 'assets/warriors/previews/prototype-05.webp', fullsize: 'assets/warriors/production/prototype-05.png', original: 'assets/warriors/production/prototype-05.png', ready: true,
    mount: null, status: 'proposal', statusNote: 'Klassenname offen',
  },
  {
    id: 'prototype-06', name: 'Prototyp 6', role: 'Miliz · einfacher Legionär',
    description: 'Ein einfacher Legionär. Schwert und schlichter Oval-Schild sind für diesen Bildentwurf gewählt.',
    equipment: ['Schwert und Schild im Bildentwurf'],
    image: 'assets/warriors/previews/prototype-06.webp', fullsize: 'assets/warriors/production/prototype-06.png', original: 'assets/warriors/production/prototype-06.png', ready: true,
    mount: null, status: 'proposal', statusNote: 'Klassenname offen',
  },
  {
    id: 'prototype-07', name: 'Prototyp 7', role: 'Römischer Kampfbarde',
    description: 'Ein römischer Kampfbarde mit Säbel und Instrument. Der Bildentwurf verwendet eine tragbare Leier.',
    equipment: ['Säbel', 'Instrument'],
    image: 'assets/warriors/previews/prototype-07.webp', fullsize: 'assets/warriors/production/prototype-07.png', original: 'assets/warriors/production/prototype-07.png', ready: true,
    mount: null, status: 'proposal', statusNote: 'Klassenname offen',
  },
];
