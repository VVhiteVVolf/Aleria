"""Assemble the private package and exact named-NPC distribution."""
from pathlib import Path
import hashlib
import json
import shutil

ROOT = Path(__file__).resolve().parent
NAME = 'Local - Hold Guard Armor - Huskarl Standalone 20261015'
PACKAGE = ROOT / 'package' / NAME
CONFIG = '000_Local_HoldGuard_Huskarl_DISTR.ini'
PLUGIN = 'HoldGuardHuskarlStandalone.esp'
state = json.loads((ROOT / 'profile-before.json').read_text(encoding='utf8'))
validation = json.loads((ROOT / 'validation.json').read_text(encoding='utf8'))
conversion = json.loads((ROOT / 'conversion.json').read_text(encoding='utf8'))
targets = json.loads((ROOT / 'target-npcs.json').read_text(encoding='utf8'))
assert validation['status'] == 'VALIDATED'
assert hashlib.sha256((ROOT / PLUGIN).read_bytes()).hexdigest() == validation['plugin_sha256']
assert len(targets) == 16
holds = {
    'HousecarlWhiterun': 'Whiterun', 'Irileth': 'Whiterun',
    'HousecarlSolitude': 'Solitude', 'BolgeirBearclaw': 'Solitude',
    'HousecarlRiften': 'Riften', 'Unmid': 'Riften',
    'HousecarlMarkarth': 'Markarth', 'Faleen': 'Markarth',
    'HousecarlWindhelm': 'Eastmarch', 'Galmar': 'Eastmarch',
    'BYOHHousecarlFalkreath': 'Falkreath', 'Helvard': 'Falkreath',
    'BYOHHousecarlHjaalmarch': 'Hjaalmarch', 'Gorm': 'Hjaalmarch',
    'BYOHHousecarlPale': 'Pale', 'Jod': 'Pale',
}
assert set(holds) == {t['editor_id'] for t in targets.values()}
rules = ['; Private standalone Huskarl armor distribution, 2026-10-15.',
         '; Exact NPC base FormIDs only; no normal guards or broad faction filters.',
         '; Regular outfits only: follower outfit management retains priority.',
         '; Early filename gives these explicit NPC rules priority over broad outfit rules.', '']
assignments = []
for target in targets.values():
    owner, npc_id = target['identity'].split(':')
    owner = next(p for p in state['plugins'] if p.lower() == owner)
    hold = holds[target['editor_id']]
    shield = 'skyrim.esm:013955' in target['outfit_details']['items']
    outfit = conversion['outfits'][hold + ('Shield' if shield else '')]
    outfit_id, _ = outfit.split(':')
    rules.extend([f"; {target['name']} - {hold}",
        f'Outfit = 0x{int(outfit_id, 16):X}~{PLUGIN}|NONE|0x{int(npc_id, 16):X}~{owner}|NONE|NONE|NONE|100'])
    assignments.append({'npc': target['name'], 'editor_id': target['editor_id'],
                        'npc_form': f'0x{npc_id}~{owner}', 'hold': hold,
                        'outfit': outfit, 'prior_outfit': target['outfit'],
                        'original_steel_shield_retained': shield})

for name, folder in state['sources']:
    for path in Path(folder).glob('*_DISTR.ini'):
        assert CONFIG.lower() < path.name.lower(), 'Review SPID priority: ' + str(path)
assert not PACKAGE.exists(), 'Package already prepared; inspect before replacing'
PACKAGE.mkdir(parents=True)
for folder in ('Meshes', 'Textures'):
    shutil.copytree(ROOT / 'upstream/Data' / folder, PACKAGE / folder)
shutil.copy2(ROOT / PLUGIN, PACKAGE / PLUGIN)
(PACKAGE / CONFIG).write_text('\n'.join(rules) + '\n', encoding='utf8')
(PACKAGE / 'meta.ini').write_text('[General]\nmodid=195445\nversion=1.0+local-standalone\ncategory=0\n'
    'notes=Private standalone Huskarl adaptation; original replacer ESP excluded.\n', encoding='utf8')
