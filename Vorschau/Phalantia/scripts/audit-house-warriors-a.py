"""Check all retained tool copies and the five active house-warrior artifacts."""
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
WORKSPACE = ROOT.parents[1]

def digest(path):
    with path.open('rb') as stream:
        return hashlib.file_digest(stream,'sha256').hexdigest()

def main():
    read = lambda path:json.loads((ROOT/path).read_text(encoding='utf8'))
    jobs = read('sources/house-warriors-a-jobs.json')['jobs']
    receipts = read('sources/house-warriors-a-generation-receipts.json')['entries']
    artifacts = read('sources/house-warriors-a-asset-receipts.json')['entries']
    assert len(jobs) == len(artifacts) == 5
    assert len(receipts) == 8
    copies = []
    for receipt in receipts:
        local = ROOT/receipt['workspaceOriginal']
        source_hash = digest(Path(receipt['toolOriginal']))
        assert source_hash == digest(local)
        copies.append(dict(id=receipt['id'],sha256=source_hash,selected=receipt['selected'],toolCopyExact=True))
    active = []
    for job in jobs:
        artifact = next(row for row in artifacts if row['id'] == job['assetStem'])
        receipt = next(row for row in receipts if row['id'] == job['assetStem'])
        assert receipt['selected']
        assert artifact['sourceSha256'] == digest(ROOT/receipt['workspaceOriginal'])
        assert artifact['productionSha256'] == digest(ROOT/artifact['production'])
        assert artifact['previewSha256'] == digest(ROOT/artifact['preview'])
        for proof in ['originalUnchanged','rgbUnchanged']:
            assert artifact['proof'][proof]
        assert artifact['proof']['originalTransparentGapsFilled'] is False
        active.append(dict(houseId=job['houseId'],name=job['name'],assetStem=job['assetStem'],
                           production=artifact['production'],preview=artifact['preview'],
                           sourceSha256=artifact['sourceSha256'],productionSha256=artifact['productionSha256'],
                           originalUnchanged=True,rgbUnchanged=True,gapsNotFilled=True))
    report = dict(schemaVersion=1,verified=True,tool='built-in image_gen.imagegen',activeCount=5,
                  retainedToolOutputs=8,failures=[],active=active,copies=copies,
                  visualReview=dict(eachGeneratedImageViewed=True,neutralProductionContactViewed=True,
                    royalHelmet='User screenshot 3 included in initial royal calls through five conversation images.',
                    framingCorrection='Daskyr revision v2 restores clear space above complete spearhead.',
                    transparencyNote='Neutral alpha-composited contact is authoritative; tool PNG display may show hidden RGB.'),
                  referenceManifest='sources/house-warriors-a-jobs.json')
    destination=WORKSPACE/'diagnostics/phalantia/warriors-a/generation-receipts-audit.json'
    destination.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
    print(json.dumps(dict(verified=True,activeCount=5,retainedToolOutputs=8,toolOriginalCopiesExact=True,rgbUnchanged=True)))

if __name__ == '__main__':main()
