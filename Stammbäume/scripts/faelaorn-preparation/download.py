from pathlib import Path
import runpy
script = Path(__file__).resolve().parent
runpy.run_path(str(script.parent / 'family-source-import/download.py'), init_globals={'IMPORT_DIRECTORY': script})
