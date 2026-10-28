from pathlib import Path
from importlib.util import spec_from_file_location, module_from_spec
root = Path(__file__).resolve().parent
spec = spec_from_file_location('warrior_artifacts', root.parent/'shared/warrior-artifacts/pipeline.py')
pipeline = module_from_spec(spec)
spec.loader.exec_module(pipeline)
if __name__ == '__main__':
    pipeline.main(root=root, schema='aleria.deitheach.warrior-artifacts', qa_dir=root.parents[1]/'diagnostics/deitheach/warriors')
