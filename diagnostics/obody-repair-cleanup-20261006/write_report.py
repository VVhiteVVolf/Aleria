"""Validate the completed current-profile cleanup and write its human-readable receipt."""
from pathlib import Path
import csv
import hashlib
import json
import shutil

OUT = Path(__file__).parent

def sha(path):
    with Path(path).open('rb') as stream:
        return hashlib.file_digest(stream, 'sha256').hexdigest()

def main():
    plan = json.loads((OUT/'strict-cleanup-plan.json').read_text(encoding='utf-8'))
    result = json.loads((OUT/'strict-cleanup-result.json').read_text(encoding='utf-8-sig'))
    repair = json.loads((OUT/'repair-validation.json').read_text(encoding='utf-8'))
    deployed = json.loads((OUT/'deployment.json').read_text(encoding='utf-8'))
    stage = json.loads((OUT/'repair-stage.json').read_text(encoding='utf-8'))
    assert result['completed'] and repair['verified']
    modlist = Path(plan['modlist'])
    root = Path(plan['instance'])/'MODS/mods'
    active = [line[1:] for line in modlist.read_text(encoding='utf-8-sig').splitlines() if line.startswith('+')]
    before = [line[1:] for line in (OUT/'modlist-before-strict-cleanup.txt').read_text(encoding='utf-8-sig').splitlines() if line.startswith('+')]
    assert active == before, 'Cleanup changed enabled mod order'
    inactive = [directory.name for directory in root.iterdir() if directory.is_dir() and not directory.name.endswith('_separator') and directory.name not in active]
    missing = [name for name in active if not name.endswith('_separator') and not (root/name).is_dir()]
    assert not missing, 'Missing active mod directories: '+str(missing)
    assert not inactive, 'Inactive directories remain: '+str(inactive)
    assert all(not Path(item['path']).exists() for item in result['removed'])
    for name in ['plugins.txt','loadorder.txt']:
        path = modlist.parent/name
        assert sha(path) == deployed['before_hashes'][str(path)]
    free = shutil.disk_usage(root).free
    backup = Path(plan['backup_root'])
    complete = json.loads((backup/'COMPLETE.json').read_text(encoding='utf-8'))
    pointer = json.loads((backup.parent.parent/'LATEST_BACKUP.json').read_text(encoding='utf-8'))
    assert complete['status'] == 'VERIFIED' and pointer['supplement'] == backup.relative_to(backup.parent.parent).as_posix()
    validation = {'verified':True,'removed_mods':len(result['removed']),'removed_GiB':round(result['removed_bytes']/2**30,2),'remaining_inactive_mod_directories':inactive,'missing_active_mod_directories':missing,'active_order_unchanged_by_cleanup':True,'plugin_order_unchanged':True,'free_E_GiB':round(free/2**30,2),'current_migration_backup_verified':True,'ingame_test_performed':False}
    (OUT/'cleanup-validation.json').write_text(json.dumps(validation,ensure_ascii=False,indent=2),encoding='utf-8')
    with (OUT/'geloeschte_mods.tsv').open('w',encoding='utf-8-sig',newline='') as stream:
        writer = csv.writer(stream,delimiter='\t')
        writer.writerow(['Mod','GiB','Bytes','Sicherung'])
        for item in sorted(result['removed'],key=lambda item:item['bytes'],reverse=True):
            writer.writerow([item['mod'],round(item['bytes']/2**30,3),item['bytes'],result['backup_archive']])
    lines = [
        '# BodySlide-/OBody-Reparatur und strikte Bereinigung – 6. Oktober 2026',
        '',
        f'Aktuelles Profil: **{plan["profile"]}**. Nur dieses Profil wurde für die Beibehaltung von Mods berücksichtigt.',
        '',
        '## Erledigte Reparaturen',
        '',
        f'- **{repair["generated_projects"]} gezielte BodySlide-Projekte** mit expliziten Nullwerten für sichtbare Körperform-Slider und aktivierter TRI-Ausgabe gebaut. Autoren-Konvertierungsslider und absichtliche Zaps bleiben erhalten.',
        f'- **{repair["projects_with_usable_morphs"]} Projekte mit nutzbaren Morphs**; die NIF-Formnamen und BODYTRI-Verweise wurden mit den erzeugten TRI-Formtabellen abgeglichen.',
        '- **30 weitere Meshes mit widersprüchlichen BODYTRI-Verweisen korrigiert**. Alle binären Datenblöcke einschließlich Geometrie sind bytegenau identisch mit den Originalen; nur die betreffenden Stringwerte wurden geändert.',
        '- Fehlerhaftes XML der HIMBO-Dark-Brotherhood-Gruppe durch ein gültiges Override repariert.',
        '- BodySlide-Verknüpfungen auf die aktuell im Profil geladenen Quellen umgestellt. Keine alten isolierten BuildCatalog-Snapshots mehr als Quelle dieser Verknüpfungen.',
        '- Neues aktives Ausgabe-Mod **Local - OBody Outfit Repairs 20261006** gewinnt die betreffenden Dateikonflikte. Bestehende Körperausgaben bleiben unverändert.',
        '',
        'Gebaut wurden:',
        '',
    ]
    lines.extend('- '+project['name'] for project in stage['generated_projects'])
    lines += [
        '',
        'Vier Quelldatensätze liefern keine nutzbaren Körpermorphs und bleiben feste Zubehörformen:',
        '',
    ]
    lines.extend('- '+name for name in repair['fixed_accessory_exceptions'])
    lines += [
        '',
        '## Bereinigung',
        '',
        f'**{len(result["removed"])} weitere deaktivierte Mod-Ordner tatsächlich gelöscht: {result["removed_bytes"]/2**30:.2f} GiB.** Frei auf E: beim Abschluss: **{free/2**30:.2f} GiB**.',
        '',
        'Es bleiben keine installierten, deaktivierten Nicht-Separator-Mod-Ordner übrig. Nutzung durch andere Profile war ausdrücklich kein Beibehaltungsgrund. Die gelöschten Minus-Einträge wurden aus dem aktuellen Modlist entfernt. Aktive Modreihenfolge und plugins.txt/loadorder.txt sind unverändert; alle aktivierten Mod-Ordner sind vorhanden.',
        '',
        '[Vollständige Liste der gelöschten Mods](geloeschte_mods.tsv). Andere Profile können durch diese ausdrücklich gewünschte Bereinigung nun fehlende Mods anzeigen. Ihre Dateien wurden nicht gelöscht.',
        '',
        '## Sicherungen und Wiederherstellung',
        '',
        f'Backup-Ordner: `{backup}`.',
        '',
        '- `inactive-mods-current-profile.tar.zst`: alle 64.777 Dateien der heute gelöschten Mods. Jede Datei unabhängig entpackt und SHA-256-geprüft, anschließend sämtliche aktuellen Quelldateien vor der Löschung erneut gegen das Manifest geprüft.',
        '- `profile-tool-settings-before-repair.zip`: Profil-/Toolkonfiguration vor der Reparatur.',
        '- `delta.zip` / `COMPLETE.json`: aktueller kumulativer Migrationsstand einschließlich Reparatur-Mod, aktuellem Profil und dessen Spielständen. Der vorherige Beta26-/Prisma-Zusatzstand ist übernommen; sämtliche aktiven Modbäume wurden auf Änderungen seit Basisbackup plus vorherigem Zusatzstand anhand Größe/Zeitstempel geprüft. Alle aufgenommenen Dateien unabhängig entpackt und SHA-256-geprüft.',
        '- `LATEST_BACKUP.json` im Backup-Hauptordner zeigt auf diesen neuen geprüften Stand. Gelöschte Mods und andere Profile werden beim normalen Restore nicht wieder hinzugefügt.',
        '- Auch die geänderten Dateien aus 32 ursprünglichen Nolvus-Konfigurationsmods sind für die Migration markiert. Die konkrete Liste liegt im Zusatzstand unter `changed-original-mod-files.tsv`; neue Nolvus-Versionen mit diesen Einstellungen abgleichen, nicht blind alte Programmdateien darüberkopieren.',
        '- Wiederherstellung des neuen Reparatur-Mods in einem frischen Staging-Verzeichnis erfolgreich geprüft: 90 Dateien mit SHA-256-Abgleich.',
        '',
        'Für das Nolvus-Update immer zunächst in einen neuen Staging-Ordner wiederherstellen und dort die neuen Nolvus-Konflikte prüfen. Alte MO2-/Tooldateien nicht blind über eine aktualisierte Nolvus-Installation kopieren.',
        '',
        '## Noch offene Grenzen',
        '',
        'Outfits ohne passende installierte 3BA-/HIMBO-Konvertierung erhalten durch diese Reparatur keine neue Konvertierung. Ihre fehlende OBody-Anpassung lässt sich nicht durch ein bloßes erneutes BodySlide-Bauen beseitigen. Die konkrete Liste bleibt im ursprünglichen Audit unter `../obody-bodyslide-audit-20261006/obody_missing_conversions.txt` dokumentiert.',
        '',
        'Unbenutzte mehrdeutige Alternativen (Adventurer Light Body Sleeves, HIMBO Amber Boots und männliche Unterwäschevarianten) wurden nicht willkürlich gebaut. Keine Pandora-/Nemesis-, LOD-, TexGen-, DynDOLOD- oder Synthesis-Ausgaben regeneriert.',
        '',
        '**Validierung:** echte Builds erfolgreich; installierte 90 Dateien gegen Stage geprüft; nutzbare TRI/NIF-Verknüpfungen geprüft; unveränderte Geometrie der 30 Referenzreparaturen geprüft; aktive Verzeichnisse und Pluginreihenfolge geprüft. Ein Test dieser Outfits im laufenden Spiel wurde nicht durchgeführt.',
        '',
        'Für spätere manuelle Builds: BodySlide über MO2 öffnen, passende Gruppe `Local OBody Current female` bzw. `Local OBody Current male`, passenden Null-Slider-Preset und **Build Morphs** wählen. Ausgabeordner ist das neue Reparatur-Mod.',
        '',
    ]
    (OUT/'REPARATUR_UND_BEREINIGUNG.md').write_text('\n'.join(lines),encoding='utf-8')
    print(json.dumps(validation,ensure_ascii=False,indent=2))

if __name__ == '__main__':
    main()
