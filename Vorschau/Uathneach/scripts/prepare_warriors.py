"""Uathneach configuration for the shared alpha-only artifact pipeline."""
from importlib.util import module_from_spec, spec_from_file_location
from pathlib import Path


if __name__ == "__main__":
    root = Path(__file__).resolve().parents[1]
    source = root.parent / "shared/warrior-artifacts/pipeline.py"
    spec = spec_from_file_location("aleria_warrior_artifacts", source)
    if spec is None or spec.loader is None:
        raise ImportError(f"Cannot load warrior artifact pipeline: {source}")
    pipeline = module_from_spec(spec)
    spec.loader.exec_module(pipeline)
    pipeline.main(root=root, schema="aleria.uathneach.warrior-artifacts",
                  qa_dir=root.parents[1] / "diagnostics/uathneach-2026-10-27/warriors")
