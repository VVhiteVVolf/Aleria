"""Stage official, digest-verified releases; do not install into the game."""
import concurrent.futures
import hashlib
import json
import urllib.request
import zipfile
from pathlib import Path, PurePosixPath

ROOT = Path(__file__).parent
SELECTION = {
    'Severause--SeverActions': 'SeverActions-4.2.0-FOMOD.zip',
    'pdusen--skyrimnet-plugin-narrative-engine': 'NarrativeEngine-v0.7.1.zip',
    'tetherball88--OStimNet': 'OStimNet_v2.5.4_SkyrimNet_v25.zip',
    'tetherball88--OStimNavigator': 'OStimNavigator_v2.2.1.zip',
}

def download(item):
    repo, name = item
    release = json.loads((ROOT / 'releases' / (repo + '.json')).read_text())[0]
    asset = next(a for a in release['assets'] if a['name'] == name)
    target = ROOT / 'downloads' / name
    target.parent.mkdir(exist_ok=True)
    if not target.exists():
        request = urllib.request.Request(asset['browser_download_url'], headers={'User-Agent': 'local-skyrimnet-audit'})
        with urllib.request.urlopen(request, timeout=60) as source, target.open('xb') as out:
            while block := source.read(4 * 1024 * 1024):
                out.write(block)
    digest = hashlib.file_digest(target.open('rb'), 'sha256').hexdigest()
    assert 'sha256:' + digest == asset['digest'], 'Official digest mismatch: ' + name
    destination = ROOT / 'upstream' / repo
    with zipfile.ZipFile(target) as archive:
        assert archive.testzip() is None
        for entry in archive.infolist():
            path = PurePosixPath(entry.filename)
            assert not path.is_absolute() and '..' not in path.parts
            assert ':' not in entry.filename and '\\' not in entry.filename
        if not destination.exists():
            archive.extractall(destination)
    return {'release': release['tag_name'], 'archive': name, 'sha256': digest, 'bytes': target.stat().st_size}

if __name__ == '__main__':
    with concurrent.futures.ThreadPoolExecutor(max_workers=3) as executor:
        receipts = list(executor.map(download, SELECTION.items()))
    (ROOT / 'download-receipts.json').write_text(json.dumps(receipts, indent=2), encoding='utf-8')
    for receipt in receipts:
        print(json.dumps(receipt))
