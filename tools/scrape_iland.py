#!/usr/bin/env python3
"""
Crawl the live iland.ge catalogue and emit structured JSON + product images.

This exists because the site has no export and no API. It is deliberately a
readable scraper rather than a clever one: the markup is hand-written PHP with
two different link formats and inconsistent price blocks, so every extraction is
defensive and anything it cannot parse is reported rather than guessed.

  python3 tools/scrape_iland.py --out demo/assets/products --json tools/catalogue.json

Politeness: one request at a time with a delay, and an on-disk cache so re-runs
during development do not hit the client's production server again.
"""

import argparse, html, json, os, re, ssl, sys, time, urllib.parse, urllib.request
from pathlib import Path

BASE = "https://iland.ge"
UA = ("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
      "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36")

CATEGORIES = ["iphone", "ipad", "mac", "watch", "TV", "gifts"]
ACCESSORY_SUBS = ["made-by-apple", "chargers", "headphones", "Speakers", "Holders",
                  "Mice", "AirTag", "Protectors", "Software", "Games", "car"]

# the site's accessory slug -> the group label used in our catalogue
ACC_GROUP = {
    "made-by-apple": "Made by Apple", "chargers": "Chargers & Cables",
    "headphones": "Headphones", "Speakers": "Home & Speakers",
    "Holders": "Holders & Vlog", "Mice": "Mice & Keyboard",
    "AirTag": "AirTag & Accessories", "Protectors": "Screen Protectors",
    "Software": "Software", "Games": "Games for Mac", "car": "Car Gadgets",
}

CTX = ssl.create_default_context()
CTX.check_hostname = False
CTX.verify_mode = ssl.CERT_NONE

CACHE = Path(".scrape-cache")
DELAY = 0.25


def get(url, binary=False, use_cache=True):
    """Fetch a URL, caching to disk so repeat runs don't hammer the server."""
    CACHE.mkdir(exist_ok=True)
    key = CACHE / (re.sub(r"[^a-zA-Z0-9]+", "_", url)[-150:] + (".bin" if binary else ".html"))
    if use_cache and key.exists():
        return key.read_bytes() if binary else key.read_text(encoding="utf-8", errors="replace")
    time.sleep(DELAY)
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Referer": BASE + "/"})
    with urllib.request.urlopen(req, timeout=30, context=CTX) as r:
        data = r.read()
    if binary:
        key.write_bytes(data)
        return data
    text = data.decode("utf-8", errors="replace")
    key.write_text(text, encoding="utf-8")
    return text


# Product detail pages only render on the THREE-segment URL. The short
# /ka/product/<id> form returns an empty shell with no name and no price, so the
# full path has to be captured from the listing rather than reconstructed.
LINK_RE = re.compile(r'href="/?(ka/product/[^"/]+/[^"/]+/(\d+))"')


def links_on(page):
    """(path, id) for every product linked from a listing page."""
    return {(m.group(1), m.group(2)) for m in LINK_RE.finditer(page)}


def discover():
    """Every product on the site: id -> {path, category, group}."""
    found = {}

    for cat in CATEGORIES:
        try:
            page = get(f"{BASE}/ka/product/{cat}")
        except Exception as e:
            print(f"  ! category {cat}: {e}", file=sys.stderr)
            continue
        got = links_on(page)
        for path, pid in got:
            found.setdefault(pid, {"path": path, "category": cat.lower(), "group": None})
        print(f"  {cat:12} {len(got):>3} products")

    for sub in ACCESSORY_SUBS:
        seen_here = set()
        for page_no in range(0, 12):          # stop as soon as a page adds nothing new
            url = f"{BASE}/ka/products/accessories/{sub}?page={page_no}&from=&to=&key="
            try:
                page = get(url)
            except Exception:
                break
            got = links_on(page)
            new = {(p, i) for p, i in got if i not in seen_here}
            if not new:
                break
            for path, pid in new:
                seen_here.add(pid)
                found.setdefault(pid, {"path": path, "category": "accessories",
                                       "group": ACC_GROUP.get(sub, sub)})
        print(f"  {sub:12} {len(seen_here):>3} accessories")

    return found


PRICE_RE = re.compile(r"([\d,]+)\s*₾")


def text_of(page):
    t = re.sub(r"<(script|style)[^>]*>.*?</\1>", "", page, flags=re.S | re.I)
    t = html.unescape(re.sub(r"<[^>]+>", "\n", t))
    return [l.strip() for l in t.split("\n") if l.strip()]


