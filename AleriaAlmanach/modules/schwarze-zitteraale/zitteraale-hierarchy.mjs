import { ZITTERAALE_ART, ZITTERAALE_EMBLEM, ZITTERAALE_LEADERS, ZITTERAALE_GROUPS, BRADHRITH_FORMER_MEMBERS } from './zitteraale-people.mjs';
const leader = person => ({ id: person.characterId, title: person.name, subtitle: person.role, portrait: person.portrait, text: person.character });
const anonymous = (id, title, subtitle, rank = 'komplize') => ({ id, title, subtitle, portrait: `${ZITTERAALE_ART}/portraits/${rank}.png`, text: 'Bandenbeiname und Person noch unbekannt. Dunkle Kleidung und verbergende Kopfbedeckung; keine Angehörigen einer einheitlichen Truppe.' });

export function buildZitteraaleHierarchy() {
  return { organizationTitle: 'Die Schwarzen Zitteraale', eyebrow: 'Bande · Befehle und Abhängigkeiten',
    subtitle: 'Ein Bandenhaupt · vier Köpfe des inneren Kreises · sechs Rudel', centerLabel: 'Der Schwarze Zitteraal',
    emblem: ZITTERAALE_EMBLEM, sideImage: `${ZITTERAALE_ART}/scenes/hauptquartier.png`, motto: 'Im trüben Wasser bleibt kein Name.',
    description: '<p>Der Schwarze Zitteraal entscheidet über Ziele, Beuteanteile und Strafen. Unter ihm stehen seine beiden Hände; zwei weitere Vertraute verwalten Waffen und Vorräte. Die Rudelführer empfangen begrenzte Aufträge. Kein Komplize soll mehr Wege und Kontakte kennen, als er für seinen nächsten Gang braucht.</p>',
    detailsTitle: 'Zusammensetzung', details: [
      { label: 'Führung', value: 'Fünf Rädelsführer, pyramidenartig geordnet' },
      { label: 'Rudel', value: 'Sechs Rudelführer mit jeweils zwölf aktiven Komplizen' },
      { label: 'Dargestellte aktive Stärke', value: '83 Köpfe · Führung und sechs vollständige Rudel' },
      { label: 'Frühere Hofschar', value: 'Elf Ausgeschiedene gesondert beim Hohlwegrudel; nicht Teil der aktiven Stärke' }
    ], chartTitle: 'Führung und Gruppen', treeDisplayMode: 'tabs', portraitScale: 78, cardFontScale: 88,
    chartIntro: 'Die Führungsriege steht über allen Rudeln. Jedes Rudel zeigt seinen Führer und darunter drei Reihen zu vier Komplizen. Ausgeschiedene gehören in eine eigene letzte Reihe.',
    trees: [
      { id: 'fuehrung', label: 'Führung', parentTreeId: '', levels: [
        { label: 'Bandenhaupt', nodes: [leader(ZITTERAALE_LEADERS[0])] },
        { label: 'Rechte und linke Hand', nodes: ZITTERAALE_LEADERS.slice(1, 3).map(leader) },
        { label: 'Innerer Kreis', nodes: ZITTERAALE_LEADERS.slice(3).map(leader) }
      ] },
      { id: 'gruppen', label: 'Gruppen', parentTreeId: 'fuehrung', levels: [{ label: 'Sechs Rudel unter der Führungsriege', nodes: ZITTERAALE_GROUPS.map(group => ({
        id: `zitteraale-gruppe-${group.id}`, title: group.name, subtitle: group.task, portrait: `${ZITTERAALE_ART}/portraits/rudelfuehrer.png`, text: 'Ein Rudelführer und zwölf Komplizen; die Mitglieder kennen einander unter Beinamen.'
      })) }] },
      ...ZITTERAALE_GROUPS.map(group => ({ id: group.id, label: group.name, parentTreeId: 'gruppen', levels: [
        { label: 'Rudelführer', nodes: [anonymous(`zitteraale-${group.id}-rudelfuehrer`, 'Rudelführer', group.task, 'rudelfuehrer')] },
        ...Array.from({ length: 3 }, (_, row) => ({ label: `Komplizen · Reihe ${row + 1}`, nodes: Array.from({ length: 4 }, (_, column) => anonymous(`zitteraale-${group.id}-${row + 1}-${column + 1}`, 'Komplize', `Rudel ${group.name}`)) })),
        ...(group.former ? [{ label: 'Ehemalige / Tote · Schar vom Bradrhith-Hof', nodes: [
          { ...anonymous('zitteraale-hoffuehrer-gefallen', 'Alter Rudelführer', 'Im Zweikampf gegen Sir Rhys Draig gefallen', 'rudelfuehrer'), text: 'Führte die frühere Hofschar; im Gefecht getötet. Der heutige Rudelführer ist sein Nachfolger.' },
          ...BRADHRITH_FORMER_MEMBERS.map(person => ({ id: person.id, title: person.name, subtitle: person.status, portrait: `${ZITTERAALE_ART}/portraits/komplize.png`, text: 'Überlebte den Überfall auf das Gestüt und wurde vor den gräflichen Hof gebracht. Gehört nicht zu den aktiven Reihen.' })),
          ...Array.from({ length: 7 }, (_, i) => ({ ...anonymous(`zitteraale-hofschar-gefallen-${i + 1}`, 'Gefallener Komplize', 'Bei der Verfolgung durch Sir Rhys Draig gefallen'), text: 'Einer der sieben weiteren gefallenen Komplizen. Mit dem Truppführer starben acht Angreifer; drei ergaben sich.' }))
        ] }] : [])
      ] }))
    ], levels: [], footerNote: 'Die amtliche Fahndung kennt weder die vollständige Stärke noch den Standort der Ruinenstadt. Diese Übersicht zeigt die tatsächliche Bandenordnung. Die drei Gefangenen sind nicht als bereits hingerichtet geführt.' };
}
