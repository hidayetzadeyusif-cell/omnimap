# Run every time layers.json changes

import json
import os
import re

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
LAYERS_PATH = os.path.join(BASE_DIR, "data", "layers.json")
INDEX_PATH = os.path.join(BASE_DIR, "data", "index.json")

def tokenize(text):
    """Normalize and split text into keywords."""
    if not text:
        return []
    
    cleaned = re.sub(r"[^a-zA-Z0-9\s]", " ", text.lower())
    return [t for t in cleaned.split() if t]


def main():
    print("Loading layers.json...")

    with open(LAYERS_PATH, "r", encoding="utf-8") as f:
        layers = json.load(f)

    index = {}

    for i, layer in enumerate(layers):

        texts = []

        texts.append(layer.get("name", ""))

        md = layer.get("metadata", {})
        texts.append(md.get("realName", ""))
        texts.append(md.get("categories", ""))

        tokens = []
        for t in texts:
            tokens.extend(tokenize(t))

        for token in tokens:
            index.setdefault(token, []).append(i)

    print("Writing index.json...")
    with open(INDEX_PATH, "w", encoding="utf-8") as f:
        json.dump(index, f, indent=4)

    print("Done! Search index updated successfully.")
    print(f"Output: {INDEX_PATH}")


if __name__ == "__main__":
    main()
