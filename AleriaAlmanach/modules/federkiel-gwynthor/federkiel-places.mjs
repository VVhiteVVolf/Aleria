import { FEDERKIEL_BANNKREIS_COURIERS } from './federkiel-couriers.mjs';

export const FEDERKIEL_PLACES = [
  {
    id: 'postzentrale',
    title: 'Die Postzentrale',
    subtitle: 'Annahme, Ausgabe und Sortierung',
    lead: { title: 'Postleitung', text: 'Führt den Schalter- und Sortierdienst. Entscheidet über Rückfragen, erneute Zustellung und Rücksendung.' },
    description: 'Unter den Arkaden der Zentralpost führen mehrere gleichwertige Schalter in die große Halle. Hier gibt man Briefe ab, erfragt den nächsten Abgang oder holt hinterlegte Post. Hinter der Halle ordnen hölzerne Fächer die Sendungen nach Stadtwegen und Fernrouten. Die Sortierung übergibt verschlossene Postsäcke mit Begleitlisten an das Lager und meldet der Kurierstation, welche Sendungen bereitstehen.',
    details: [['Publikumsdienst', 'Annahme, Versandberatung und Abholung'], ['Innenbetrieb', 'Sortierfächer und Begleitlisten'], ['Bei Rückfragen', 'Adressklärung oder Rücksendung durch die Postleitung']],
    scene: {
      title: 'Am Schalter der Zentralpost',
      intro: 'Unter dem hohen Fenster liegen ein Siegelstempel und die Schale für das Porto. Hinter dem Schalter bleibt ein Fach für den nächsten Abgang frei. Auf dem Tresen ist Platz für einen Brief, dessen Ziel erst noch geklärt werden muss.',
      hint: 'Hier lässt sich ein Brief aufgeben, erwartete Post abholen oder nach einer Zustellung fragen.'
    }
  },
  {
    id: 'schreibstube',
    title: 'Die Schreibstube',
    subtitle: 'Schreibplätze, Diktat und Vorlesen',
    lead: { title: 'Leitung der Schreibstube', text: 'Organisiert die öffentlichen Schreibplätze, teilt Schreib- und Vorlesedienste ein und wahrt die Vertraulichkeit des Dienstes.' },
    description: 'An der langen Bank stehen Papier, Federn und Tinte für eigene Briefe bereit. Wer beim Schreiben Hilfe braucht, setzt sich zu einer Schreibkraft oder diktiert den ganzen Brief. Hinter den niedrigen Wandschirmen kann man eine Nachricht vorlesen lassen. Auf Wunsch liest die Schreibkraft auch einen diktierten Brief vor der Freigabe zurück. Fertige Briefe gehen mit Zustimmung an den Schalter der Postzentrale.',
    details: [['Öffentliche Bank', 'Selbst schreiben oder Hilfe am Schreibplatz'], ['Ruhige Nischen', 'Diktat und vertrauliches Vorlesen'], ['Versand', 'Abgabe an der Postzentrale']],
    scene: {
      title: 'Hinter dem Schreibschirm',
      intro: 'Ein grüner Wandschirm dämpft die Geräusche der Schreibbank. Neben einem freien Bogen liegt ein bereits geöffneter Brief. Die Tinte steht bereit, und durch das hohe Fenster fällt genug Licht auf beide Blätter.',
      hint: 'Hier kann eine Nachricht diktiert, vorgelesen oder gemeinsam beantwortet werden.'
    }
  },
  {
    id: 'druckerei',
    title: 'Die Druckerei',
    subtitle: 'Satz, Pressen und Druckbögen',
    lead: { title: 'Leitung der Druckerei', text: 'Plant die Auflagen, stimmt Gildenaushänge mit der Postleitung ab und gibt geprüfte Druckbögen frei.' },
    description: 'Mit hölzernen Spindelpressen fertigt die Werkstatt die Aushänge für Poststellen, die Vordrucke für Begleitlisten und die Wegzettel der Staffeln. Der Satzdienst setzt und prüft jede Vorlage. An den Pressen entstehen daraus Bögen, die vor der Verteilung trocknen. Ändert sich ein Abgang, erhält die betroffene Station einen neuen Aushang mit der nächsten geeigneten Post.',
    details: [['Drucksachen', 'Aushänge, Begleitlisten und Wegzettel'], ['Freigabe', 'Korrekturabzug vor dem Auflagendruck'], ['Verteilung', 'Über die eigenen Poststationen']],
    scene: {
      title: 'Der erste Korrekturabzug',
      intro: 'Ein frischer Abzug liegt schräg auf dem Pult. Die Lettern der Vorlage warten im Winkelhaken, und im Hintergrund steht die Presse offen. Der Bogen kann noch geprüft werden, bevor der Satz für die Auflage geschlossen wird.',
      hint: 'Hier lässt sich ein neuer Aushang abgleichen oder eine Änderung an den Abgängen zur Druckfreigabe bringen.'
    }
  },
  {
    id: 'kurierstation',
    title: 'Die Kurierstation (Gestüt)',
    subtitle: 'Drei Kurierstaffeln und ein gemeinsamer Stallbetrieb',
    lead: { title: 'Leitung der Kurierstation', text: 'Koordiniert die drei Staffeln, teilt verfügbare Pferde und Ersatz ein und stimmt die Abgänge mit der Postzentrale ab.' },
    description: 'Hinter den breiten grünen Toren liegen Stallgasse, Sattelkammer und Übergabehof. Von hier aus übernehmen drei gleichrangige Staffeln die Zustellung in der Stadt, im Bannkreis und auf den Anschlusswegen zur nächsten Fernpoststation. Jede Staffel führt vier Postkuriere. Bei Ausfällen kann die Stationsleitung Personal und Pferde zwischen den Staffeln umteilen. Der gemeinsame Stallbetrieb versorgt die Tiere und hält ausgeruhte Wechselpferde bereit.',
    details: [['Kurierdienst', 'Drei Staffeln zu je vier Postkurieren'], ['Staffelaufsicht', 'Je eine Staffelführung unter der Stationsleitung'], ['Gestüt', 'Pferdepflege, Wechselpferde und Sattelzeug']],
    scene: {
      title: 'Am Tor der Kurierstation',
      imagePosition: 'center 36%',
      sessionCast: FEDERKIEL_BANNKREIS_COURIERS.map(person => person.id),
      intro: 'Noch glänzt der Hof vom Regen. Am Aufsteigeblock wartet eine verschlossene Posttasche, und vor dem offenen Tor steht ein gesatteltes Pferd bereit. Der nächste Abgang wird im Hofbuch bestätigt.',
      hint: 'Hier lässt sich Post an eine Staffel übergeben, ein verspäteter Ritt melden oder ein Pferdewechsel vorbereiten.'
    }
  },
  {
    id: 'lager',
    title: 'Das Postlager',
    subtitle: 'Umschlag, Verwahrung und Vorräte',
    lead: { title: 'Lagerleitung', text: 'Verantwortet den Überblick über übernommene Postsäcke und Vorräte. Prüft Abweichungen und meldet sie der Postleitung.' },
    description: 'Am Wagenportal werden eintreffende Postsäcke gegen die Begleitliste übernommen. Die Fächer entlang der Mittelgasse trennen wartende Sendungen nach Abgang. Rückläufer liegen unter Verschluss, bis die Postleitung über einen neuen Zustellversuch oder die Rücksendung entscheidet. Im trockenen hinteren Lager stehen Papier, leere Postsäcke, Schnüre und Siegelwachs für die Betriebsstellen bereit.',
    details: [['Umschlag', 'Begleitlisten, Siegel und Abgangsfächer'], ['Verwahrung', 'Rückläufer unter Verschluss'], ['Vorräte', 'Papier, Postsäcke und Siegelmaterial']],
    scene: {
      title: 'Übergabe am Lagertor',
      intro: 'Auf dem niedrigen Prüftisch liegt ein Postsack. Neben dem Anhänger am Hals ist das Wachssiegel gebrochen. Am Tor steht der nächste Sack bereit. Der Eintrag im Übergabebuch ist noch offen.',
      hint: 'Hier lassen sich Lieferung, Siegel und Begleitliste vor der Übernahme abgleichen.'
    }
  }
];
