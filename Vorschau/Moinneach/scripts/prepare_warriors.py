"""Moinneach adapter for the shared alpha-only warrior artifact pipeline."""
from importlib.util import module_from_spec, spec_from_file_location
from pathlib import Path


def main():
    root = Path(__file__).resolve().parents[1]
    spec = spec_from_file_location('aleria_warrior_artifacts', root.parent / 'shared/warrior-artifacts/pipeline.py')
    if spec is None or spec.loader is None:
        raise ImportError('Cannot load the shared warrior artifact pipeline')
    pipeline = module_from_spec(spec)
    spec.loader.exec_module(pipeline)
    pipeline.main(root=root, schema='aleria.moinneach.warrior-artifacts',
                  qa_dir=root.parents[1] / 'diagnostics/moinneach/warriors')


if __name__ == '__main__':
    main()
