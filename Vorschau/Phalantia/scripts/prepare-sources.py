"""Import only the two supplied Phalantia originals through the shared importer."""
from pathlib import Path
import runpy
import sys

sys.dont_write_bytecode = True
country = Path(__file__).resolve().parents[1]
workspace = country.parents[1]
if __name__ == '__main__':
    sys.argv = ['prepare-country-sources', str(country / 'source-import.json')]
    runpy.run_path(str(workspace / 'Vorschau/shared/prepare-country-sources.py'), run_name='__main__')
