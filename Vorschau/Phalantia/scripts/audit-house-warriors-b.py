"""Compare selected and retained tool originals against exact workspace copies."""
import hashlib,json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
WORKSPACE=ROOT.parents[1]
def digest(path):
    with path.open('rb') as stream: return hashlib.file_digest(stream,'sha256').hexdigest()
def main():
    source=json.loads((ROOT/'sources/house-warriors-b-generation-receipts.json').read_text(encoding='utf8'))
    selected=source['entries']
    assert len(selected)==4
    jobs=json.loads((ROOT/'sources/house-warriors-b-jobs.json').read_text(encoding='utf8'))['jobs']
    assert {job['assetStem'] for job in jobs}=={row['assetStem'] for row in selected}
    rows=[]
    for entry in selected+source['previousAttempts']:
        expected=digest(Path(entry['toolOriginal']))
        actual=digest(ROOT/entry['workspaceOriginal'])
        assert actual==expected,entry['assetStem']
        rows.append(dict(assetStem=entry['assetStem'],sha256=actual,toolOriginalExact=True,
                         selected=entry in selected))
    report=dict(schemaVersion=1,verified=True,selectedFigures=4,originalsCompared=len(rows),entries=rows)
    path=WORKSPACE/'diagnostics/phalantia/warriors-b/generation-receipts-audit.json'
    path.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
    print(json.dumps(dict(verified=True,selectedFigures=4,originalsCompared=len(rows))))
if __name__=='__main__': main()
