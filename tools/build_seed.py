#!/usr/bin/env python3
"""
Turn tools/catalogue.json (the live-site scrape) into demo/js/seed.js.

Deliberately conservative about what it invents. The live site publishes names,
prices, images, colour and memory options, condition and stock — and nothing
else. It has no per-product description anywhere. So taglines are left empty
rather than fabricated, and specs are left empty rather than guessed from the
product name. The storefront already handles both.

  python3 tools/build_seed.py
"""

import json, re, unicodedata
from pathlib import Path

CAT_MAP = {"iphone": "iphone", "ipad": "ipad", "mac": "mac", "watch": "watch",
           "tv": "tv", "gifts": "gifts", "accessories": "accessories"}

# The site's colour vocabulary -> a swatch. Names are its own, lowercased.
COLOR_HEX = {
    "black": ("#1C1C1E", "შავი", "Black"),
    "white": ("#F5F5F7", "თეთრი", "White"),
    "silver": ("#E3E4E5", "ვერცხლისფერი", "Silver"),
    "gold": ("#E8CFA9", "ოქროსფერი", "Gold"),
    "blue": ("#4E6E9E", "ლურჯი", "Blue"),
    "sierrablue": ("#9BB5CE", "სიერას ლურჯი", "Sierra Blue"),
    "green": ("#5C8A6E", "მწვანე", "Green"),
    "orange": ("#D2653A", "ნარინჯისფერი", "Orange"),
    "purple": ("#8E7CC3", "იისფერი", "Purple"),
    "red": ("#B33A3A", "წითელი", "Red"),
    "yellow": ("#E5C15A", "ყვითელი", "Yellow"),
    "pink": ("#E5C6CB", "ვარდისფერი", "Pink"),
}

# Which parametric SVG to draw when a product has no photograph.
def device_for(cat, group, name):
    n = name.lower()
    if cat == "iphone": return "iphone"
    if cat == "ipad":   return "ipad"
    if cat == "watch":  return "watch"
    if cat == "gifts":  return "gift"
    if cat == "tv":     return "appletv"
    if cat == "mac":
        if "imac" in n: return "imac"
        if "mini" in n: return "macmini"
        if "studio" in n or "pro" in n and "macbook" not in n: return "macmini"
        return "macbook"
    g = (group or "").lower()
    if "headphone" in g or "airpod" in n: return "airpods"
    if "speaker" in g or "homepod" in n:  return "homepod"
    return "accessory"


def slugify(name, pid):
    s = unicodedata.normalize("NFKD", name).encode("ascii", "ignore").decode()
    s = re.sub(r"[^a-zA-Z0-9]+", "-", s).strip("-").lower()
    return f"{s or 'item'}-{pid}"


def sku(name, pid):
    letters = re.sub(r"[^A-Za-z0-9]", "", name).upper()[:6] or "ITEM"
    return f"{letters}{pid}"


def js_str(s):
    return "'" + str(s).replace("\\", "\\\\").replace("'", "\\'").replace("\n", " ") + "'"


def build_product(p):
    cat = CAT_MAP.get(p["category"], "accessories")
    pid = p["id"]
    name = p["name"].strip()

    colors = []
    for c in p["colors"]:
        hexv, ka, en = COLOR_HEX.get(c, ("#8A8F98", c, c.title()))
        colors.append({"id": c, "en": en, "ka": ka, "hex": hexv})
    if not colors:
        colors = [{"id": "default", "en": "Standard", "ka": "სტანდარტული", "hex": "#8A8F98"}]

    # The site exposes which memory tiers exist but not what each one costs, so
    # every tier carries a zero delta rather than an invented surcharge.
    storage = [{"size": m, "delta": 0} for m in p["memory"]] or [{"size": "—", "delta": 0}]

    stock = {"in": 12, "last": 1, "out": 0}.get(p["stock"], 6)
    cond = "demo" if p["conditions"] == ["DEMO"] else "new"

    badge = None
    if p["oldPrice"] and p["price"] and p["oldPrice"] > p["price"]:
        badge = "sale"
    elif cond == "demo":
        badge = "demo"

    image = p.get("image")
    if image:
        image = image.replace("demo/", "", 1)

    return {
        "id": slugify(name, pid), "sku": sku(name, pid), "category": cat,
        "group": p.get("group"), "groups": [p["group"]] if p.get("group") else [],
        "device": device_for(cat, p.get("group"), name),
        "image": image, "sourceId": pid, "name": name,
        "price": p["price"], "oldPrice": p["oldPrice"] or None,
        "condition": cond, "badge": badge, "stock": stock,
        "storage": storage, "colors": colors,
    }