def parse_product(pid, meta):
    """Pull one product page apart. Returns a dict, or None if it isn't a product."""
    url = f"{BASE}/{meta['path']}"
    try:
        page = get(url)
    except Exception as e:
        return {"id": pid, "error": str(e)[:80]}

    name = None
    m = re.search(r"<title>([^<]+)</title>", page)
    if m:
        name = html.unescape(m.group(1)).strip()
    if not name or name.lower().startswith("iland"):
        lines = text_of(page)
        # the breadcrumb ends with the numeric id, and the name follows it
        for n, l in enumerate(lines):
            if l == str(pid) and n + 1 < len(lines):
                name = lines[n + 1]
                break
    if not name:
        return {"id": pid, "error": "no name"}

    # The price block is marked with class "...price my-4 PRI" and carries d="<id>".
    # Two figures follow it: the live price then the struck-through one.
    prices = []
    blk = re.search(r'price[^"]*my-4[^"]*PRI"[^>]*d="%s"(.{0,900})' % pid, page, re.S)
    if blk:
        prices = [int(x.replace(",", "")) for x in PRICE_RE.findall(blk.group(1))]
    if not prices:
        prices = [int(x.replace(",", "")) for x in PRICE_RE.findall(page)]
    prices = [p for p in prices if p > 0]
    price = prices[0] if prices else 0
    old = next((p for p in prices[1:] if p > price), 0)

    # Product shots appear as <img src>, as <a href>, and — on accessory cards —
    # inside a CSS background:url(). Accessories also live under a differently
    # spelled upload folder ("Accesssories", with three s, as on the server).
    imgs  = re.findall(r'src="(https://iland\.ge/admin/uploads/[^"]+)"', page)
    imgs += re.findall(r'href="(https://iland\.ge/admin/uploads/[^"]+)"', page)
    imgs += re.findall(r"url\('(https://iland\.ge/admin/uploads/[^']+)'\)", page)
    imgs += re.findall(r'url\("?(https://iland\.ge/admin/uploads/[^")]+)"?\)', page)
    seen, images = set(), []
    for u in imgs:
        if u not in seen and re.search(r"\.(jpe?g|png|webp)$", u, re.I):
            seen.add(u)
            images.append(u)

    memory = sorted(set(re.findall(r"memory=([0-9]+(?:GB|TB))", page)),
                    key=lambda s: (s.endswith("TB"), int(re.sub(r"\D", "", s))))
    colors = sorted(set(c.lower() for c in re.findall(r"color=([A-Za-z][A-Za-z\-]{1,20})", page)))
    conds = sorted(set(re.findall(r"conditions=(New|DEMO)", page)))

    lines = text_of(page)
    stock = None
    for l in lines:
        if "მარაგშია" in l: stock = "in"; break
        if "ბოლო ცალია" in l: stock = "last"; break
        if "არ არის" in l: stock = "out"; break

    return {
        "id": pid, "url": url,
        "name": name, "category": meta["category"], "group": meta["group"],
        "price": price, "oldPrice": old,
        "memory": memory, "colors": colors, "conditions": conds,
        "stock": stock, "images": images[:6],
    }


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", default="demo/assets/products")
    ap.add_argument("--json", default="tools/catalogue.json")
    ap.add_argument("--max-bytes", type=int, default=900_000)
    ap.add_argument("--no-images", action="store_true")
    args = ap.parse_args()

    print("discovering products…")
    found = discover()
    print(f"\n{len(found)} unique product ids\n")

    print("parsing product pages…")
    products, failed = [], []
    for n, (pid, meta) in enumerate(sorted(found.items(), key=lambda kv: int(kv[0])), 1):
        p = parse_product(pid, meta)
        if p.get("error") or not p.get("price"):
            failed.append({"id": pid, "why": p.get("error") or "no price"})
            if not p.get("error"):
                products.append(p)          # keep it; price 0 is still information
        else:
            products.append(p)
        if n % 20 == 0:
            print(f"  {n}/{len(found)}")

    outdir = Path(args.out)
    if not args.no_images:
        outdir.mkdir(parents=True, exist_ok=True)
        print("\ndownloading images…")
        for p in products:
            if not p.get("images"):
                continue
            url = p["images"][0]
            ext = ".png" if url.lower().endswith(".png") else ".jpg"
            dest = outdir / f"p{p['id']}{ext}"
            if dest.exists():
                p["image"] = str(dest); continue
            try:
                data = get(url, binary=True)
                if len(data) < 800 or len(data) > args.max_bytes:
                    p["imageSkipped"] = f"{len(data)}b"; continue
                if not (data[:3] == b"\xff\xd8\xff" or data[:8] == b"\x89PNG\r\n\x1a\n"):
                    p["imageSkipped"] = "not an image"; continue
                dest.write_bytes(data)
                p["image"] = str(dest)
            except Exception as e:
                p["imageSkipped"] = str(e)[:60]

    Path(args.json).parent.mkdir(parents=True, exist_ok=True)
    Path(args.json).write_text(json.dumps(
        {"scrapedFrom": BASE, "count": len(products), "products": products, "failed": failed},
        ensure_ascii=False, indent=1), encoding="utf-8")

    withimg = sum(1 for p in products if p.get("image"))
    print(f"\n{len(products)} products -> {args.json}")
    print(f"{withimg} images -> {args.out}")
    if failed:
        print(f"{len(failed)} needed attention:")
        for f in failed[:12]:
            print(f"   {f['id']}: {f['why']}")


if __name__ == "__main__":
    main()
