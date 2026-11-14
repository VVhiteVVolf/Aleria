const plain = (value, maximum = 1200) => String(value || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, maximum);

export function createSceneElementAiScene(thread = {}, comments = []) {
  return {
    module: plain(thread.entry?.title, 180), title: plain(thread.page?.pageTitle, 180),
    situation: plain(thread.page?.sessionIntro || thread.page?.description),
    interactionSources: comments.flatMap(comment => {
      if (comment.serverValidatedMechanics !== true || comment.importedHistoricalMechanics) return [];
      const event = comment.herausforderung, signal = comment.sceneElementSignal;
      if (event && ['item', 'puzzle'].includes(event.elementType)) return [{ sourceId: comment.id, type: event.elementType, title: plain(event.title, 180) }];
      if (signal?.visible && signal.state === 'armed') return [{ sourceId: signal.id, type: signal.elementType, title: plain(signal.title, 180) }];
      return [];
    })
  };
}

export function createSceneElementAiGuide() {
  return {
    copyPrompt: 'Du unterstützt mich beim Entwickeln einer spielbaren Idee für AleriaAlmanach. Dieses Paket enthält den nötigen Systemkontext. Meine Idee: [hier einsetzen]. Schlage zunächst eine kurze stimmige Ausarbeitung mit Elementart, sichtbarer Situation, Proben und Folgen vor. Triff kleine reversible Gestaltungsentscheidungen selbst; frage nur nach wirklich fehlenden Angaben. Sobald ich „Import-JSON“ sage, liefere genau ein JSON-Objekt {"format":"aleria.herausforderung","version":1,"challenge":{...}} ohne Markdown oder Erklärung. Erfinde keine Figuren-, Bild- oder Register-IDs. Verwende die vorhandenen Mechaniken statt neue Regeln zu behaupten.',
    aleria: 'AleriaAlmanach ist ein Fantasy-Weltenalmanach mit Modulen und eigenen interaktiven Szenenseiten. Eine Szene verbindet ein Bild und eine Einleitung mit einem fortlaufenden Rollenspiel-Kommentarverlauf. Figuren sprechen/handeln in Beiträgen mit mehreren Abschnitten; Proben und Kampfhandlungen sind strukturierte Abschnitte desselben Editors. Der Erzähler bereitet Situationen vor; die Spieler entscheiden mit ihren tatsächlichen Charakter- oder Kreaturenbögen.',
    workflow: ['Eine Idee kann zuerst frei ausgearbeitet werden; Regeln müssen noch kein fertiges JSON sein.',
      'Eine passende Elementart wählen. Öffentliche Wahrnehmung und verdeckte Lösung/Ergebnisse getrennt schreiben.',
      'Pro Lösungsweg passende Proben, SG, Erfolg, Teilhinweis und Fehlschlag festlegen. Bei Gefahren zusätzlich Auslöser, Entdeckung und Reaktion.',
      'Bei „Import-JSON“ ausschließlich das vereinbarte JSON liefern. Ein Paket enthält genau ein Element. Mehrere verbundene Elemente nacheinander erstellen; nach dem ersten Speichern dessen echte sourceId verwenden.',
      'Der Nutzer importiert einen Entwurf, prüft Vorschau und Regeln und veröffentlicht ausdrücklich. JSON führt weder Skripte noch eigenständige Spielwrites aus.'],
    types: {
      challenge: 'Klassische Herausforderung mit bis zu sechs Lösungswegen; all schließt sie unabhängig ab, any beendet das Element nach einem Erfolg.',
      narration: 'Nur Titel, Bild und Flavortext; approaches:[], activation.enabled:false. Keine Probe, Reaktion oder mechanische Folge erforderlich.',
      item: 'Ein Gegenstand wird mit Bild/Flavortext und Lösungswegen präsentiert. Bewusstes „Jetzt interagieren“ kann eine verknüpfte Vorbereitung auslösen. Präsentation oder Berührung überträgt keinen Besitz.',
      puzzle: 'Fragezeichen in der einklappbaren rechten Leiste; großes Fenster mit Inhalt und erlaubten Proben. Ein Lösungsweg kann z. B. Nachforschung, Arkane Kunde, Wahrnehmung und Fingerfertigkeit als gleichberechtigte Alternativen anbieten. Standard completionMode:any.',
      danger: 'Private Vorbereitung bis zum Auslöser, optional vorher neutrales Interaktionssymbol. Erst bei Auslösung erscheint die Gefahr als Herausforderung mit gespeicherter Entdeckung und genau einer verpflichtend angebotenen Reaktion der betroffenen Figur, auch bei Fehlschlag. Das System erzwingt keinen automatischen Spielerbeitrag.'
    },
    mechanics: [
      'W20 + echter Bogenwert gegen SG 1–40. Ausbildung, Eigenschaften, Marotten, Ausrüstung, aktive Zustände, Boni/Mali und geltende Wurfarten berechnet das System. Keine pauschalen Figurenboni im Entwurf nachbauen. preferredSkills erlaubt genau diese Proben; pro Versuch wird eine gewählt.',
      'Attributswurf ohne Übungsbonus; Rettungswurf mit eigener Ausbildung. checkPenalties erlaubt begründete feste Mali −30..0 je erlaubter Probe. Keine frei erfundenen Zahlenfelder.',
      'Ohne outcomeTable: Erfolg deckt insight auf. 1–3 Punkte unter SG: partialHint/partialEffects. Weiter darunter: failureConsequence/failureEffects. Natürliche 20/1 verwenden die bestehenden kritischen Regeln; Bogenregeln können Ergebnisse verändern. Bei saving throws und Sonderregeln bleibt die bestehende Engine maßgeblich.',
      'Optional outcomeTable: 3–10 exklusive Ergebnisstufen mit natürlicher 20, natürlicher 1 und einer regulären Auffangstufe. Genau eine Stufe gilt. attemptLimit:1 erlaubt einen Versuch; bei ausgelösten Gefahren gilt insgesamt nur eine Reaktion über alle Alternativen.',
      'rewards bei Erfolg; partialEffects/failureEffects bei Fehlschlag. Geld (copper in KT) und Registergegenstände nur bei Erfolg. Geld/Gegenstände werden atomar ins bestehende Inventar vergeben, kein automatischer Besitz durch Flavortext. Dieselbe Belohnung/Folge wird nicht beliebig erneut gestapelt.',
      'effects: Buff/Debuff/Zustand mit gültiger Dauer und strukturierter mechanics. combatEffects: Schaden, Heilung, temporäre TP, Ressource auffüllen/entziehen, Zustand entfernen oder vorhandenes Waffenmanöver. Schaden verwendet Schutz, Resistenzen, Immunitäten und Konzentration. Kritische Fertigkeitsproben verdoppeln diese Folgen nicht.',
      'Bedingungen: neue echte Figurenbeiträge seit Scharfschaltung, passive Fertigkeit oder ausdrückliche Interaktion; bis zu sechs, mode:any = ODER, all = UND. Interaktion mit diesem noch verborgenen Element braucht showSignal:true (Gegenstände sind bereits sichtbar); sonst eine echte vorhandene sourceId wählen. Keine verschachtelten AND/OR-Gruppen, Timer, freie Skripte oder Texträtsel-Antwortfelder. Bearbeiten, Neuladen und Systemkarten erhöhen den Beitragszähler nicht.',
      'Passive Wahrnehmung stammt direkt vom Bogen; andere passive Fertigkeiten sind 10 + tatsächlicher Fertigkeitswert. Schwellen sind inklusive: minimum:21 bedeutet über 20. Nur bereits beteiligte Figuren werden geprüft. Ein erfüllter passiver Auslöser entdeckt die Gefahr bereits; sonst optional verdeckter Wurf.',
      'Bei Gefahr Zielwahl random oder fixed mit echter actorId. Eine bewusste passende Interaktion bevorzugt ihren tatsächlichen Interaktor. Erkannt gewährt Vorteil auf die Reaktion, unbemerkt Nachteil; vorhandene Vor-/Nachteile werden regulär verrechnet. detection verursacht selbst keinen Fallenschaden: Rettung und Folgen gehören in approaches.',
      'activation.saveContext benennt Ursache, Schadensart und Gefahren für passende Merkmale. actionKind: leer/spell/prayer/song/weapon/technique; damageType: leer/hieb/stich/wucht/feuer/kälte/blitz/gift/säure/donner/nekrotisch/strahlend/psychisch; saveTags: fear/poison/bleeding/prone/forced-movement. Keine erfundenen Auslöser oder automatische Immunität aus Prosa.',
      'Zielgruppe audience (wer versucht), targetActor (Ansprechpartner/Gegner), activation.target (wer von der Gefahr betroffen ist) und targetActorId einer Wirkung (wer sie erhält) sind verschieden. Fremde Wirkungsempfänger, Kampfteilnehmer-Zielgruppe und Dauer bis Kampfende verlangen den tatsächlichen aktiven Kampf. IDs kommen aus dem beigefügten Kontext.',
      'Bild optional sceneImage:{url,alt,caption,format,fit}; nur bekannte Pfade/Links. format original/16:9/3:2/4:3/1:1/2:3/9:16/21:9, fit contain/cover. Sichtbare Texte/Bilder verraten keine Lösung. Folgeprosa bleibt erzählerisch; tatsächliche Regeln stehen strukturiert in Wirkungspaketen.',
      'Veröffentlichte Texte und Schwellen bleiben bearbeitbar; gespeicherte Würfe, Inventarbuchungen und Folgen werden nicht rückwirkend neu berechnet. Vorbereitungen können deaktiviert/bearbeitet/scharfgeschaltet werden; ausgelöste Vorbereitungen nicht erneut auslösen. Die einklappbare Leiste ist eine persönliche Browseransicht.'
    ],
    limits: ['Die KI gestaltet genau die hier unterstützten Szenenelemente; sie importiert keine vollständigen Module, Figurenbögen, Kampfbegegnungen, Handelsläden oder Bilddateien.',
      'Andere Almanachwerkzeuge wie Handel, Rast/Regeneration, Szenenzeit, Ortswechsel, Kampfliste, Abstimmungen, Anhänge und Fazit bleiben eigenständige Werkzeuge. Bei Bedarf als redaktionellen Anschluss vorschlagen, nicht durch neue JSON-Felder simulieren.',
      'Das Paket ist ein begrenzter aktueller Ausschnitt, keine vollständige Aleria-Lore oder vollständige Figuren-/Inventarakte. Keine Hauszugehörigkeit, Biografie, Vorgeschichte oder unbekannte Spielwerte erfinden.',
      'Fehlende Bilder weglassen. Fehlende Registerbelohnungen durch einen unverbindlichen Vorschlag beschreiben oder deren echte Referenz anfordern. Die vollständige Referenz ist nur bei Bedarf zusätzlich erforderlich.']
  };
}

