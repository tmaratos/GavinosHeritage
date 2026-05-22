"""Build menu JSON from extracted PDF text files."""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
EXTRACTED = ROOT / "data" / "menus" / "_extracted"
OUT = ROOT / "data" / "menus"


def despace_line(line: str) -> str:
    """PDF exports often insert spaces between every character."""
    stripped = line.strip()
    if not stripped:
        return line
    parts = re.split(r"\s{2,}", stripped)
    if len(parts) > 1:
        return " ".join("".join(p.split()) for p in parts if p.strip())
    tokens = stripped.split()
    singles = sum(1 for p in tokens if len(p) == 1)
    if len(tokens) >= 4 and singles / len(tokens) > 0.55:
        return "".join(tokens)
    return stripped


def normalize_text(raw: str) -> str:
    lines = [despace_line(ln) for ln in raw.splitlines()]
    return "\n".join(lines)


def parse_price_line(line: str) -> tuple[str, str, str] | None:
    """Return name, description, price from lines like 'NAME - 12.99' or 'NAME $25'."""
    line = line.strip()
    if not line or len(line) < 3:
        return None

    m = re.search(r"\s+-\s+\$?(\d+(?:\.\d{2})?)\s*$", line, re.I)
    if m:
        price = m.group(1)
        left = line[: m.start()].strip(" -")
        return left, "", price

    m = re.search(r"\s+\$(\d+(?:\.\d{2})?)\s*$", line)
    if m:
        price = m.group(1)
        left = line[: m.start()].strip()
        return left, "", price

    m = re.search(r"\s+(\d+\.\d{2})\s*$", line)
    if m and not re.search(r"\d+\.\d{2}.*\d+\.\d{2}", line):
        price = m.group(1)
        left = line[: m.start()].strip(" -")
        if left:
            return left, "", price

    # Dual price: 6pc - 6.99 / 12pc - 11.99
    if re.search(r"\d+\.\d{2}.*/", line):
        return line, "", "See menu"

    return None


def is_section_header(line: str) -> bool:
    s = line.strip()
    if not s or len(s) < 3:
        return False
    if parse_price_line(s):
        return False
    if s.lower().startswith(
        (
            "served with",
            "choice of",
            "add ",
            "toppings",
            "all pizzas",
            "all pizza",
            "two locations",
            "like us",
            "www.",
            "monday",
            "daily lunch",
            "top off",
            "additional pizza",
            "crust styles",
            "neapolitan",
            "regular pie",
            "rectangular",
        )
    ):
        return False
    if re.match(r"^[\d\s\./$]+$", s):
        return False
    # ALL CAPS or Title section
    letters = re.sub(r"[^A-Za-z]", "", s)
    if not letters:
        return False
    upper_ratio = sum(1 for c in letters if c.isupper()) / len(letters)
    return upper_ratio > 0.75 and len(s) < 80


def slugify(text: str) -> str:
    s = re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")
    return s or "section"


def parse_menu_text(raw: str, title: str, subtitle: str) -> dict:
    text = normalize_text(raw)
    lines = [ln.strip() for ln in text.splitlines()]

    sections: list[dict] = []
    current: dict | None = None
    pending_name: str | None = None
    pending_desc: list[str] = []

    def flush_item(name: str, desc: str, price: str):
        nonlocal current, pending_name, pending_desc
        if not current:
            return
        item = {"name": name.strip(), "price": price}
        if desc.strip():
            item["description"] = desc.strip()
        current["items"].append(item)
        pending_name = None
        pending_desc = []

    for line in lines:
        if not line:
            continue
        if "gavinospizzeria.com" in line.lower() or "facebook.com" in line.lower():
            continue
        if line.startswith("5211 Kingston") or line.startswith("865-"):
            continue

        if is_section_header(line):
            if current and current["items"]:
                sections.append(current)
            current = {"id": slugify(line), "name": line.title() if line.isupper() else line, "items": []}
            pending_name = None
            pending_desc = []
            continue

        parsed = parse_price_line(line)
        if parsed:
            name, desc, price = parsed
            if pending_name and not desc:
                flush_item(pending_name, " ".join(pending_desc), price)
            else:
                flush_item(name, desc or " ".join(pending_desc), price)
            continue

        if not current:
            continue

        if pending_name is None:
            pending_name = line
        else:
            pending_desc.append(line)

    if current and (current["items"] or pending_name):
        if pending_name:
            parsed = parse_price_line(pending_name)
            if parsed:
                flush_item(*parsed)
        if current["items"]:
            sections.append(current)

    # Dedupe section ids
    seen: dict[str, int] = {}
    for sec in sections:
        base = sec["id"]
        n = seen.get(base, 0)
        seen[base] = n + 1
        if n:
            sec["id"] = f"{base}-{n + 1}"

    return {"title": title, "subtitle": subtitle, "sections": sections}


def build_lunch_specials(raw: str) -> list[dict]:
    items = []
    block = re.search(r"Daily Lunch Specials(.*)", raw, re.S | re.I)
    if not block:
        return items
    text = block.group(1)
    chunks = re.split(r"\n\s*\n", text)
    for chunk in chunks:
        lines = [ln.strip() for ln in chunk.splitlines() if ln.strip()]
        if not lines:
            continue
        price_m = re.search(r"\$?(\d+\.\d{2})", lines[-1])
        if not price_m:
            continue
        price = price_m.group(1)
        name = " ".join(lines[:-1])
        if name and len(name) > 5:
            items.append({"name": name, "price": price})
    return items


def main():
    dinner = parse_menu_text(
        (EXTRACTED / "Gavinos-Menu.txt").read_text(encoding="utf-8"),
        "Dine-In / To-Go Menu",
        "Full menu below — download a PDF to print and keep at home.",
    )

    lunch_raw = (EXTRACTED / "Gavinos-Lunch-Menu-Feb-2022-PDF.txt").read_text(encoding="utf-8")
    lunch = parse_menu_text(
        lunch_raw,
        "Lunch Menu",
        "Monday–Friday 12pm–3pm. PDF available for printing.",
    )
    specials = build_lunch_specials(lunch_raw)
    if specials:
        lunch["sections"].insert(
            0,
            {"id": "lunch-specials", "name": "Daily Lunch Specials", "items": specials},
        )

    catering = parse_menu_text(
        (EXTRACTED / "Gavinos-Catering-menu-March-2022-PDF.txt").read_text(encoding="utf-8"),
        "Catering Menu",
        "Tray sizes for groups and events — PDF available for printing.",
    )

    for name, data in [
        ("dinner-menu.json", dinner),
        ("lunch-menu.json", lunch),
        ("catering-menu.json", catering),
    ]:
        path = OUT / name
        path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
        count = sum(len(s["items"]) for s in data["sections"])
        print(f"{name}: {len(data['sections'])} sections, {count} items")

    pdfs = {
        "downloads": [
            {
                "id": "dine-in",
                "label": "Dine-In / To-Go Menu (PDF)",
                "file": "assets/pdfs/menus/Gavinos-Menu.pdf",
            },
            {
                "id": "lunch",
                "label": "Lunch Menu (PDF)",
                "file": "assets/pdfs/menus/Gavinos-Lunch-Menu-Feb-2022-PDF.pdf",
            },
            {
                "id": "catering",
                "label": "Catering Menu (PDF)",
                "file": "assets/pdfs/menus/Gavinos-Catering-menu-March-2022-PDF.pdf",
            },
        ]
    }
    (OUT / "menu-pdfs.json").write_text(json.dumps(pdfs, indent=2) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
