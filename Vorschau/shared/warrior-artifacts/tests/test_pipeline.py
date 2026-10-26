"""Configuration isolation and contact-sheet capacity at the shared boundary."""

from contextlib import redirect_stdout
from importlib.util import module_from_spec, spec_from_file_location
from io import StringIO
from pathlib import Path
import shutil
import unittest
from uuid import uuid4

from PIL import Image


spec = spec_from_file_location("warrior_artifacts_test_target", Path(__file__).resolve().parents[1] / "pipeline.py")
pipeline = module_from_spec(spec)
spec.loader.exec_module(pipeline)


class WarriorArtifactsTests(unittest.TestCase):
    def setUp(self):
        temporary_parent = Path(__file__).resolve().parent
        self.root = (temporary_parent / f"test-run-{uuid4().hex}").resolve()
        self.assertTrue(self.root.is_relative_to(temporary_parent))
        self.root.mkdir()
        self.addCleanup(shutil.rmtree, self.root)

    def test_realms_keep_independent_roots_and_manifest_schemas(self):
        first = pipeline.WarriorArtifacts(root=self.root / "first", schema="first", qa_dir=self.root / "qa-first")
        second = pipeline.WarriorArtifacts(root=self.root / "second", schema="second", qa_dir=self.root / "qa-second")
        pipeline.save_json(first.manifest, first.read_manifest())
        self.assertEqual(first.read_manifest()["schema"], "first")
        self.assertEqual(second.read_manifest()["schema"], "second")
        self.assertFalse(second.manifest.exists())
        with self.assertRaisesRegex(ValueError, "manifest"):
            pipeline.WarriorArtifacts(root=first.root, schema="second", qa_dir=second.qa_dir).read_manifest()

    def test_contact_keeps_the_old_layout_and_grows_for_31_or_32_figures(self):
        artifacts = pipeline.WarriorArtifacts(root=self.root, schema="test", qa_dir=self.root / "qa")
        image_path = self.root / "figure.png"
        Image.new("RGBA", (32, 48), (80, 70, 60, 255)).save(image_path)
        for count, expected_size in [(20, (1024, 2040)), (31, (1024, 3264)), (32, (1024, 3264))]:
            with self.subTest(count=count):
                manifest = {"schema": "test", "version": 1, "entries": [
                    {"id": f"figure-{index}", "production": "figure.png"} for index in range(count)
                ]}
                pipeline.save_json(artifacts.manifest, manifest)
                with redirect_stdout(StringIO()):
                    artifacts.contact()
                with Image.open(artifacts.qa_dir / "contact-sheet.jpg") as sheet:
                    self.assertEqual(sheet.size, expected_size)
        with self.assertRaisesRegex(ValueError, "too small"):
            artifacts.contact(columns=4, rows=5)
        with self.assertRaisesRegex(ValueError, "positive"):
            artifacts.contact(columns=0)


if __name__ == "__main__":
    unittest.main()
