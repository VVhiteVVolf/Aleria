// Generated from public quest, family and map sources. Rebuild: node scripts/build-troetzli-quest.mjs
export const AUTHORED_QUEST_PREPARATIONS = {
  "gwynthor-der-staedter-und-sein-pferd": {
    "dossier": {
      "tagline": "Ein kurzer Weg. Ein großer Dickkopf. Und ein Platz, an dem Ruhe einkehren darf.",
      "preparation": "Hinterlasst bei Celtigerns Echo eine Nachricht für Cynddelw. Er wird Euch Trötzli zeigen und offen von seinen bisherigen Versuchen erzählen. Nehmt Euch Zeit für den Hengst, prüft Halfter und Führstrick und lasst ihm an Brücke und Wegesrand genügend Raum. Niemand muss ihn zureiten. Eirlys bleibt bei ihrer Familie, während Ihr Euch auf den Weg macht. Auf dem Penrudd-Hof erwartet Tudur Euch bereits – mit Platz, Ruhe und dem Wissen, dass dieses Pferd Geduld braucht.",
      "invitation": "„Nun muss ich ihn nur noch dorthin bekommen. Das Wort ›nur‹ schreibe ich mit einiger Beschämung. Ich bitte um erfahrene, ruhige Hilfe. Ich möchte, dass Mensch und Tier dort heil ankommen.“",
      "coverImage": "/AleriaAlmanach/assets/gwynthor-troetzli/troetzli-road-v1.png",
      "cardImage": "/AleriaAlmanach/assets/gwynthor-troetzli/chibi/troetzli-v1.png",
      "rewardPromise": "Wenn Trötzli heil bei Tudur ankommt, hält Cynddelw sein Versprechen.",
      "participants": [
        {
          "name": "Cynddelw Llythfor",
          "role": "Auftraggeber · Besitzer",
          "description": "Berichterstatter bei Celtigerns Echo. Organisiert Abholung und Belohnung.",
          "kind": "character",
          "recordId": "person--haus-llythfor--cynddelw-llythfor",
          "image": "/AleriaAlmanach/assets/gwynthor-troetzli/portraits/cynddelw-llythfor.png",
          "profile": ""
        },
        {
          "name": "Trötzli",
          "role": "Schützling · Rhyfel-Hengst",
          "description": "Erwachsen, schreckhaft und derzeit nicht sicher reitbar. Alte Narben sind verheilt; ihre Geschichte ist unbekannt.",
          "kind": "creature",
          "recordId": "companion-cynddelw-troetzli",
          "image": "/AleriaAlmanach/assets/gwynthor-troetzli/portraits/troetzli.png",
          "profile": ""
        },
        {
          "name": "Tudur Penrudd",
          "role": "Empfänger · Penrudd-Hof",
          "description": "Cynddelws Schwiegervater. Weiß von den Schwierigkeiten und nimmt Trötzli zur Unterbringung auf.",
          "kind": "character",
          "recordId": "person--haus-penrudd--tudur-penrudd",
          "image": "/AleriaAlmanach/assets/rotes-tor/portraits/tudur.png",
          "profile": ""
        },
        {
          "name": "Esyllt Penrudd",
          "role": "Familie · Verbindung zum Hof",
          "description": "Tudurs Tochter, Cynddelws Frau. Die Aufnahme ist mit ihrer Familie abgesprochen.",
          "kind": "character",
          "recordId": "person--haus-penrudd--esyllt-penrudd",
          "image": "/AleriaAlmanach/assets/gwynthor-troetzli/portraits/esyllt-penrudd.png",
          "profile": ""
        },
        {
          "name": "Eirlys Llythfor",
          "role": "Familie · Namensgeberin",
          "description": "Zehn Jahre alt, mit Malstift, Zahnlückengrinsen und einer großen Zuneigung zu Trötzli. Von ihr stammen sein Name und die Zeichnung am Aushang.",
          "kind": "character",
          "recordId": "person--haus-llythfor--eirlys-llythfor",
          "image": "/AleriaAlmanach/assets/gwynthor-troetzli/portraits/eirlys-llythfor.png",
          "profile": ""
        }
      ],
      "route": {
        "mapId": "cenyr-celtigerns-wacht-llamrais-ankunft-gwynthor-bannkreis",
        "image": "/Karten/Cenyr/celtigerns-wacht/llamrais-ankunft/gwynthor-bannkreis/Kartenbilder/display/gwynthor-normal-2048-q90.webp",
        "width": 8192,
        "height": 6300,
        "widthKm": 30,
        "note": "Die Karte zeigt dreißig Kilometer von einem Rand zum anderen. Die eingetragenen Straßen führen vom Nordtor über den nördlichen Landweg zum Hof. Für ein ruhig geführtes Pferd sind 3,5 Kilometer in der Stunde ein günstiges Tempo. Cynddelws Abholung, die Vorbereitung und der Weg durch Gwynthor brauchen zusätzlich etwa eine halbe Stunde. Wenn Trötzli scheut, können weitere dreißig bis sechzig Minuten vergehen. Ein Eilritt kommt mit ihm nicht in Frage. Die Entfernungen folgen dem sichtbaren Straßenverlauf und bleiben Näherungen.",
        "approachMinutes": 30,
        "paths": [
          {
            "id": "troetzli-nordweg",
            "title": "Direkter Nordweg",
            "description": "Kürzester vorbereiteter Straßenweg zum Penrudd-Hof.",
            "travelMode": "foot_e",
            "points": [
              {
                "x": 0.484,
                "y": 0.426,
                "name": "Nordtor / nördliche Brücke",
                "pinId": "",
                "event": {
                  "type": "custom",
                  "name": "Ruhiger Aufbruch und Brückenpassage",
                  "custH": 0.16666666666666666,
                  "custSp": 1
                }
              },
              {
                "x": 0.48,
                "y": 0.399,
                "name": "",
                "pinId": ""
              },
              {
                "x": 0.4755859375,
                "y": 0.382,
                "name": "Gasthof - Zum Roten Tor",
                "pinId": "gwynthor-marking-080",
                "event": {
                  "type": "custom",
                  "name": "Tränken und Lage prüfen am Roten Tor",
                  "custH": 0.16666666666666666,
                  "custSp": 1
                }
              },
              {
                "x": 0.478,
                "y": 0.355,
                "name": "",
                "pinId": ""
              },
              {
                "x": 0.4814453125,
                "y": 0.3314660670534092,
                "name": "Die Afelwyn-Obstplantage",
                "pinId": "gwynthor-marking-071"
              },
              {
                "x": 0.475,
                "y": 0.302,
                "name": "",
                "pinId": ""
              },
              {
                "x": 0.4716796875,
                "y": 0.25283809523809525,
                "name": "Der Gwerfil-Hof",
                "pinId": "gwynthor-marking-058",
                "event": {
                  "type": "custom",
                  "name": "Ruhepause am Weg beim Gwerfil-Hof",
                  "custH": 0.16666666666666666,
                  "custSp": 1
                }
              },
              {
                "x": 0.485,
                "y": 0.238,
                "name": "",
                "pinId": ""
              },
              {
                "x": 0.511,
                "y": 0.218,
                "name": "",
                "pinId": ""
              },
              {
                "x": 0.525,
                "y": 0.205,
                "name": "",
                "pinId": ""
              },
              {
                "x": 0.526123046875,
                "y": 0.18236190476190478,
                "name": "Penrudd-Hof",
                "pinId": "gwynthor-marking-041",
                "event": {
                  "type": "custom",
                  "name": "Ruhige Übergabe an Tudur",
                  "custH": 0.25,
                  "custSp": 1
                }
              }
            ],
            "estimate": {
              "totalKm": 6.5454784966306985,
              "travelH": 1.8701367133230566,
              "delayH": 0.75,
              "totalH": 2.6201367133230566
            }
          },
          {
            "id": "troetzli-owain",
            "title": "Über Owains Pferdehof",
            "description": "Ausweichplan mit zusätzlichem Halt für pferdekundige Hilfe; Verfügbarkeit vor Ort erfragen.",
            "travelMode": "foot_e",
            "points": [
              {
                "x": 0.484,
                "y": 0.426,
                "name": "Nordtor / nördliche Brücke",
                "pinId": "",
                "event": {
                  "type": "custom",
                  "name": "Ruhiger Aufbruch und Brückenpassage",
                  "custH": 0.16666666666666666,
                  "custSp": 1
                }
              },
              {
                "x": 0.48,
                "y": 0.399,
                "name": "",
                "pinId": ""
              },
              {
                "x": 0.4755859375,
                "y": 0.382,
                "name": "Gasthof - Zum Roten Tor",
                "pinId": "gwynthor-marking-080",
                "event": {
                  "type": "custom",
                  "name": "Tränken und Lage prüfen am Roten Tor",
                  "custH": 0.16666666666666666,
                  "custSp": 1
                }
              },
              {
                "x": 0.478,
                "y": 0.355,
                "name": "",
                "pinId": ""
              },
              {
                "x": 0.4814453125,
                "y": 0.3314660670534092,
                "name": "Die Afelwyn-Obstplantage",
                "pinId": "gwynthor-marking-071"
              },
              {
                "x": 0.475,
                "y": 0.302,
                "name": "",
                "pinId": ""
              },
              {
                "x": 0.4716796875,
                "y": 0.25283809523809525,
                "name": "Der Gwerfil-Hof",
                "pinId": "gwynthor-marking-058",
                "event": {
                  "type": "custom",
                  "name": "Ruhepause am Weg beim Gwerfil-Hof",
                  "custH": 0.16666666666666666,
                  "custSp": 1
                }
              },
              {
                "x": 0.471,
                "y": 0.229,
                "name": "",
                "pinId": ""
              },
              {
                "x": 0.468017578125,
                "y": 0.1986857142857143,
                "name": "Owains Pferdehof",
                "pinId": "gwynthor-marking-048",
                "event": {
                  "type": "custom",
                  "name": "Zusätzliche Beratung bei Owains Pferdehof",
                  "custH": 0.25,
                  "custSp": 1
                }
              },
              {
                "x": 0.505,
                "y": 0.208,
                "name": "",
                "pinId": ""
              },
              {
                "x": 0.526123046875,
                "y": 0.18236190476190478,
                "name": "Penrudd-Hof",
                "pinId": "gwynthor-marking-041",
                "event": {
                  "type": "custom",
                  "name": "Ruhige Übergabe an Tudur",
                  "custH": 0.25,
                  "custSp": 1
                }
              }
            ],
            "estimate": {
              "totalKm": 7.325940804320519,
              "travelH": 2.0931259440915766,
              "delayH": 1,
              "totalH": 3.0931259440915766
            }
          }
        ]
      },
      "pois": [
        {
          "name": "Gasthof - Zum Roten Tor",
          "description": "Verpflegung, Tränken und Kontakt zur Familie Penrudd; auf dem Weg.",
          "mapId": "cenyr-celtigerns-wacht-llamrais-ankunft-gwynthor-bannkreis",
          "pinId": "gwynthor-marking-080",
          "detourKm": null
        },
        {
          "name": "Die Afelwyn-Obstplantage",
          "description": "Obstplantage und Imkerei der Afelwyn. Vom Weg aus besuchbar; Privatgelände nur nach Absprache.",
          "mapId": "cenyr-celtigerns-wacht-llamrais-ankunft-gwynthor-bannkreis",
          "pinId": "gwynthor-marking-071",
          "detourKm": null
        },
        {
          "name": "Der Gwerfil-Hof",
          "description": "Weizen, Tierfutter und Viehhaltung der Gwerfil. Ruhiger kurzer Zwischenhalt nach Absprache.",
          "mapId": "cenyr-celtigerns-wacht-llamrais-ankunft-gwynthor-bannkreis",
          "pinId": "gwynthor-marking-058",
          "detourKm": null
        },
        {
          "name": "Owains Pferdehof",
          "description": "Pferdekundige Hilfe nahe dem Ziel; eigener Ausweichplan mit zusätzlichem Zeitbedarf.",
          "mapId": "cenyr-celtigerns-wacht-llamrais-ankunft-gwynthor-bannkreis",
          "pinId": "gwynthor-marking-048",
          "detourKm": null
        }
      ],
      "encounters": [
        {
          "title": "Ein Schatten hinter den Hecken",
          "description": "Wo der Weg unübersichtlich wird, könnten Wegelagerer auf unachtsame Reisende hoffen. Haltet die Augen offen und bringt Trötzli zuerst aus dem Gedränge. Manchmal genügt ein entschlossenes Wort; manchmal ist der klügere Weg ein kleiner Bogen. Ob dort jemand wartet, wird erst die Reise zeigen.",
          "location": "Zwischen Obstplantage und Gwerfil-Hof",
          "profile": ""
        },
        {
          "title": "Wölfe am Waldrand",
          "description": "Ein ferner Ruf, Pfotenabdrücke im weichen Boden oder ein graues Fell zwischen den Bäumen könnten den Hengst unruhig machen. Besonders in der Dämmerung lohnt es sich, beisammenzubleiben. Spuren bedeuten noch keinen Angriff – und nicht jeder Schatten folgt Euch.",
          "location": "Die Waldsäume des nördlichen Weges",
          "profile": "/Bestiarium/"
        }
      ],
      "rewardArt": [
        {
          "title": "Ein Kupfertaler",
          "image": "/AleriaAlmanach/assets/gwynthor-troetzli/items/copper-coin-v1.png",
          "kind": "money",
          "currency": "copper"
        },
        {
          "title": "Schickes Notizbuch",
          "image": "/AleriaAlmanach/assets/gwynthor-troetzli/items/schickes-notizbuch-v1.png",
          "kind": "item"
        },
        {
          "title": "Schreibutensilien",
          "image": "/AleriaAlmanach/assets/gwynthor-troetzli/items/schreibutensilien-v1.png",
          "kind": "item"
        }
      ]
    },
    "summary": "Cynddelw Llythfor braucht erfahrene Hilfe: Sein schreckhafter Rhyfel-Hengst Trötzli muss von Gwynthor zum Penrudd-Hof nördlich der Stadt geführt werden. Tudur Penrudd ist unterrichtet und nimmt ihn auf. Gesucht ist eine sichere Überführung, keine Zähmung oder Probe zum Zureiten. Für die sichere Übergabe winken 50 Kupferstücke, ein schickes unbeschriebenes Notizbuch und Schreibutensilien.",
    "objectives": [
      {
        "id": "meet-cynddelw",
        "title": "Bei Celtigerns Echo melden und die Überführung vorbereiten"
      },
      {
        "id": "lead-troetzli",
        "title": "Trötzli ruhig und sicher über den nördlichen Weg führen"
      },
      {
        "id": "handover-tudur",
        "title": "Trötzli heil an Tudur auf dem Penrudd-Hof übergeben"
      },
      {
        "id": "report-cynddelw",
        "title": "Cynddelw die Übergabe bestätigen und die Belohnung abholen"
      }
    ],
    "modules": [
      "zum-roten-tor"
    ]
  }
};
