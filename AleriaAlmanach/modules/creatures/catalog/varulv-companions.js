import { createHouseholdCompanion } from './household-companion-profiles.js?v=20261013-wolfshorn-v1';

export const SKALLI_VARULV_ID = 'person--haus-varulv--skalli-varulv';
export const ASTRID_NAMESAKE_HISTORY = 'Skalli benannte ihr Pferd nach ihrer Vorfahrin Astrid Varulv (1603–1627). Astrid wurde 1627 bei ihrer Hochzeit gemeinsam mit Roger Vaeren, dem König von Aldrimar, vergiftet. Skalli erinnert mit dem Namen an diese beinahe Königin, der man nachsagt, eine große Schildmaid gewesen zu sein.';

const astrid = createHouseholdCompanion({
  profile: 'horse', slug: 'astrid', name: 'Astrid', ownerSlug: 'skalli',
  ownerId: SKALLI_VARULV_ID, ownerName: 'Skalli Varulv',
  species: 'Roh-Rhyfel (Hest × Ceffyl)', level: 3, scores: [16, 14, 14, 2, 12, 12],
  location: 'Celtigerns Wacht', house: 'Haus Varulv', habitat: 'Celtigerns Wacht, Gwynthor',
  portrait: 'https://firebasestorage.googleapis.com/v0/b/aleriaprojekt.firebasestorage.app/o/family-assets%2Fhaus-varulv%2Fc8729937-92ea-482e-961c-9eea55d49798%2Foriginal.png?alt=media',
  description: 'Astrid ist Skalli Varulvs Roh-Rhyfel aus Hest und Ceffyl: ein kräftiger Schimmel mit dichtem Fell, edler Halslinie und kurz geknoteter Mähne. Das gut reitbare Ross verbindet die Erhabenheit des Ceffyl mit der rohen Kraft des Hest. Am Sattel hängt das Varulv-Wappenschild. ' + ASTRID_NAMESAKE_HISTORY,
  abilities: [['Kraft und Reitqualität', 'Verbindet kräftigen Körperbau und dichten Fesselbehang mit einer ausgewogenen, gut reitbaren Gestalt. Vertraute Führung hilft beim Umgang mit dem eigenwilligen Ross; schwieriges Gelände und außergewöhnliche Gefahr verlangen weiterhin passende Proben.']]
});

export const ASTRID_CREATURE_SOURCE = {
  ...astrid,
  bestiaryReference: { id: 'tiere/pferde/zuchtbuch/roh-rhyfel' },
  bestiaryAncestry: { references: [{ id: 'tiere/pferde/hest' }, { id: 'tiere/pferde/ceffyl' }],
    notes: 'Direkte Kreuzung, im Zuchtbuch Roh-Rhyfel genannt. Aus solchen Pferden entwickelte sich später die gefestigte Rhyfel-Linie.' },
  portraitCaption: 'Astrid · Roh-Rhyfel · Skalli Varulv',
  biography: {
    ...astrid.biography,
    appearance: 'Heller Schimmel mit sanfter grauer Apfelung, grauem Maul und dunklen Hufen. Kräftige Schultern, tiefe Brust und starke Hinterhand verbinden sich mit einer edleren Hals- und Kopflinie. Dichtes Fell und ausgeprägter Fesselbehang, ohne einen übermäßig kantigen oder sperrigen Körperbau. Die silberweiße Mähne ist kurz und dicht am Hals geknotet. Schlichtes braunes Sattelzeug und eine rote Satteldecke; am Sattel hängt ein Rundschild mit dem weißen heulenden Wolf des Hauses Varulv auf rotem Grund.',
    personality: 'Stolz, wachsam und eigenwillig, mit erhabener Haltung und zurückgehaltener Kraft. Unter vertrauter Führung ein gut reitbares Pferd. Die direkte Roh-Rhyfel-Kreuzung ist in Körperbau und Temperament weniger vorhersehbar als die gefestigte Rhyfel-Linie.',
    history: ASTRID_NAMESAKE_HISTORY + ' Das Pferd entstammt einer direkten Kreuzung von Hest und Ceffyl. Aus solchen Verbindungen entwickelte sich später der Rhyfel; unmittelbare Kreuzungen beider Ausgangsrassen werden bis heute als Roh-Rhyfel gezüchtet.',
    bonds: 'Besitzerin und Reiterin: Skalli Varulv, Fenrir Varulvs Schwester. Der Name erinnert an Astrid Varulv, die beinahe Königin und überlieferte große Schildmaid ihrer Familie.',
    habits: 'Die Mähne wird kurz geknotet. Das dichte Fell und der Fesselbehang werden regelmäßig gepflegt. Bei vertrauter, aufmerksamer Führung zeigt Astrid ihre gute Reitbarkeit.',
    facts: [...astrid.biography.facts,
      { label: 'Rasse', value: 'Roh-Rhyfel' }, { label: 'Abstammung', value: 'Hest × Ceffyl; direkte Kreuzung' },
      { label: 'Besitz', value: 'Skalli Varulv' }, { label: 'Fellfarbe', value: 'Schimmel mit grauer Apfelung' },
      { label: 'Namenspatin', value: 'Astrid Varulv (1603–1627), beinahe Königin und überlieferte Schildmaid' },
      { label: 'Ausstattung', value: 'Rundschild mit Varulv-Wappen am Sattel' }],
    traits: [{ title: 'Rohe Kraft, edle Haltung', detail: 'Kräftiger Hest-Einfluss mit der Erhabenheit und Reitqualität des Ceffyl.' },
      { title: 'Erinnerung an eine Schildmaid', detail: 'Trägt den Namen der 1627 bei ihrer Hochzeit vergifteten Astrid Varulv.' }],
    connections: [{ type: 'connection', name: 'Skalli Varulv', image: '/Stammbäume/assets/images/portraits/haus-draig/skalli-varulv.jpg', detail: 'Besitzerin und Reiterin; benannte Astrid nach ihrer Vorfahrin.' },
      { type: 'connection', name: 'Astrid Varulv', image: '/Stammbäume/assets/images/portraits/haus-varulv/astrid-varulv.png', detail: ASTRID_NAMESAKE_HISTORY }]
  }
};
