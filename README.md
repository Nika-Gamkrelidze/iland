# iLand — rebrand and site rebuild

> **Branch `fluid`.** This branch adds an interactive WebGL fluid background and
> scroll choreography on top of the design on `main`. `main` is the calm version
> and stays as it is — `git checkout main` to compare.

## The fluid version, in one paragraph

The page background is a live GPU fluid simulation. Drag anywhere and you push
the ink. As you scroll, product cards fall in from above, and the moment each one
lands it displaces the ground — a plume of brand colour flushes up out of the
contact line. Everything degrades: without WebGL, without a float render target,
in light mode, or with `prefers-reduced-motion`, you get the `main` design back
with no dangling references.

| File | What it is |
| --- | --- |
| [demo/js/fluid.js](demo/js/fluid.js) | The solver. Stable-fluids, ~10 GPU passes per frame, `plume()` for impacts. |
| [demo/js/fx.js](demo/js/fx.js) | The choreography. Observer → fall → `animationend` → splash. |
| [demo/css/fluid.css](demo/css/fluid.css) | The design layer. Glass surfaces and text scrims, all scoped to `body.has-fluid`. |
| [demo/fluid-test.html](demo/fluid-test.html) | Solver harness — drag, `plume()`, `seed()`, and a pixel probe. |

Open the harness at <http://localhost:4321/demo/fluid-test.html> to see the sim on
its own.

`window.iLand` exposes `{ fluid, choreo }` in the console — `iLand.fluid.plume(x, y)`
fires a splash anywhere, and `iLand.fluid.stats()` reports resolution and queue depth.

### Why this solver and not a library

PavelDoGreat's WebGL-Fluid-Simulation is MIT and excellent, and the honest
argument for vendoring it is that a hand-written ping-pong pipeline fails in the
"looks slightly wrong" direction. It was rejected anyway for one reason: the
choreography has to drive the fluid. `plumeUnder(rect)` needs to deposit a line
source across a card's bottom edge with velocity fanned out from the centre and a
second beat four frames later. That is not a parameter on someone else's `splat()`,
and adapting an IIFE with a bundled GUI into an ES module is most of the work of
writing the solver. So the pipeline follows the same reference the library does
(Stam 1999, GPU Gems 38) and is verified against a pixel probe rather than by eye.



