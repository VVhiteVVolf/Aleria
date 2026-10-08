from pathlib import Path
import runpy
import sys
script = Path(__file__).resolve().parent
common = script.parent / 'family-source-import'
sys.path.insert(0, str(common))
runpy.run_path(str(common / Path(__file__).name), init_globals={'IMPORT_DIRECTORY': script})
