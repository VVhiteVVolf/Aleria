from pathlib import Path
import runpy
import sys
script = Path(__file__).resolve().parent
runpy.run_path(str(script.parent / 'family-source-import' / Path(__file__).name), init_globals={'IMPORT_DIRECTORY': script})