def emit(products):
    out = []
    for p in products:
        lines = [
            "  {",
            f"    id: {js_str(p['id'])}, sku: {js_str(p['sku'])}, category: {js_str(p['category'])}, device: {js_str(p['device'])},",
        ]
        if p["groups"]:
            lines.append(f"    group: {js_str(p['groups'][0])},")
            if len(p["groups"]) > 1:
                lines.append("    groups: [" + ", ".join(js_str(g) for g in p["groups"]) + "],")
        if p["image"]:
            lines.append(f"    image: {js_str(p['image'])},")
        lines += [
            f"    sourceId: {js_str(p['sourceId'])},",
            f"    name: {js_str(p['name'])},",
            f"    price: {p['price']}, oldPrice: {p['oldPrice'] if p['oldPrice'] else 'null'}, "
            f"condition: {js_str(p['condition'])}, badge: {js_str(p['badge']) if p['badge'] else 'null'}, stock: {p['stock']},",
            "    storage: [" + ", ".join(
                "{ size: %s, delta: %d }" % (js_str(s["size"]), s["delta"]) for s in p["storage"]) + "],",
            "    colors: [" + ", ".join(
                "{ id: %s, en: %s, ka: %s, hex: %s }" % (
                    js_str(c["id"]), js_str(c["en"]), js_str(c["ka"]), js_str(c["hex"]))
                for c in p["colors"]) + "],",
            "  },",
        ]
        out.append("\n".join(lines))
    return "\n".join(out)


def main():
    data = json.load(open("tools/catalogue.json", encoding="utf-8"))
    raw = [p for p in data["products"] if p.get("price")]

    # The live site lists some products under several accessory groups as
    # separate rows with their own ids — AirPods Max sits under both Headphones
    # and Made by Apple. Those are one product to a shopper, so they collapse
    # into one entry that carries every group it belongs to, which keeps it
    # findable under each filter without showing it twice in the grid.
    merged = {}
    for p in sorted(raw, key=lambda x: (x["category"] != "iphone", -x["price"])):
        b = build_product(p)
        key = (b["name"].strip().lower(), b["price"])
        if key in merged:
            for g in b["groups"]:
                if g not in merged[key]["groups"]:
                    merged[key]["groups"].append(g)
            # prefer an entry that actually has a photo
            if not merged[key]["image"] and b["image"]:
                merged[key]["image"] = b["image"]
            continue
        merged[key] = b
    products = list(merged.values())

    # a handful of hero products for the homepage rail
    for p in products[:8]:
        p["featured"] = True

    seed = Path("demo/js/seed.js").read_text(encoding="utf-8")
    block = emit(products)
    new = re.sub(r"export const PRODUCTS = \[.*?\n\];",
                 "export const PRODUCTS = [\n" + block + "\n];",
                 seed, count=1, flags=re.S)
    assert new != seed, "PRODUCTS block not replaced"

    # featured flags, applied after the block is built
    for p in products[:8]:
        new = new.replace(f"    id: '{p['id']}', sku:", f"    id: '{p['id']}', featured: true, sku:", 1)

    Path("demo/js/seed.js").write_text(new, encoding="utf-8")

    by_cat = {}
    for p in products:
        by_cat[p["category"]] = by_cat.get(p["category"], 0) + 1
    print(f"{len(products)} products written to demo/js/seed.js")
    for c, n in sorted(by_cat.items(), key=lambda kv: -kv[1]):
        print(f"  {c:14} {n}")
    print(f"  with image:   {sum(1 for p in products if p['image'])}")


if __name__ == "__main__":
    main()
