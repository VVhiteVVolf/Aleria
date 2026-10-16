"""Validate generated art; only the approved crest alpha is cleaned."""
import json
from PIL import Image
from heraldic_emblem_alpha import ROOT, normalize_emblem_alpha

directory = ROOT / 'AleriaAlmanach/assets/lachende-nixe'
manifest = json.loads((directory / 'image-prompts.json').read_text(encoding='utf-8'))
report = []
for job in manifest['entries']:
    path = ROOT / job['destination']
    alpha = normalize_emblem_alpha(path) if job['id'] == 'sonnenfels-wappen' else None
    with Image.open(path) as image:
        assert image.width == (image.height if job['transparent'] else image.height * 2 // 3), path
        if job['transparent']:
            assert image.mode == 'RGBA', path
            channel = image.getchannel('A')
            assert channel.histogram()[0] > image.width * image.height * .12, path
            assert channel.getpixel((0, 0)) == 0, path
        report.append({'id': job['id'], 'file': job['destination'], 'size': image.size,
                       'bytes': path.stat().st_size, 'alphaCleanup': alpha})
(directory / 'art-audit.json').write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(json.dumps({'images': len(report), 'bytes': sum(item['bytes'] for item in report)}))
