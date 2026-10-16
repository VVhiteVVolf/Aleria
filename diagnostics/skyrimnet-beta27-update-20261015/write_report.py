"""Record installed versions, preserved settings and the actual validation limits."""
from pathlib import Path
import json

ROOT=Path(__file__).parent
installed=json.loads((ROOT/'installation.json').read_text())
validation=json.loads((ROOT/'installed-validation.json').read_text())
attachments=json.loads((ROOT/'installed-quest-attachments.json').read_text())
lines=['SKYRIMNET BETA 27 – INSTALLATION VOM 15.10.2026','',
       'Status: vollständig installiert und anhand der tatsächlich wirksamen Dateien geprüft.',
       'Noch kein Spielstand nach dem Update geladen; kein Ingame-Funktions- oder CTD-Test behauptet.',
       'Profil: '+installed['profile']+' (historischer Name; der aktive Kern ist Beta 27).','',
       'AKTUALISIERT']
for version in installed['versions']:lines.append(version['old']+' -> '+version['new'])
lines += ['Magelight UI wurde mit SeverActions von 0.31.2 auf die stabile 1.0.0 aktualisiert.',
          'Standpoint wurde mit der Bathing-Integration von 0.7.0 auf 1.0.0 aktualisiert.',
          'PrismaUI 1.5.1, OStim Navigator 2.2.1 und Courier Descriptions 1.2.0 waren bereits aktuell.',
          'Die installierten offiziellen Bio-Pakete stehen weiterhin auf der veröffentlichten Version 1.0.0.',
          'Die lokale Inworld-Anpassung, die Hebel-Aktion und die Kompatibilitätsschicht sind eigene Inhalte ohne öffentlichen Updater.','',
          'ERHALTEN UND GEZIELT ANGEPASST',
          '- Dialoge: ausschließlich google/gemma-4-26b-a4b-it.',
          '- Aktionsauswahl: google/gemma-4-31b-it.',
          '- OpenRouter.yaml, Providers.yaml und sonstige Benutzerkonfigurationen blieben unverändert.',
          '- Persönliche Prompts, Inworld-Audiotags, Stimmen/Voice Samples und Erinnerungsdaten blieben erhalten.',
          '- Der vorhandene native Wheel-Schutz bleibt der wirksame Script-Provider. Der offizielle Wheel-SOURCE ist gegenüber Beta26 unverändert; der lokale Fix bleibt daher erforderlich/kompatibel.',
          '- Der heute freigegebene technische ACTION:-Footer bleibt erhalten. Die neue SeverActions-Regel für spontane Trinkgelder, Belohnungen und Rechnungen wurde ergänzend übernommen.',
          '- 50 unveränderte frühere Standard-NPC-Bios wurden auf die neuen offiziellen Texte angehoben. Vorheriger Inhalt entsprach nachweislich dem alten Standard; persönliche Änderungen waren nicht darunter.',
          '- Die umbenannte Bathing-Plugin-ID wurde in der Inhaltsregistrierung unter Beibehaltung ihrer Aktivierung und Priorität migriert.',
          '- Die generierten/angepassten OStimNet-Animationsmetadaten wurden bytegenau übernommen; die vom Autor mitgelieferte Grundlage ist in diesem Update unverändert.',
          '- Die alte, zusätzlich aktivierte Navigator-2.2.0-Kopie wurde im aktuellen Profil deaktiviert. 2.2.1 bleibt aktiv.',
          '- Alte Paketordner bleiben als Rückfallebene erhalten; neue Versionen wurden in vollständige separate Ordner installiert, nicht über alte Dateien gemischt.',
          '- Es wurden keine neuen FOMOD-Optionen hinzugewählt. Insbesondere bleibt die Bathing-Integration Core-only ohne Wash-Me-Zusatz.',
          '- Neue optionale Einstellungen wie ein anderes Embedding-Modell, experimentelle BFA-Integration oder ein Cache-Plugin wurden nicht als zusätzliche Modinstallation erzwungen. Bisherige gespeicherte Einstellungen bleiben erhalten.','',
          'PRÜFUNGEN',
          '- Der lokale Beta27-Download und alle sechs Erweiterungsarchive stimmen mit den offiziellen SHA-256-Werten überein.',
          f"- {validation['core_release_files_checked']} Kern-Release-Dateien geprüft; alle entsprechen dem offiziellen Archiv.",
          f"- {validation['action_bindings_verified']} Papyrus-Aktionsfunktionen in den wirksamen PEX-Dateien gefunden.",
          '- 28 benötigte Scripts an sechs passenden Quests tatsächlich im Plugin-VMAD angehängt; keine fehlenden Quest-/Script-Anbindungen.',
          '- Keine fehlenden aktiven Master, YAML-Lesefehler, fehlenden Manifest-Abhängigkeiten oder doppelten KI-DLL-Pakete gefunden.',
          '- Die tatsächlich gewinnende PrismaUI.dll entspricht dem offiziellen 1.5.1-Archiv.',
          '- 16 strikte Template-Kontrollen und 108 Aktionsprompt-Rendervarianten bestanden.',
          f"- {installed['protected_files_unchanged']} geschützte bestehende Dateien nach Installation erneut verglichen und unverändert.",
          '- Pluginzahl weiterhin 252 normal + 3785 light; zwei normale Slots frei. plugins.txt und loadorder.txt unverändert.','',
          'EINORDNUNG DES OFFIZIELLEN CONTENT-VALIDATORS',
          '- Aktualisierte Erweiterungen und lokale technische Overrides sind strukturell prüfbar; nicht aufgelöste Platzhalter/Decorator-Werte benötigen echte Spieldaten.',
          '- Der Hub-Submission-Validator beanstandet die reservierte offizielle ID skyrimnet.base. Das ist bei einer Prüfung des unveränderten offiziellen Basispakets kein Installationsfehler.',
          '- Ein zu langer physischer Prüfpfad führte zunächst zu einem Dateilesefehler bei Bathing. Dieselben bytegeprüften Dateien bestanden die Prüfung unter einem kurzen Prüfpfad ohne Fehler/Warnungen.',
          '- OStimNet meldet zehn unbekannte tton_event-Trigger als Warnungen. Dieses Ereignis kommt aus OStimNets eigenem nativen Plugin; der Validator kennt Erweiterungsereignisse nicht. Kein Grund, diese Trigger zu entfernen.',
          '- Der echte Spielstart, Save-Migration und die Ausführung von Übergaben, Entlassungen und Questdialogen bleiben im Spiel zu prüfen.','',
          'HINWEISE ZU VERSIONSANZEIGEN',
          '- IntelEngine-Paket 3.5.2 meldet laut Autor in seiner nativen DLL weiterhin 3.5.1. Das vollständige 3.5.2-Paket wurde trotzdem anhand der offiziellen Prüfsumme installiert.',
          '- Einige offizielle Content-Manifests zeigen eigene Inhaltsversionen statt der DLL-/Archivversion; sie wurden nicht eigenmächtig umnummeriert.','',
          'SICHERUNG UND RÜCKNAHME',
          'backup/personal-state-before.zip enthält den konsistenten lokalen KI-Zustand vor dem Update, einschließlich Datenbanken, Modellen, Stimmen und Konfigurationen. Logs und Screenshots wurden nicht mitarchiviert.',
          'backup/changed-files enthält die 52 geänderten bestehenden Dateien. backup/profiles enthält die ursprünglichen Profil-Kontrolldateien.',
          'Rücknahme bei geschlossenem Skyrim/MO2: die gesicherte modlist.txt des aktuellen Profils und die geänderten Dateien aus backup/changed-files wiederherstellen. Die alten Paketordner sind unverändert vorhanden. Zwischenzeitliche Änderungen vorher abgleichen.',
          'migration-skyrimnet-beta27-current.zip ist ein vollständiges KI-Zusatzpaket zum vorhandenen Nolvus-Backup. Es ersetzt nicht die Gesamtsicherung und enthält keine neuen Skyrim-Spielstanddateien.',
          'Das Migrationsarchiv enthält die aktualisierten und benötigten unveränderten KI-Mods, persönlichen Zustand, Stimmen/Modelle und den aktuellen Profilstand zur späteren Abstimmung mit einer neuen Nolvus-Basis.',
          'Die alte vollständige Ladereihenfolge nicht blind über eine neue Nolvus-Version schreiben. Die Mod-Ersetzungsliste und Einzeldatei-Prüfsummen stehen im Archivmanifest.','',
          'QUELLEN']
lines.extend(v['release_url'] for v in installed['versions'])
lines += ['https://fateless.ai/plugins','https://github.com/PrismaUI-SKSE/framework/releases/tag/1.5.1','https://github.com/tetherball88/OStimNavigator/releases/tag/v2.2.1']
(ROOT/'ERGEBNIS.txt').write_text('\n'.join(lines)+'\n',encoding='utf-8')
print('Installation report written')