table = '\n'.join(f"- {a['npc']}: {a['hold']}" for a in assignments)
readme = f'''Hold Guard Armor SE – private Huskarl-Standalone-Version

Mod: {NAME}
Plugin: {PLUGIN} (ESP mit ESL-Flag; kein normaler ESP-Slot)
Original: Nexus SSE 195445, lokaler Download vom 15.10.2026.
Originaldatei 1GuarfArmor.esp wird ausdrücklich NICHT mitinstalliert.

22 zusätzliche Rüstungsteile, herstellbar an der Schmiede und verbesserbar
an der Werkbank. Suche im Gegenstandsmenü oder per help "Huskarl" 4.
Materialien: Stahl, Leder, Lederstreifen; vorhandene Rüstungswerte erhalten.
Die Helme sind separat erhältlich; NPC-Sets werden ohne Helm verteilt.
Ein zuvor im Standard-Outfit enthaltener Stahlschild bleibt dabei erhalten.
Das neue Standard-Outfit ersetzt Körperrüstung, Handschuhe und Stiefel;
sonstige Bestandteile des bisherigen Standard-Outfits werden nicht mitverteilt.
Waffeninventar, NPC-Aussehen, Körper-/Hautmods, Quests und KI bleiben unberührt.
Kein NPC-, Leveled-List- oder Vanilla-Rüstungsdatensatz wird überschrieben.
Normale Wachen behalten ihre bisherige Ausstattung durch Sons of Skyrim.

SPID-Verteilung an exakt diese 16 NPC-Basen:
{table}

Winterhold-Set ist herstellbar; in diesen beiden Vanilla-Gruppen gibt es
keinen passenden Winterhold-Huskarl als automatischen Empfänger.

BodySlide/OBody: Das Original liefert keine Projekte oder Morph-TRIs.
Die mitgelieferten Modelle bleiben unverändert und behalten ihre feste Form.
Es wurde kein ungeeigneter BodySlide-Build erzeugt.

SPID-Konfiguration: {CONFIG}
Entfernen einer einzelnen Outfit-Zeile beendet die jeweilige Verteilung.
Von Follower-Managern bereits per SetOutfit gesetzte Kleidung hat bei SPID
7.2 Vorrang. Solche NPCs wechseln gegebenenfalls erst nach Rückkehr zum
Standard-Outfit; dazu nicht recycleactor oder resetinventory verwenden.

Prüfung: Alle neuen Records im konservativen ESL-Bereich ab 0x800;
alle Form-Verweise und Mesh-/Texturpfade aufgelöst; unveränderte Assets.
Noch kein Ingame-Test. Bei Rücknahme zuerst ein Save vor der Installation
verwenden und diesen gesamten lokalen Mod deaktivieren.

Dies ist eine private lokale Anpassung, kein öffentliches Release.
SPID-Dokumentation: https://www.nexusmods.com/skyrimspecialedition/articles/10421
'''
(PACKAGE / 'README_HUSKARL.txt').write_text(readme, encoding='utf-8-sig')
manifest = {p.relative_to(PACKAGE).as_posix(): hashlib.sha256(p.read_bytes()).hexdigest()
            for p in PACKAGE.rglob('*') if p.is_file()}
result = {'package': str(PACKAGE), 'mod_name': NAME, 'plugin': PLUGIN,
          'distribution_file': CONFIG, 'profile': state['profile'],
          'fingerprint_before': state['fingerprint'], 'assignments': assignments,
          'files': manifest, 'validation': validation,
          'original_archive': r'E:\Nolvus\Instances\Nolvus Awakening\MODS\downloads\1GuardArmorSE 195445 1 2026-10-15T14-03Z 8gJHT4ACL.7z'}
(ROOT / 'install-plan.json').write_text(json.dumps(result, indent=2), encoding='utf8')
print(json.dumps({'mod': NAME, 'files': len(manifest), 'recipients': len(assignments)}, indent=2))
