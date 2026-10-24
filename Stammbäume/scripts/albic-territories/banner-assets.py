"""Compose regional cloth banners from the region's existing clan emblem.

This creates vector assets, not new clan artwork. The embedded PNG is only
resized losslessly; the original emblem and existing regional banners remain.
"""
from pathlib import Path
from PIL import Image
import base64
import hashlib
import io
import json
import xml.sax.saxutils as xml

ROOT = Path(__file__).resolve().parents[3]
SOURCE = ROOT / 'Stammbäume/assets/js/modules/albic-territories/fiefs.source.json'
PALETTES = {
    'Leitheach': ('#293c32', '#d6c39a'),
    'Aislearneach': ('#46312e', '#c9ae73'),
    'Dunfal': ('#354337', '#ddd1ad'),
    'Blaithneach': ('#263e42', '#c7bd98'),
    'Uathneach': ('#293c48', '#c9b178'),
    'Faelaorn': ('#344741', '#c3ad83'),
    'Ceitheach': ('#3d3033', '#b7a183'),
}
REUSED = {
    'Leitheach': {
        'fancha': 'tir-na-fancha.png',
        'frisealach': 'lehensherrschaft-ard-frisealach.png',
        'somhairle': 'herrschaft-broch-an-clais.png',
        'gortach': 'herrschaft-ru-gortach.png',
        'ruitheach': 'herrschaft-dal-ruitheach.png',
        'laidir': 'lehensherrschaft-ruin-laidir.png',
        'choinnich': 'herrschaft-ua-choinnich.png',
        'nic-blar': 'herrschaft-nic-blar.png',
        'airgid': 'lehensherrschaft-tir-an-airgid.png',
    },
    'Dunfal': {key: f'herrschaft-{name}.png' for key, name in [
        ('ailella', 'mac-sidhe-ailella'), ('cein', 'mac-cein'),
        ('birn', 'dal-birn'), ('morath', 'ruin-morath'),
        ('riangabra', 'na-riangabra'), ('eachtrai', 'mac-eachtrai'),
    ]},
}


def render_banner(name, data_uri, background, trim):
    title = xml.escape('Regionalbanner ' + name)
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="800" height="800" role="img" aria-label="{title}">
  <title>{title}</title>
  <defs><clipPath id="cloth"><path d="M86 72H714V650L658 724L602 700L550 738L492 714L400 756L310 714L250 738L198 700L142 724L86 650Z"/></clipPath></defs>
  <path d="M66 54H734V80H66Z" fill="#504336"/>
  <path d="M86 72H714V650L658 724L602 700L550 738L492 714L400 756L310 714L250 738L198 700L142 724L86 650Z" fill="{background}" stroke="#332d26" stroke-width="8" stroke-linejoin="round"/>
  <g clip-path="url(#cloth)" fill="none" stroke="{trim}">
    <path d="M112 82V637L158 696L200 675L252 708L310 687L400 727L490 687L548 708L600 675L642 696L688 637V82" stroke-width="8"/>
    <path d="M131 106H669M131 620H669" stroke-width="4"/>
    <path d="M150 134L172 156L150 178L128 156ZM650 134L672 156L650 178L628 156ZM150 548L172 570L150 592L128 570ZM650 548L672 570L650 592L628 570Z" stroke-width="5"/>
    <path d="M310 658L340 640L370 658L400 640L430 658L460 640L490 658" stroke-width="6"/>
    <path d="M106 210L121 221M106 414L121 403M694 260L679 271M694 472L679 461M228 700L241 687M571 701L560 686" stroke="#a59576" stroke-width="3" opacity=".55"/>
  </g>
  <image x="180" y="170" width="440" height="440" href="{data_uri}"/>
</svg>
'''


def main():
    source = json.loads(SOURCE.read_text(encoding='utf8'))
    catalogs = {realm: json.loads((ROOT/f'Karten/{realm}/territories.import.json').read_text(encoding='utf8'))['territories'] for realm in PALETTES}
    uath = json.loads((ROOT/'Stammbäume/assets/js/data/uathneach-territories.source.json').read_text(encoding='utf8'))
    manifest = []
    for fief in source['fiefs']:
        realm = fief['realm']
        territory = next((t for t in catalogs[realm] if t['id'] == fief['id']), None)
        key = fief['id'].split('-herrschaft-')[-1] if realm == 'Uathneach' else ''
        if realm == 'Uathneach':
            clan = next(c for c in uath['clans'] if c['id'] == key)
            crest = clan['crest']
        elif territory:
            crest = territory['crest']
        else:
            crest = '/Stammbäume/assets/images/houses/Leitheach/clan-dal-t-saor.png'
        if fief['extent'] == 'urban':
            if '/regions/Dunfal/' not in fief.get('banner', ''):
                fief['banner'] = crest
            continue
        reused = next((value for key, value in REUSED.get(realm, {}).items() if fief['id'].endswith('-'+key)), None)
        if reused:
            fief['banner'] = f'/Stammbäume/assets/images/regions/{realm}/{reused}'
            continue
        emblem_path = ROOT / crest.lstrip('/')
        emblem = Image.open(emblem_path).convert('RGBA')
        emblem.thumbnail((440, 440), Image.Resampling.LANCZOS)
        buffer = io.BytesIO()
        emblem.save(buffer, 'PNG', optimize=True)
        uri = 'data:image/png;base64,' + base64.b64encode(buffer.getvalue()).decode('ascii')
        fief['banner'] = f'/Stammbäume/assets/images/regions/{realm}/fiefs/{fief["id"]}.svg'
        destination = ROOT / fief['banner'].lstrip('/')
        destination.parent.mkdir(exist_ok=True, parents=True)
        content = render_banner(fief['name'], uri, *PALETTES[realm])
        destination.write_text(content, encoding='utf8', newline='\n')
        manifest.append({'territoryId': fief['id'], 'asset': fief['banner'], 'emblemSource': crest,
                         'emblemSha256': hashlib.sha256(emblem_path.read_bytes()).hexdigest(),
                         'sha256': hashlib.sha256(content.encode()).hexdigest()})
    SOURCE.write_text(json.dumps(source, ensure_ascii=False, indent=2)+'\n', encoding='utf8', newline='\n')
    path = ROOT/'Stammbäume/assets/js/modules/albic-territories/banner-assets.source.json'
    path.write_text(json.dumps({'schemaVersion': 1, 'method': 'svg-cloth-with-existing-clan-emblem', 'assets': manifest}, ensure_ascii=False, indent=2)+'\n', encoding='utf8', newline='\n')
    print(f'{len(manifest)} regionale Banner als eigenständige SVG-Dateien erstellt; vorhandene Banner erhalten.')


if __name__ == '__main__':
    main()