A demo rebuild of [iland.ge](https://iland.ge) — Apple sales and service, Vake, Tbilisi —
together with a brandbook and an AI logo-generation prompt pack.

Everything here is dependency-free: vanilla ES modules, modern CSS, zero frameworks,
zero build step, zero image assets. Every product picture on the site is drawn as
parametric SVG that recolours when the shopper picks a different finish.

---

## Run it

From the project root:

```bash
python3 -m http.server 4321
```

A server is required for the demo — it uses ES modules, which browsers refuse to load over
`file://`. One server covers everything:

| What | Where |
| --- | --- |
| Storefront | <http://localhost:4321/demo/index.html> |
| Admin / CMS | <http://localhost:4321/demo/admin.html> |
| Brandbook | <http://localhost:4321/brand/brandbook.html> — or open `brand/brandbook.html` directly, it is self-contained |
| Logo prompts | `brand/logo-prompt.md` |

**The thing to try:** open the storefront and the admin side by side in two tabs.
Change a price, flip a sale on, or reorder the hero banners in admin — the storefront
updates live, without a reload. The CMS writes to `localStorage` and the storefront
listens for the cross-tab `storage` event.

---

## What was wrong with the old site

These are not stylistic complaints — they were live in production:

- The hero headline was **pixels inside a JPEG**. Untranslatable, invisible to search,
  not responsive, and unreadable to a screen reader.
- The literal placeholder string **`dfdfdf`** was shipped on the About and Service pages.
- Image URLs were doubled: `https://https://iland.ge//wp-content/themes/applecity/…`
- The social links pointed at **a different company** (chvenebi.ge).
- Every accessory card showed a struck-through **`0₾`** as its "old price".
- A sitewide banner admitted the site was **running in test mode**.
- The logo was a **184×55 raster PNG** of a hairline palm tree — no vector, no
  monochrome variant, and strokes that disappear at small sizes.
- Three unrelated typefaces (firago, sfproLight, Poppins) on Bootstrap 4.3 + jQuery 3.4.

---

## The brand: "Horizon Line"

Chosen by a four-way judge panel over three alternatives, then grafted with the
runner-up's strongest idea.

> **Georgia's Apple island** — one curated shelf, one honest price with განვადება shown
> up front, and the same people who sell it are the people who repair it.

**Everything Apple, on one island.** · **ყველაფერი Apple — ერთ კუნძულზე**
**One island. Published numbers.** · **ერთი კუნძული. გამოქვეყნებული ციფრები.**

The market gap it attacks: iSpace, iSTYLE and iStore are visually interchangeable
greyscale apple.com clones; Alta, Zoommer and Extra are loud discount marketplaces.
**Nobody in Georgia publishes repair prices at all** — iSpace's service page is a bare
navigation hub with no prices and no turnaround times. So iLand publishes its numbers:
prices, monthly instalments, repair costs, turnaround hours, warranty months, stock counts.

---

## Layout

```
brand/
  brandbook.html      self-contained brandbook — email it as one file
  logo-prompt.md      copy-paste prompts for AI logo generators
demo/
  index.html          storefront shell
  admin.html          CMS panel
  css/
    tokens.css        every design token + the :lang(ka) typography rules
    app.css           storefront components
  js/
    seed.js           factory catalogue — real products, real GEL prices
    store.js          state layer: localStorage, pricing, cart, i18n helpers
    devices.js        parametric SVG device renderer
    i18n.js           every UI string, in ka / en / ru
    app.js            router + views + interactions
```

---

## Typography — read this before changing anything

The site sets Georgian Mkhedruli next to Latin. That constrains the CSS in ways that
are easy to get wrong and hard to notice if you don't read Georgian. The rules are
enforced in `demo/css/tokens.css`:

1. **Mkhedruli is unicameral — there is no uppercase.** `text-transform: uppercase` is
   the single most common way Georgian sites look broken. Casing is scoped to
   `:lang(en)` and `:lang(ru)` only.
2. **No italics.** Noto ships no Georgian italic, so the browser synthesises a sheared
   Mkhedruli that native readers see as broken. Emphasis uses weight 600.
3. **No negative letter-spacing.** It closes the round counters of ო ფ ღ ძ. Latin
   display takes −0.038em; Georgian display takes 0.
4. **More size and more leading.** Georgian's body height sits between Latin x-height
   and cap-height, so it reads smaller at the same `font-size` (+5%), and its ascenders
   (ბ ზ ფ ჰ ლ) and descenders (გ ყ ც ძ ჭ ჯ ღ) collide at Latin leading — body 1.65,
   display 1.18.
5. **The lari sign ₾ is U+20BE and lives in the `latin-ext` subset, not `georgian`.**
   Subset it away and every price on the site silently falls back to a system font.
6. **Prices use `tabular-nums lining-nums`.** Georgian has no digits of its own and uses
   Western Arabic numerals.

Typeface: **Noto Sans Georgian** (variable 100–900, SIL OFL) — the only free variable
face that sets Mkhedruli and Latin from one design with a real heavy display weight.
**Noto Sans** carries Russian, because Noto Sans Georgian ships `cyrillic-ext` but not
base Cyrillic. **JetBrains Mono** is for SKUs and spec values only, where Georgian never
appears.

---

## Notes and limitations

- The catalogue is seeded with **real product names and real GEL price points observed on
  iland.ge**, but stock counts, ratings, review counts and orders are invented demo data.
- **Set your real social handles before launch.** The old site's Facebook, Instagram and YouTube
  links pointed at a different company (chvenebi.ge). I replaced them in `demo/js/seed.js` with
  `iland.ge` handles as placeholders — I have not verified those accounts exist.
- The instalment partners (TBC 0%, Bank of Georgia 0%, Credo 2%) and the ~100₾ online
  instalment floor reflect Georgian market norms; the calculator is indicative and is
  labelled as such. It is not wired to any bank API.
- Checkout, accounts and payments are not implemented — this is a front-end demo.
- The logo in the demo is a working implementation of the agreed mark. `brand/logo-prompt.md`
  explains how to generate final artwork, and why AI logo output should be redrawn by
  hand before trademark registration.