export function createSceneElementAiExamples() {
  const make = challenge => ({ format: 'aleria.herausforderung', version: 1, challenge });
  const approach = { approachId: 'runen', label: 'Die Runen entschlüsseln', preferredSkills: ['arcane-kunde', 'investigation', 'perception', 'sleight-of-hand'], difficulty: 17,
    insight: 'Die Zeichen nennen den nördlichen Durchgang.', partialHint: 'Zwei Zeichen wiederholen sich wie eine Richtungsangabe.', failureConsequence: 'Die Anordnung bleibt unverständlich.' };
  return {
    challenge: make({ elementType: 'challenge', title: 'Die Torwache', publicDescription: 'Eine Wache hält vor dem geschlossenen Tor die Hand auf.',
      approaches: [{ approachId: 'verhandeln', label: 'Die Wache überzeugen', preferredSkills: ['persuasion'], difficulty: 15, insight: 'Die Wache lässt euch nach Prüfung eures Anliegens passieren.' }] }),
    narration: make({ elementType: 'narration', title: 'Ein Lichtstreifen', publicDescription: 'Ein schmaler Lichtstreifen wandert über die alten Steine. Für einen Moment wird es still.', approaches: [] }),
    puzzle: make({ elementType: 'puzzle', title: 'Runen der Schwelle', publicDescription: 'Vier Zeichen kreuzen sich über einem alten Tor.', approaches: [approach] }),
    item: make({ elementType: 'item', title: 'Die versiegelte Truhe', publicDescription: 'Ein Kästchen aus dunklem Holz trägt ein sternförmiges Schloss.', approaches: [{ ...approach, approachId: 'schloss', label: 'Das Schloss untersuchen', preferredSkills: ['investigation', 'sleight-of-hand'], insight: 'Ein verborgener Haken hält den Deckel fest.' }] }),
    danger: make({ elementType: 'danger', title: 'Die Bodenplatte', publicDescription: 'Ein Mechanismus fährt aus dem Stein.', completionMode: 'any',
      activation: { enabled: true, showSignal: false, mode: 'any', conditions: [{ type: 'comments', minimum: 6 }, { type: 'passive', skillId: 'perception', minimum: 21 }],
        target: { mode: 'random' }, detection: { enabled: true, skillId: 'perception', difficulty: 17, detectedText: 'Ein feines Klicken warnt dich rechtzeitig.', missedText: 'Erst der Schmerz verrät den Mechanismus.' },
        saveContext: { actionKind: '', damageType: 'stich', saveTags: [] } },
      approaches: [{ approachId: 'ausweichen', label: 'Der Falle ausweichen', preferredSkills: ['save:dexterity'], difficulty: 15, insight: 'Die Nadel streift an dir vorbei.',
        partialHint: 'Du weichst zur Seite, doch die Nadel erwischt dich.', failureConsequence: 'Die Nadel trifft dich.',
        partialEffects: { combatEffects: [{ effectId: 'streifer', type: 'damage', amount: 3, damageType: 'stich' }] },
        failureEffects: { combatEffects: [{ effectId: 'nadel', type: 'damage', amount: 6, damageType: 'stich' }] } }] })
  };
}
