from __future__ import annotations

import csv
import json
from pathlib import Path

from language_data import ALPHABET, PREFIXES, SUFFIXES, MALE_NAMES, FEMALE_NAMES, LEXICON


OUT = Path(__file__).resolve().parent / "output"


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    data = {
        "language": "Kana'anith",
        "writing_direction": "rtl",
        "alphabet": [
            {"glyph": glyph, "name": name, "sound": sound, "image_meaning": image, "semantic_field": semantic, "root": root}
            for glyph, name, sound, image, semantic, root in ALPHABET
        ],
        "prefixes": [{"form": form, "meaning": meaning, "usage": usage} for form, meaning, usage in PREFIXES],
        "suffixes": [{"form": form, "meaning": meaning, "usage": usage} for form, meaning, usage in SUFFIXES],
        "male_names": [
            {"name": name, "first": first, "ending": ending, "first_meaning": first_meaning, "ending_meaning": ending_meaning}
            for name, first, ending, first_meaning, ending_meaning in MALE_NAMES
        ],
        "female_names": [
            {"name": name, "first": first, "ending": ending, "first_meaning": first_meaning, "ending_meaning": ending_meaning}
            for name, first, ending, first_meaning, ending_meaning in FEMALE_NAMES
        ],
        "lexicon": [
            {"category": category, "word": word, "part_of_speech": pos, "derivation": derivation, "literal": literal, "german": german}
            for category, word, pos, derivation, literal, german in LEXICON
        ],
    }
    (OUT / "Kanaanith_Daten.json").write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")

    with (OUT / "Kanaanith_Namen.csv").open("w", encoding="utf-8-sig", newline="") as target:
        writer = csv.writer(target, delimiter=";")
        writer.writerow(["Geschlecht", "Name", "Erststamm", "Zweitstamm", "Erstbedeutung", "Zweitbedeutung"])
        for gender, names in (("männlich", MALE_NAMES), ("weiblich", FEMALE_NAMES)):
            for row in names:
                writer.writerow([gender, *row])

    with (OUT / "Kanaanith_Wortschatz.csv").open("w", encoding="utf-8-sig", newline="") as target:
        writer = csv.writer(target, delimiter=";")
        writer.writerow(["Kategorie", "Kana'anith", "Wortart", "Herleitung", "Wörtlich", "Deutsch"])
        writer.writerows(LEXICON)

    print("exported JSON and CSV files")


if __name__ == "__main__":
    main()
