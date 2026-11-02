"""Export the commissioned sheets with the unchanged V3 cropping implementation."""
import hashlib
import importlib.util
import json
import shutil
from pathlib import Path
from types import SimpleNamespace
from PIL import Image, ImageDraw

root = Path(__file__).resolve().parents[3]
workshop = root / 'AleriaAlmanach/AvatarWerkstatt'
spec = importlib.util.spec_from_file_location('avatar_v3', workshop / 'Werkzeuge/Avatar Splitterer/AvatarSplitterPro_V3.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
splitter = module.AvatarSplitterProV3.__new__(module.AvatarSplitterProV3)
variable = lambda value: SimpleNamespace(get=lambda: value)
splitter.cols = splitter.rows = variable(3)
splitter.gap_x = splitter.gap_y = variable(0)
splitter.autocrop = variable(False)
splitter.grid_x = splitter.grid_y = [0, 1/3, 2/3, 1]
splitter.adjustments = [dict(left=0, top=0, right=0, bottom=0) for _ in range(9)]

def save_bytes(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    if path.exists():
        if path.read_bytes() != data:
            raise ValueError(f'Existing different output: {path}')
    else:
        path.write_bytes(data)

jobs = json.loads((root / 'diagnostics/gwynthor-seven-20261102/avatars-image-jobs.json').read_text(encoding='utf-8'))['entries']
receipt = []
for job in jobs:
    person = workshop / 'Charaktere/Einzelcharaktere' / job['name']
    filename = f"{job['slug']}-2026-11-02-set-{job['set']:02}"
    sheet = person / 'Sheets' / f'{filename}.png'
    source = Path(job['generatedPath'])
    if source.exists():
        save_bytes(sheet, source.read_bytes())
    elif not sheet.exists():
        raise FileNotFoundError(f'Missing generated source and secured sheet: {sheet}')
    save_bytes(person / 'Referenzen' / Path(job['ref']).name, Path(job['ref']).read_bytes())
    save_bytes(person / 'Prompts' / f'{filename}.txt', job['prompt'].encode('utf-8'))
    with Image.open(sheet) as image:
        assert image.width == image.height
        crops = splitter.get_crops(image.convert('RGBA'))
        boxes = splitter.base_boxes(image)
    for index, crop in enumerate(crops, 1):
        import io
        data = io.BytesIO()
        crop.save(data, format='PNG')
        name = f'{filename}_Bild{index}.png'
        for target in [person / 'Output' / name, workshop / 'Output' / job['name'] / name,
                       root / 'AleriaAlmanach/assets/gwynthor-seven/avatars' / job['slug'] / name]:
            save_bytes(target, data.getvalue())
        receipt.append(dict(person=job['name'], slug=job['slug'], set=job['set'], panel=index,
                            file=name, box=boxes[index-1], size=crop.size,
                            sha256=hashlib.sha256(data.getvalue()).hexdigest()))
    contact = Image.new('RGB', (600, 600), '#eeeeee')
    for index, crop in enumerate(crops):
        crop.thumbnail((200, 200))
        contact.paste(crop.convert('RGB'), ((index % 3)*200, (index//3)*200))
    target = root / f"diagnostics/gwynthor-seven-20261102/avatar-{job['slug']}-{job['set']}-review.jpg"
    contact.save(target)
(root / 'diagnostics/gwynthor-seven-20261102/avatar-export-receipt.json').write_text(json.dumps(receipt, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
print(f'{len(jobs)} sheets, {len(receipt)} avatars; unchanged V3, 3x3, gap 0/0, no autocrop.')
