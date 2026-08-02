// Read-only regression fixture for the Brandhof combat scene.
// It deliberately uses the same stored comment/combat schema as live play so
// rendering regressions are visible without consuming AI tokens or Firebase data.
(function initCombatTestScene(global) {
  const TEST_THREAD_ID = 'test-brandhof-scharmuetzel::session:brandhof-3v3';
  const actors = Object.freeze({
    eelKnight: {
      id: 'scene-creature:test-brandhof:schwarzer-zitteraal-raubritter:1',
      sourceId: 'catalog-schwarzer-zitteraal-raubritter',
      name: 'Schwarzer Zitteraal Raubritter I.',
      title: 'Raubritter · Mensch',
      portrait: 'https://i.imgur.com/uLAE7V0.png'
    },
    eelArcher: {
      id: 'scene-creature:test-brandhof:schwarzer-zitteraal-schuetze:1',
      sourceId: 'catalog-schwarzer-zitteraal-schuetze',
      name: 'Schwarzer Zitteraal Schütze I.',
      title: 'Schütze · Mensch',
      portrait: 'https://i.imgur.com/001lUuF.png'
    },
    eelRaider: {
      id: 'scene-creature:test-brandhof:schwarzer-zitteraal-pluenderer:1',
      sourceId: 'catalog-schwarzer-zitteraal-pluenderer',
      name: 'Schwarzer Zitteraal Plünderer I.',
      title: 'Plünderer · Mensch',
      portrait: 'https://i.imgur.com/Q3KTHVq.png'
    },
    draigKnight: {
      id: 'scene-creature:test-brandhof:draig-lehensritter:1',
      sourceId: 'catalog-draig-lehensritter',
      name: 'Draig Lehensritter I.',
      title: 'Lehensritter · Mensch',
      portrait: 'https://i.imgur.com/sY3vKh7.png'
    },
    draigArmsman: {
      id: 'scene-creature:test-brandhof:draig-waffenknecht:1',
      sourceId: 'catalog-draig-waffenknecht',
      name: 'Draig Waffenknecht I.',
      title: 'Waffenknecht · Mensch',
      portrait: 'https://i.imgur.com/QaY77kP.png'
    },
    draigArcher: {
      id: 'scene-creature:test-brandhof:draig-schuetze:1',
      sourceId: 'catalog-draig-schuetze',
      name: 'Draig Schütze I.',
      title: 'Schütze · Mensch',
      portrait: 'https://i.imgur.com/tntwr06.png'
    }
  });

  function clone(value) {
    if (typeof structuredClone === 'function') return structuredClone(value);
    return JSON.parse(JSON.stringify(value));
  }

  function actorSegment(actor, kind, text, extra = {}) {
    return {
      kind,
      commentKind: kind,
      text,
      narrator: false,
      charName: actor.name,
      charTitle: actor.title,
      portrait: actor.portrait,
      characterId: actor.id,
      actorType: 'creature',
      creatureId: actor.sourceId,
      sceneActorId: actor.id,
      sceneActorSourceId: actor.sourceId,
      avatarKind: 'portrait',
      side: extra.side || 'left',
      durationSeconds: extra.durationSeconds ?? 4,
      ...extra
    };
  }

  function narrator(text, durationSeconds = 5) {
    return {
      kind: 'action',
      commentKind: 'action',
      text,
      narrator: true,
      charName: 'Erzähler',
      charTitle: '',
      portrait: null,
      characterId: '',
      avatarKind: 'narrator',
      side: '',
      durationSeconds
    };
  }

  function attack(actor, target, config) {
    const hit = config.natural === 20 || (config.natural !== 1 && config.natural + config.modifier >= config.defense);
    const criticalSuccess = config.natural === 20;
    const criticalFailure = config.natural === 1;
    const damage = hit ? Number(config.damage || 0) : null;
    const hpAfter = Math.max(0, Number(config.hpBefore) - Number(damage || 0));
    const actionId = `weapon:${config.weaponId}`;
    return actorSegment(actor, 'combataction', config.text, {
      side: config.side || 'left',
      durationSeconds: config.durationSeconds ?? 5,
      combatTargetId: target.id,
      combatActionId: actionId,
      combatRollMode: config.rollMode || 'normal',
      combatAction: {
        schemaVersion: 3,
        actionType: 'attack',
        actorId: actor.id,
        targetId: target.id,
        profileActionId: actionId,
        profileActionKind: 'weapon',
        rollMode: config.rollMode || 'normal',
        originalDescription: config.text
      },
      combatResolution: {
        schemaVersion: 3,
        rulesVersion: 'combat-evaluation-1',
        resolutionId: `brandhof-${config.id}`,
        actionType: 'attack',
        actorId: actor.id,
        actorName: actor.name,
        targetId: target.id,
        targetName: target.name,
        profileActionId: actionId,
        profileActionKind: 'weapon',
        weapon: {
          id: config.weaponId,
          name: config.weaponName,
          damageFormula: config.damageFormula,
          damageType: config.damageType || 'physisch'
        },
        originalDescription: config.text,
        attack: {
          notation: config.rollMode === 'advantage'
            ? `2W20 (Vorteil) + ${config.modifier}`
            : config.rollMode === 'disadvantage'
              ? `2W20 (Nachteil) + ${config.modifier}`
              : `1W20 + ${config.modifier}`,
          naturalRoll: config.natural,
          diceResults: config.rollMode === 'normal' ? [config.natural] : (config.dice || [config.natural, Math.max(1, config.natural - 4)]),
          keptDice: [config.natural],
          modifier: config.modifier,
          total: config.natural + config.modifier,
          targetDefense: config.defense,
          rollMode: config.rollMode || 'normal',
          criticalSuccess,
          criticalFailure,
          hit,
          visualMode: 'text',
          rollId: `brandhof-roll-${config.id}`
        },
        damage: hit ? {
          notation: criticalSuccess ? config.criticalDamageFormula : config.damageNotation,
          diceResults: config.damageDice || [],
          modifier: config.damageModifier || 0,
          total: damage,
          damageType: config.damageType || 'physisch',
          visualMode: 'text',
          rollId: `brandhof-damage-${config.id}`
        } : null,
        targetSnapshot: {
          currentHitPoints: config.hpBefore,
          hitPointsBefore: config.hpBefore,
          hitPointsAfter: hpAfter,
          defeated: hpAfter === 0,
          maximumHitPoints: config.targetMaximum,
          defense: config.defense,
          armorName: config.targetArmor || ''
        },
        narration: {
          source: 'deterministic-fallback',
          text: config.narration
        },
        resolvedAt: '2026-08-02T12:00:00.000Z'
      }
    });
  }

  function fixtureComment(index, segments) {
    const firstActor = segments.find(segment => !segment.narrator);
    return {
      id: `builtin-brandhof-${String(index).padStart(2, '0')}`,
      entryId: TEST_THREAD_ID,
      charName: firstActor?.charName || 'Erzähler',
      charTitle: firstActor?.charTitle || '',
      portrait: firstActor?.portrait || null,
      narrator: !firstActor,
      commentMode: firstActor ? 'creature' : 'narrator',
      commentKind: segments[0]?.commentKind || 'action',
      text: segments.map(segment => segment.text).join('\n\n'),
      commentSegments: segments,
      orderKey: index * 1000,
      createdAtClient: index * 1000,
      ts: { seconds: index },
      schemaVersion: 2,
      builtInTestFixture: true,
      _hideActions: true
    };
  }

  const comments = [
    fixtureComment(1, [
      narrator('Wind treibt Asche über den niedergebrannten Hof. Zwischen dem schwarzen Gerippe der Scheune und einem umgestürzten Karren stoßen drei Männer mit dem goldenen Aal auf drei Bewaffnete des Hauses Draig.'),
      narrator('Niemand ordnet eine Reihenfolge an. Blicke, Rufe und Bewegungen greifen ineinander; jede Kampfbeschreibung wird unmittelbar durch ihren Profilangriff und die rote Kampfauswertung beantwortet.', 4)
    ]),
    fixtureComment(2, [
      actorSegment(actors.eelKnight, 'shout', 'Draig-Hunde! Lasst die Waffen fallen, dann dürft ihr vielleicht beim Hof liegen bleiben!', { side: 'left' }),
      actorSegment(actors.draigKnight, 'speech', 'Ihr steht auf Draig-Boden. Legt ihr eure Waffen nieder, bekommt ihr Wasser und ein Gericht. Andernfalls bekommt ihr Stahl.', { side: 'right' }),
      actorSegment(actors.eelRaider, 'thought', 'Der Ritter redet wie einer, der noch Männer hinter sich wähnt. Gut. Redende Männer sehen die Hand am Gürtel nicht.', { side: 'left' })
    ]),
    fixtureComment(3, [
      actorSegment(actors.draigArcher, 'whisper', 'Der Schütze beim Brunnen. Ich nehme ihn.', { side: 'right' }),
      attack(actors.draigArcher, actors.eelArcher, {
        id: '01', weaponId: 'draig-schuetze-langbogen', weaponName: 'Draig-Langbogen', damageFormula: '1d8', damageNotation: '1W8 + 3', criticalDamageFormula: '2W8 + 3',
        text: 'Noch während der letzte Satz fällt, hebt der Draig-Schütze den Langbogen über den verkohlten Zaun und schickt einen Pfeil auf den Aal beim Brunnen.', natural: 14, modifier: 5, defense: 14, damage: 9, damageModifier: 3, damageDice: [6], damageType: 'Stich', hpBefore: 21, targetMaximum: 21, targetArmor: 'Dunkle Lederrüstung', rollMode: 'advantage', dice: [14, 8], side: 'right',
        narration: 'Der Pfeil findet durch den fliegenden Ruß hindurch sein Ziel und zwingt den Zitteraal-Schützen mit einem scharfen Ruck hinter den Brunnenrand.'
      })
    ]),
    fixtureComment(4, [
      attack(actors.eelKnight, actors.draigArmsman, {
        id: '02', weaponId: 'raubritter-morgenstern', weaponName: 'Schwarzer Morgenstern', damageFormula: '1d8', damageNotation: '1W8 + 4', criticalDamageFormula: '2W8 + 4',
        text: 'Der Raubritter stürmt durch den Ascheregen, täuscht gegen den Schild an und reißt den Morgenstern dann von unten gegen die offene Seite des Waffenknechts.', natural: 13, modifier: 7, defense: 16, damage: 10, damageModifier: 4, damageDice: [6], damageType: 'Wucht', hpBefore: 27, targetMaximum: 27, targetArmor: 'Draig-Kettenhemd und Rundschild', side: 'left',
        narration: 'Der Schild fängt die Finte, doch der schwere Kopf schlägt darunter ein und treibt den Waffenknecht zwei Schritte durch die warme Asche.'
      }),
      actorSegment(actors.draigArmsman, 'shout', 'Ich stehe noch! Haltet die Linie!', { side: 'right' })
    ]),
    fixtureComment(5, [
      attack(actors.eelRaider, actors.draigKnight, {
        id: '03', weaponId: 'pluenderer-handbeil', weaponName: 'Handbeil', damageFormula: '1d6', damageNotation: '1W6 + 2', criticalDamageFormula: '2W6 + 2',
        text: 'Der Plünderer schleicht am qualmenden Karren vorbei und schleudert das Handbeil auf die ungeschützte Kniekehle des Lehensritters.', natural: 1, modifier: 4, defense: 18, damage: 0, damageModifier: 2, damageType: 'Hieb', hpBefore: 63, targetMaximum: 63, targetArmor: 'Draig-Harnisch', rollMode: 'disadvantage', dice: [1, 9], side: 'left',
        narration: 'Das Beil streift eine verkohlte Deichsel, schlägt Funken und bleibt weit vor dem Draig-Ritter im Boden stecken.'
      }),
      actorSegment(actors.draigKnight, 'speech', 'Ein Dieb bleibt ein Dieb, selbst wenn er sich Krieger nennt.', { side: 'right' }),
      attack(actors.draigArmsman, actors.eelRaider, {
        id: '04', weaponId: 'draig-waffenknecht-speer', weaponName: 'Draig-Speer', damageFormula: '1d6', damageNotation: '1W6 + 2', criticalDamageFormula: '2W6 + 2',
        text: 'Der Waffenknecht fängt sich hinter dem Schild und stößt den Speer flach über dessen Rand nach dem vorgebeugten Plünderer.', natural: 15, modifier: 4, defense: 15, damage: 8, damageModifier: 2, damageDice: [6], damageType: 'Stich', hpBefore: 24, targetMaximum: 24, targetArmor: 'Zusammengeflickter Schuppenrock', side: 'right',
        narration: 'Die Speerspitze dringt zwischen zwei gestohlene Schuppen und zwingt den Plünderer, seine Flanke mit einem Fluch preiszugeben.'
      })
    ]),
    fixtureComment(6, [
      actorSegment(actors.eelArcher, 'shout', 'Deine Deckung brennt, Draig!', { side: 'left' }),
      attack(actors.eelArcher, actors.draigArcher, {
        id: '05', weaponId: 'schuetze-langbogen', weaponName: 'Geschwärzter Langbogen', damageFormula: '1d8', damageNotation: '1W8 + 3', criticalDamageFormula: '2W8 + 3',
        text: 'Der verwundete Aal-Schütze kommt am Brunnen hoch und jagt seinen Pfeil durch ein Loch im verkohlten Zaun.', natural: 12, modifier: 5, defense: 14, damage: 7, damageModifier: 3, damageDice: [4], damageType: 'Stich', hpBefore: 22, targetMaximum: 22, targetArmor: 'Verstärktes Lederzeug', side: 'left',
        narration: 'Der Pfeil schneidet durch den Zaun und trifft den Draig-Schützen an der Schulter, ehe dieser wieder hinter der Mauer verschwinden kann.'
      }),
      attack(actors.draigKnight, actors.eelKnight, {
        id: '06', weaponId: 'draig-lehensritter-langschwert', weaponName: 'Draig-Langschwert', damageFormula: '1d8', damageNotation: '1W8 + 4', criticalDamageFormula: '2W8 + 4',
        text: 'Der Lehensritter bindet die Kette des Morgensterns mit der Parierstange und führt das Langschwert in einer kurzen, geraden Linie gegen den schwarzen Harnisch.', natural: 16, modifier: 7, defense: 18, damage: 11, damageModifier: 4, damageDice: [7], damageType: 'Hieb', hpBefore: 67, targetMaximum: 67, targetArmor: 'Geschwärztes Plattenzeug', side: 'right',
        narration: 'Die Klinge gleitet an einer Platte ab, findet darunter jedoch eine Fuge und zwingt den Raubritter erstmals aus seinem breiten Stand.'
      })
    ]),
    fixtureComment(7, [
      narrator('Die Männer reden weiter, aber die Sätze werden kürzer. Rauch beißt in den Augen. Das Dach der Scheune gibt knarrend einen verkohlten Balken frei.'),
      actorSegment(actors.draigArcher, 'whisper', 'Noch einen. Dann ist der Brunnen still.', { side: 'right' }),
      actorSegment(actors.eelKnight, 'shout', 'Vorwärts! Brecht den Schild und holt mir den Ritter lebend!', { side: 'left' })
    ]),
    fixtureComment(8, [
      attack(actors.draigArcher, actors.eelArcher, {
        id: '07', weaponId: 'draig-schuetze-langbogen', weaponName: 'Draig-Langbogen', damageFormula: '1d8', damageNotation: '1W8 + 3', criticalDamageFormula: '2W8 + 3',
        text: 'Der Draig-Schütze nutzt den Ruf als Taktgeber, tritt seitlich aus der Deckung und setzt den zweiten Pfeil dicht neben den ersten.', natural: 17, modifier: 5, defense: 14, damage: 12, damageModifier: 3, damageDice: [8], damageType: 'Stich', hpBefore: 12, targetMaximum: 21, targetArmor: 'Dunkle Lederrüstung', side: 'right',
        narration: 'Der zweite Treffer nimmt dem Zitteraal-Schützen die Kraft; sein Bogen fällt klappernd an den Brunnen, während er selbst dahinter zusammensinkt.'
      }),
      attack(actors.eelKnight, actors.draigArmsman, {
        id: '08', weaponId: 'raubritter-morgenstern', weaponName: 'Schwarzer Morgenstern', damageFormula: '1d8', damageNotation: '1W8 + 4', criticalDamageFormula: '2W8 + 4',
        text: 'Mit einem zornigen Schritt dreht der Raubritter die Kette um den Rand des Rundschildes und schlägt erneut auf den Waffenknecht ein.', natural: 18, modifier: 7, defense: 16, damage: 17, damageModifier: 4, damageDice: [8], damageType: 'Wucht', hpBefore: 17, targetMaximum: 27, targetArmor: 'Draig-Kettenhemd und Rundschild', side: 'left',
        narration: 'Der Schild wird aus der Linie gerissen; der Morgenstern trifft Brust und Schulter, und der Waffenknecht fällt neben seinem Speer in die Asche.'
      })
    ]),
    fixtureComment(9, [
      actorSegment(actors.eelRaider, 'speech', 'Nun bist du allein hinter deiner Mauer, Bogenschütze.', { side: 'left' }),
      attack(actors.eelRaider, actors.draigArcher, {
        id: '09', weaponId: 'pluenderer-handbeil', weaponName: 'Handbeil', damageFormula: '1d6', damageNotation: '1W6 + 2', criticalDamageFormula: '2W6 + 2',
        text: 'Der Plünderer reißt das Beil aus dem Boden, überspringt den niedrigen Mauerrest und hackt nach der Bogenhand des Draig-Schützen.', natural: 16, modifier: 4, defense: 14, damage: 15, damageModifier: 2, damageDice: [6], damageType: 'Hieb', hpBefore: 15, targetMaximum: 22, targetArmor: 'Verstärktes Lederzeug', side: 'left',
        narration: 'Der Draig-Schütze kann den Bogen noch hochreißen, doch der Hieb bricht seine Abwehr und wirft ihn bewusstlos hinter die rauchende Mauer.'
      }),
      attack(actors.draigKnight, actors.eelRaider, {
        id: '10', weaponId: 'draig-lehensritter-langschwert', weaponName: 'Draig-Langschwert', damageFormula: '1d8', damageNotation: '1W8 + 4', criticalDamageFormula: '2W8 + 4',
        text: 'Der Lehensritter lässt den Raubritter für einen Herzschlag stehen, überwindet den Mauerrest und zieht das Langschwert quer durch die offene Flanke des Plünderers.', natural: 20, modifier: 7, defense: 15, damage: 16, damageModifier: 4, damageDice: [5, 7], damageType: 'Hieb', hpBefore: 16, targetMaximum: 24, targetArmor: 'Zusammengeflickter Schuppenrock', side: 'right',
        narration: 'Der kritische Hieb beendet den Überfall des Plünderers abrupt; er kippt über die Mauer und bleibt zwischen Beil und verstreuten Ziegeln liegen.'
      })
    ]),
    fixtureComment(10, [
      narrator('Vier Kämpfer liegen im Aschefeld. Nur die beiden schwer Gepanzerten stehen noch zwischen Hofbrunnen und Scheunenruine.'),
      actorSegment(actors.eelKnight, 'speech', 'Deine Leute sind gefallen. Du hast nichts gewonnen.', { side: 'left' }),
      actorSegment(actors.draigKnight, 'speech', 'Sie leben. Und du stehst noch auf ihrem Land.', { side: 'right' }),
      attack(actors.eelKnight, actors.draigKnight, {
        id: '11', weaponId: 'raubritter-morgenstern', weaponName: 'Schwarzer Morgenstern', damageFormula: '1d8', damageNotation: '1W8 + 4', criticalDamageFormula: '2W8 + 4',
        text: 'Der Raubritter antwortet mit einem tiefen Schwinger, der das Langschwert binden und den Draig-Ritter von den Füßen holen soll.', natural: 15, modifier: 7, defense: 18, damage: 12, damageModifier: 4, damageDice: [8], damageType: 'Wucht', hpBefore: 63, targetMaximum: 63, targetArmor: 'Draig-Harnisch', side: 'left', narration: 'Der Morgenstern kracht gegen den verstärkten Wehrschutz und zwingt den Lehensritter dennoch hart gegen den Brunnenrand.'
      }),
      attack(actors.draigKnight, actors.eelKnight, {
        id: '12', weaponId: 'draig-lehensritter-langschwert', weaponName: 'Draig-Langschwert', damageFormula: '1d8', damageNotation: '1W8 + 4', criticalDamageFormula: '2W8 + 4',
        text: 'Der Draig-Ritter nutzt den Rückprall der Kette, tritt innen in den Schwung und setzt einen beidhändigen Hieb gegen die Schulterplatte.', natural: 14, modifier: 7, defense: 18, damage: 14, damageModifier: 4, damageDice: [8], damageType: 'Hieb', hpBefore: 56, targetMaximum: 67, targetArmor: 'Geschwärztes Plattenzeug', side: 'right', narration: 'Die schwarze Schulterplatte hält nicht ganz; Metall knirscht, und der Raubritter sinkt für einen Atemzug auf ein Knie.'
      }),
      attack(actors.eelKnight, actors.draigKnight, {
        id: '13', weaponId: 'raubritter-morgenstern', weaponName: 'Schwarzer Morgenstern', damageFormula: '1d8', damageNotation: '1W8 + 4', criticalDamageFormula: '2W8 + 4',
        text: 'Aus dem Knie steigt der Raubritter in einen kurzen, brutalen Gegenschlag gegen Rippen und Schwertarm.', natural: 17, modifier: 7, defense: 18, damage: 13, damageModifier: 4, damageDice: [8], damageType: 'Wucht', hpBefore: 51, targetMaximum: 63, targetArmor: 'Draig-Harnisch', side: 'left', narration: 'Der kurze Weg macht den Schlag kaum schwächer; der Lehensritter verliert den Atem und muss das Langschwert einen Augenblick sinken lassen.'
      }),
      attack(actors.draigKnight, actors.eelKnight, {
        id: '14', weaponId: 'draig-lehensritter-langschwert', weaponName: 'Draig-Langschwert', damageFormula: '1d8', damageNotation: '1W8 + 4', criticalDamageFormula: '2W8 + 4',
        text: 'Statt zurückzuweichen, fasst der Draig das Heft neu und stößt durch die Lücke unter dem gehobenen Morgenstern.', natural: 20, modifier: 7, defense: 18, damage: 22, damageModifier: 4, damageDice: [8, 8], damageType: 'Hieb', hpBefore: 42, targetMaximum: 67, targetArmor: 'Geschwärztes Plattenzeug', side: 'right', narration: 'Der kritische Stoß findet die beschädigte Fuge und lässt dem Raubritter nur noch die Kraft für einen letzten, taumelnden Versuch.'
      }),
      attack(actors.eelKnight, actors.draigKnight, {
        id: '15', weaponId: 'raubritter-morgenstern', weaponName: 'Schwarzer Morgenstern', damageFormula: '1d8', damageNotation: '1W8 + 4', criticalDamageFormula: '2W8 + 4',
        text: 'Der Raubritter schleudert den Morgenstern ein letztes Mal über die Schulter, mehr Trotz als Technik.', natural: 6, modifier: 7, defense: 18, damage: 0, damageModifier: 4, damageType: 'Wucht', hpBefore: 38, targetMaximum: 63, targetArmor: 'Draig-Harnisch', side: 'left', narration: 'Die Kette singt durch den Rauch, aber der Lehensritter duckt sich darunter weg und lässt den schweren Kopf in den Brunnenstein schlagen.'
      }),
      attack(actors.draigKnight, actors.eelKnight, {
        id: '16', weaponId: 'draig-lehensritter-langschwert', weaponName: 'Draig-Langschwert', damageFormula: '1d8', damageNotation: '1W8 + 4', criticalDamageFormula: '2W8 + 4',
        text: 'Der Draig-Ritter tritt auf die gespannte Kette, dreht den Griff und schlägt mit der flachen Stärke des Langschwerts gegen Helm und Schläfe.', natural: 13, modifier: 7, defense: 18, damage: 20, damageModifier: 4, damageDice: [8], damageType: 'Wucht', hpBefore: 20, targetMaximum: 67, targetArmor: 'Geschwärztes Plattenzeug', side: 'right', narration: 'Der kontrollierte Schluss trifft hart genug: Der Raubritter verliert den Morgenstern und fällt neben seinen eigenen Schild, besiegt, aber noch am Leben.'
      })
    ]),
    fixtureComment(11, [
      narrator('Stille kehrt nicht zurück; das Holz knackt weiter, und irgendwo fällt ein letzter Dachziegel. Doch das Scharmützel ist entschieden. Der Draig-Lehensritter bleibt mit 38 Trefferpunkten stehen. Seine beiden Gefolgsleute und alle drei Schwarzen Zitteraale sind ausgeschaltet, keiner wurde durch die Auswertung ungeprüft aus der Szene geschrieben.'),
      actorSegment(actors.draigKnight, 'shout', 'Wer mich hört: Waffen weg! Wir bergen zuerst die Lebenden — auch die ihren.', { side: 'right' }),
      actorSegment(actors.draigKnight, 'thought', 'Drei gegen drei. Gewonnen, und doch wird der Hof noch lange nach Rauch riechen.', { side: 'right' })
    ])
  ];

  global.AleriaCombatTestScene = Object.freeze({
    threadId: TEST_THREAD_ID,
    actors: clone(actors),
    getComments(threadId) {
      return String(threadId || '') === TEST_THREAD_ID ? clone(comments) : [];
    }
  });
})(window);
