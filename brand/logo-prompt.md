# iLand — AI logo-generation prompt pack

**Direction:** Horizon Line (with the Caliper graft)
**Mark:** disc above a horizon, with its own reflection beneath
**For:** Midjourney · DALL·E 3 / ChatGPT · Ideogram · Recraft · Adobe Firefly · SVG-authoring LLMs

---

## 0. Read this first — the honest constraint

**AI image generators cannot hit exact geometry, and this mark is defined by exact geometry.**

Midjourney, DALL·E, Firefly and friends do not draw with a compass. They will give you a circle that
is slightly ovoid, a "horizon" bar that tapers, stroke weights that drift between elements, and — most
often — a rounded-square badge you never asked for. They also cannot reliably produce true vector
output, and none of them can be trusted with a specific hex value or a specific ratio.

So use them for what they are good at:

| Goal | Tool | Reliability |
| --- | --- | --- |
| **The mark exactly as specified** | The SVG-authoring prompt (§3.5) | High — it is arithmetic, not imagination |
| Exploring alternative concepts before committing | Midjourney / DALL·E / Ideogram | Good |
| Near-vector output you can clean up in Illustrator | Recraft / Firefly | Medium |
| Seeing the wordmark set next to the mark | Ideogram | Medium (it is the only one that spells reliably) |
| Anything you intend to trademark | None of them — see §7.3 | — |

**Recommended order of work:** run §3.5 first and you have the specified mark in minutes. Then run
§2–§3.4 and §4 to generate 40–80 alternatives, score them against §6, and take anything genuinely
better back to a designer. Do not expect an image generator to beat the spec; expect it to surprise you.

---

## 1. The brief

### What iLand is

iLand (Georgian: **აილენდი**) is an Apple reseller and repair service in Tbilisi, Vake — Arakishvili St. 2.
Legal entity შპს აიფოუნს.ჯი, Tax ID 204571604. It sells iPhone, iPad, Mac, Watch, TV, accessories and
gift cards, and repairs all of them in the same building. Three languages: ka / en / ru. Currency ₾ (GEL).

The name is the strategy: **an island**. Every Georgian competitor is either a greyscale apple.com clone
(iSpace, iSTYLE, iStore) or a loud discount marketplace (Zoommer's cheap violet, Alta's red big-box grid).
iLand is the one calm, curated place — one shelf, chosen on purpose — and the one that **publishes its
numbers**: prices, monthly განვადება figures, repair costs, turnaround hours, warranty months, stock counts.
Nobody else in Georgia publishes repair prices at all.

- **Tagline EN:** Everything Apple, on one island.
- **Tagline KA:** ყველაფერი Apple — ერთ კუნძულზე
- **Proof line EN:** One island. Published numbers.
- **Proof line KA:** ერთი კუნძული. გამოქვეყნებული ციფრები.

### What the mark must express

1. **Island / horizon** — a sun setting into the sea, seen from the water. Calm, distant, deliberate.
2. **The letter i** — the same shape must read as the tittle-and-stem of a lowercase "i", so the mark
   is a monogram, not a picture.
3. **Precision** — a repair shop that publishes turnaround hours in hours. Constructed, measurable,
   drawn on a grid. Not organic, not hand-drawn, not "friendly".
4. **Calm** — no motion lines, no urgency, no sparkle. The rest of the category is shouting.

### The hard constraint — this is the one that killed the old mark

**The mark must survive at 16px and in a single colour.**

The old iLand logo was a **184×55px raster PNG of a palm tree** with hairline strokes. It had no vector
source, no monochrome variant, no defined clear space. Below about 40px the fronds dissolved into grey
mush; on a single-colour stamp or embroidery it was unreproducible; on any dark background it carried a
white box. Every element of the new mark is therefore **solid geometry — one circle and two rounded bars,
all at comparable weight**. Nothing in it may be thinner than roughly 6% of the mark's width.

Test every candidate at 16×16, in pure black on white, and in pure white knocked out of black,
**before** you look at it large and in colour.

### Palette (verbatim — do not let a generator "improve" these)

| Token | Hex | Role in the mark |
| --- | --- | --- |
| `--lume` | `#2FD6B4` | The disc. Primary accent. |
| `--abyss` | `#04070C` | Page base / the dark ground behind the mark. |
| Text on dark | `#EEF3F8` | Horizon bar and reflection bar on dark. |
| `--ink` | `#0B1119` | Horizon bar and reflection bar on light. |
| `--sand` | `#FBFAF7` | Light-mode ground. |
| `--lume-700` | `#14957C` | The teal for **text** on light backgrounds (AA contrast). |
| `--sun` | `#FF9F45` | Secondary. Sale/promo only. **Never in the logo.** |

Wordmark: **"iLand"** — "i" in text colour, "Land" in `--lume`, weight 750, letter-spacing −0.03em,
set in Noto Sans Georgian (variable, SIL OFL).

---

## 2. THE PRIMARY PROMPT

One copy-paste block. Works as-is in DALL·E 3, Firefly, Recraft, Leonardo, Flux, and as the body of
the Midjourney prompt in §3.1.

```
A flat vector logo mark for iLand, an Apple store and repair service. The mark is exactly three
elements, nothing else: an open circle outline sitting above centre; below it a
single straight horizontal bar, wider than the circle, with rounded ends; and below that a second,
shorter horizontal bar, also rounded, drawn at 35 percent opacity. Read together they are a sun
setting into the sea with its reflection on the water, an island seen from a boat, and at the same
time the dot and stem of a lowercase i. Proportions: the circle's diameter is about half the
mark's width, the long bar spans the full width, the short bar about forty percent of it. The circle
is bright teal #2FD6B4 on a near-black #04070C background; both bars are off-white #EEF3F8. Uniform
stroke weight throughout, about 7 percent of the mark's width, rounded caps, no fill inside the
circle. Geometric, minimal, precise, calm. Centred on a plain flat background. No scene, no
perspective, no texture, no shading, no gradient, no text.
```

*(≈170 words. If a tool truncates, cut the sentence beginning "Read together" — the geometry sentence
is the load-bearing one.)*

---

## 3. Platform-tuned variants

### 3.1 Midjourney

Midjourney ignores hex codes and adores atmosphere, so the job here is to fight its instincts:
`--style raw` kills the illustrative gloss, `--no` does more work than the prompt body, and low
`--stylize` keeps it literal. Colours are named in words as well as hex because it only reads the words.

```
flat vector logo mark, minimal geometric monogram :: an open teal circle outline above a long
horizontal bar with rounded ends, and a shorter faded horizontal bar beneath it as a reflection ::
reads as a sun setting into the sea and as the dot and stem of a lowercase letter i :: bright
mint-teal #2FD6B4 circle, off-white bars, near-black background #04070C :: uniform thick stroke
weight, rounded line caps, no fill, solid geometry, centred, single mark on plain flat background,
brand identity, vector, high contrast, legible at very small size --style raw --ar 1:1 --v 7
--stylize 100 --no text, letters, words, typography, palm tree, beach, sand, waves, boat, sunset
rays, sun rays, gradient, mesh gradient, 3d, bevel, emboss, gloss, glossy highlight, drop shadow,
shading, texture, grain, photo, photorealistic, realistic, swoosh, ribbon, globe, apple, fruit,
leaf, circuit board, mockup, multiple variants, grid of logos, watermark, signature, frame, border
```

**Variations to run:**
- Swap `--stylize 100` for `--stylize 0` for the most literal reading.
- Add `--chaos 20` on a second run to widen the spread once you have a good seed.
- Add `--ar 1:1 --tile` never — this is not a pattern.
- Use `--sref` with your best §3.5 SVG rendered to PNG to pull Midjourney toward the real mark.

> Midjourney will still produce a grid of four *scenes* about half the time. Discard those; do not
> try to prompt-engineer your way out of it. Take the two-in-four that are marks.

### 3.2 DALL·E 3 / ChatGPT

DALL·E rewrites your prompt before drawing, so state the intent conversationally and repeat the
anti-photorealism instruction in more than one place — the rewriter drops single mentions.

```
I need a logo mark — a flat, 2D, vector-style graphic symbol, not an illustration and not a
photograph. Please draw it as if it were an SVG icon exported from Illustrator: hard flat colour,
no lighting, no depth, no perspective, no rendering.

The symbol has exactly three parts:
1. An open circle (outline only, nothing inside it) positioned in the upper half of the square.
2. A single straight horizontal bar below the circle, wider than the circle, with rounded ends.
3. A second, shorter horizontal bar below the first, also with rounded ends, drawn faintly at about
   a third opacity — it is the first bar's reflection in water.

All three parts use the same stroke thickness, roughly 7% of the image width, so the mark stays
readable when shrunk to 16 pixels.

The idea it should convey: a sun setting into the sea, an island seen from the water — and
simultaneously the dot and the stem of a lowercase letter "i". Calm and precise, not tropical and
not romantic.

Colours: the circle is bright teal (#2FD6B4). Both bars are off-white (#EEF3F8). The background is a
flat near-black (#04070C) with nothing else on it.

Important: do not add a palm tree, a beach, a boat, waves, sun rays, sparkles, a gradient, a
3D bevel, a glossy highlight, a drop shadow, a badge or a frame. Do not add any text, letters or
numbers. Do not make it look like the Apple logo or any bitten-fruit shape. One single centred mark
on a plain background — not a presentation, not a mockup, not a grid of options.
```

### 3.3 Ideogram — the version that sets the wordmark

Ideogram is the only mainstream generator that renders type reliably, so this is where you preview
the **lockup**. Quote the text so it stays intact, and keep the word count down — Ideogram's spelling
degrades as prompts get long.

```
Horizontal logo lockup on a near-black background. On the left, a flat vector mark: a bright teal
open circle above a long white horizontal bar with rounded ends, and a shorter faded bar below it as
a reflection — a sun setting into the sea. On the right, the wordmark "iLand" in a clean geometric
humanist sans serif, heavy weight, tight spacing, all on one line: the "i" in white and "Land" in
the same bright teal as the circle. Flat 2D vector, uniform thick strokes, rounded caps, no
gradient, no 3D, no shadow, no palm tree, no frame. Minimal tech brand identity.
```

Ideogram settings: **Design** style, aspect **16:9** for the lockup (**1:1** for the mark alone),
magic prompt **OFF** — it rewrites the wordmark into nonsense.

Ideogram negative prompt field:
```
palm tree, beach, sunset rays, gradient, 3d, bevel, gloss, drop shadow, texture, photo, swoosh,
globe, apple, fruit, leaf, circuit, misspelled text, extra letters, serif, italic, frame, border,
mockup, watermark
```

Also run this second Ideogram prompt for the **stacked** lockup, which is what you need for the app
icon and the shopfront:

```
Square logo lockup, near-black background. Centred flat vector mark at the top: a bright teal open
circle above a white horizontal bar with rounded ends, and a shorter faded bar below as its
reflection. Directly beneath, centred, the single word "iLand" in a heavy geometric sans serif, "i"
white and "Land" bright teal. Flat 2D vector, thick uniform strokes, no gradient, no 3D, no shadow.
```

### 3.4 Recraft / Adobe Firefly — true vector output

These two actually emit vectors (Recraft: real SVG; Firefly: "Vector" content type, editable in
Illustrator). Both respond to *style keywords* more than to description, so lead with the style.

**Recraft** — set Style to **Vector Illustration → Icon** (or *Line Art*), then:

```
icon, flat vector, single colour shapes, geometric construction, thick uniform stroke, rounded line
caps: an open circle outline centred in the upper half, a long horizontal rounded bar beneath it
spanning the full width, and a shorter horizontal rounded bar below that at reduced opacity. Sun
above a horizon with its reflection; also reads as a lowercase letter i. Teal circle #2FD6B4, off
white bars #EEF3F8, near black background #04070C. No text, no palm tree, no gradient, no shadow, no
3D, no background scene, no frame.
```

Recraft settings: **Substyle: Line Art** or **Flat 2D**, **Colors:** pin `#2FD6B4`, `#EEF3F8`,
`#04070C` in the palette picker (Recraft honours pinned colours far better than hex in prose),
**Size 1:1**, then **Download → SVG** and open the result in Illustrator to check node counts.

**Adobe Firefly** — Content type **Vector**, Style **Graphic / Minimalist / Icon**:

```
Minimalist geometric logo icon: an open teal circle above a long white horizontal bar with rounded
ends, and a shorter faded white bar below it as a reflection in water. Flat vector, thick even line
weight, rounded caps, high contrast, dark background, no text, no gradient, no shading, no
three-dimensional effect, no palm tree, no beach.
```

Firefly "Avoid" / exclude field:
```
palm tree, beach, waves, boat, sun rays, gradient, 3d, bevel, gloss, shadow, texture, photo,
realistic, swoosh, globe, apple, fruit, circuit, text, letters, frame, badge, mockup
```

> Both tools will happily hand you an SVG with 400 nodes, clipping masks, and the "stroke" baked in
> as an outlined compound path. That is a *tracing*, not a construction. Treat it as a sketch and
> rebuild on the numbers in §3.5.

### 3.5 SVG-authoring prompt for an LLM — **the reliable path**

Paste this into Claude or GPT. It carries the real construction numbers, so the output is
reproducible and identical every time — which is the whole point of a logo.

```
You are an SVG author. Produce the iLand logo exactly to the following specification. Output raw
SVG only, no commentary, no <style> block, no external fonts, no filters, no gradients, no clipping
masks. Use only <svg>, <circle> and <path>. Use presentation attributes, not CSS.

CANVAS
  viewBox "0 0 40 40", fill="none", no width/height attributes (it must scale from CSS).

ELEMENT 1 — THE DISC (the sun / the tittle of the "i")
  <circle> cx=20 cy=16.5 r=9.5
  stroke = #2FD6B4   stroke-width = 2.6   stroke-linecap = round   fill = none
  transform = "rotate(-90 20 16.5)"   (puts the path's start point at 12 o'clock)

ELEMENT 2 — THE HORIZON (the stem of the "i" / the waterline)
  <path> d = "M5 29.5h30"
  stroke = #EEF3F8   stroke-width = 2.8   stroke-linecap = round

ELEMENT 3 — THE REFLECTION
  <path> d = "M12 34.5h16"
  stroke = #EEF3F8   stroke-width = 2.8   stroke-linecap = round   opacity = 0.35

Now give me, as separate complete SVG files, each fully self-contained:

A. MARK ON DARK — exactly the spec above, no background rect.
B. MARK ON LIGHT — identical, but elements 2 and 3 use #0B1119 and element 1 uses #14957C.
C. MONOCHROME — every element a single currentColor, element 3 still at opacity 0.35, so the mark
   inherits colour from its parent and can be stamped in one ink.
D. MONOCHROME FLAT — as C but element 3 at full opacity, for embroidery, foil, laser and any
   process that cannot render a tint. Compensate by shortening element 3 to "M13.5 34.5h13".
E. FAVICON 32 — viewBox "0 0 32 32", a background <rect width=32 height=32 rx=8 fill="#04070C">,
   circle cx=16 cy=13 r=5 stroke #2FD6B4 stroke-width 2.5, path "M6 20h20" stroke #2FD6B4
   stroke-width 2.5 stroke-linecap round. The reflection bar is DELIBERATELY OMITTED at this size
   because it closes up and reads as noise. Optimise it to fit in a data: URI.
F. HORIZONTAL LOCKUP — the mark from A at 34x34, then 0.6rem of space, then the wordmark "iLand" as
   live text: font-family "Noto Sans Georgian","Noto Sans",system-ui,sans-serif; font-weight 750;
   font-size 1.28rem; letter-spacing -0.03em; the "i" in #EEF3F8 and "Land" in #2FD6B4. Also give me
   a version with the wordmark converted to <path> outlines.
G. ANIMATED — as A, plus the signature motion: the disc draws itself once, anticlockwise from the
   top. Circumference is 2*pi*9.5 = 59.69, so use stroke-dasharray:59.7 and animate
   stroke-dashoffset from 59.7 to 0 over 1.5s with cubic-bezier(.16,1,.3,1) and a 0.15s delay,
   fill-mode forwards, played once. Wrap it in a prefers-reduced-motion query that sets
   stroke-dashoffset:0 and disables the animation — the resting state must never be invisible.

Then output, as a markdown table, the CLEAR SPACE and MINIMUM SIZE rules you derive: clear space on
all four sides equal to the disc radius (9.5 units = 23.75% of the canvas), minimum mark size 16px,
minimum lockup width 96px. Finally, confirm in one line that no element is thinner than 2.6 units
(6.5% of the canvas), which is the rule the previous hairline logo broke.
```

**Two known-good follow-ups to the same conversation:**

```
Now render each of those seven files as a data: URI I can paste straight into an <img> tag, and show
me A, C and E side by side at 16px, 32px and 64px in a single HTML preview page with a dark and a
light panel, so I can eyeball the small-size legibility.
```

```
Stress-test the mark: give me the same SVG (A) rendered at 12px, with 1px of Gaussian blur, in pure
black on pure white, and rotated 180 degrees. Tell me honestly which of those breaks it and why.
```

---

## 4. Three alternative concepts

Run these if the client wants options. Each is a full drop-in replacement for §2 — same tool tuning
applies. Score everything against §6 before falling in love.

### 4.1 Concept A — "Sundown": the disc bisected by the sea

The literal reading of the same idea: the sun is *half* below the waterline. Warmer and more
narrative than the primary; slightly weaker as an "i" monogram, and the half-disc is a busier shape
at 16px. Worth testing because it is unmistakably an island and unmistakably not a competitor.

```
A flat vector logo mark: a circle sitting on a horizontal line so that the line cuts it exactly
through the centre — the top half of the circle is a solid teal semicircle above the line, the
bottom half is drawn as three short horizontal rounded bars of decreasing length below the line,
suggesting the sun's reflection rippling on water. The horizontal line is long, straight, with
rounded ends, and extends well past the circle on both sides. Teal #2FD6B4 above, off-white #EEF3F8
line and ripples, near-black #04070C background. Uniform heavy stroke weight, rounded caps,
geometric, minimal, calm, centred, plain flat background. No palm tree, no beach, no sun rays, no
gradient, no 3D, no shadow, no text.
```

### 4.2 Concept B — "Contour i": the tittle is an island from above

A different vantage: instead of the island seen *from* the water, the island seen *from above* — a
survey contour. This is the most "published numbers" of the three: it looks like cartography and
measurement. Risk: contour rings are thin by nature, so it must be drawn at two rings maximum or it
fails the 16px test.

```
A flat vector logo mark shaped like a lowercase letter "i". The stem of the "i" is a single thick
vertical rounded bar. The tittle — the dot above it — is not a dot but a small island seen from
directly overhead: a solid teal irregular rounded blob, surrounded by exactly one concentric contour
ring at the same stroke weight, like a two-line topographic map. Only two elements in the tittle: the
solid landmass and one ring around it. Everything drawn at the same heavy uniform stroke weight with
rounded ends. Teal #2FD6B4 island and ring, off-white #EEF3F8 stem, near-black #04070C background.
Cartographic, precise, minimal, flat 2D vector. No extra contour lines, no map grid, no compass rose,
no palm tree, no gradient, no 3D, no shadow, no text.
```

### 4.3 Concept C — "Archipelago": three marks locking into an iL

The most distinctive and the most fragile. Three small island glyphs at different sizes, arranged so
their negative space forms an "i" and an "L". Reads beautifully at poster scale; likely dies at 16px —
which is exactly what the checklist in §6 is for.

```
A flat vector monogram made of three separate small marks arranged as an archipelago on a
near-black background. Each mark is a simple rounded shape sitting on its own short horizontal bar,
like a tiny island on the water. The three are different sizes and sit at different heights, and
they are positioned so that together their arrangement reads as the letters "i" and "L" locked
together: the small one is the tittle, the tall narrow one is the stem, the wide low one is the foot
of the L. Teal #2FD6B4 for the island shapes, off-white #EEF3F8 for the bars, generous even spacing.
Uniform heavy stroke weight, rounded caps, geometric, flat 2D vector, no perspective. No palm trees,
no waves, no gradient, no 3D, no shadow, no text, no frame.
```

---

## 5. Negative prompt — the exclusion list

The single highest-leverage block in this document. Paste it into whichever exclusion field the tool
offers; append it after `--no` in Midjourney; and for tools with no negative field, append the plain
list to the end of the prompt as "Do not include: …".

### 5.1 Universal negative string

```
palm tree, palm fronds, coconut tree, beach, sand, deck chair, parasol, tropical island, hammock,
postcard, travel poster, holiday, vacation, sunset with rays, sun rays, sunbeams, light rays,
lens flare, sparkle, starburst, glow, bloom, waves, surf, sailboat, boat, seagull, dolphin, compass
rose, treasure map, gradient, mesh gradient, colour gradient, ombre, 3d, three-dimensional, bevel,
emboss, extrude, isometric, glossy, gloss highlight, specular highlight, reflection highlight, web
2.0, glass, glassmorphism, chrome, metallic, drop shadow, long shadow, inner shadow, shading,
ambient occlusion, texture, grain, noise, paper texture, watercolour, brush stroke, hand drawn,
sketch, doodle, thin line, hairline, fine line, delicate stroke, varying line weight, tapered
stroke, swoosh, ribbon, curve flourish, wave flourish, globe, world map, planet, orbit, atom,
circuit board, circuit traces, motherboard, microchip, network nodes, tech grid, hexagon grid,
binary code, apple, bitten apple, fruit, leaf, apple logo, apple silhouette, smartphone, phone
outline, device outline, shield, badge, crest, laurel, ribbon banner, frame, border, rounded square
container, app icon container, text, letters, words, lettering, typography, wordmark, signature,
watermark, stock photo, photorealistic, realistic, render, mockup, business card mockup, grid of
logos, multiple variants, colour variations, presentation board
```

### 5.2 Why each family is excluded

| Excluded | Reason |
| --- | --- |
| **Palm trees, beaches, hammocks, parasols** | This is the failure mode of the *old* logo — a raster palm tree — and it makes an Apple reseller look like a travel agency. "Island" here is a positioning metaphor, not a destination. |
| **Sunset rays, flares, sparkles, glows** | Loud. The brand's whole differentiator is calm against Zoommer's shouting. Also unrenderable in one ink. |
| **Gradients and mesh gradients** | A logo that needs a gradient to read has failed the single-colour test. It also cannot be embroidered, stamped, engraved, or faxed. |
| **3D, bevel, emboss, gloss, glassmorphism, drop shadow** | Web 2.0 residue. Dates the brand to 2008 and destroys small-size legibility. |
| **Thin, hairline, tapered or varying strokes** | The precise, named cause of the old logo's death at small sizes. Non-negotiable. |
| **Swooshes, ribbons, flourishes** | Generic 1990s identity filler. Says nothing, distinguishes nothing. |
| **Globes, orbits, circuit boards, hex grids, binary** | Stock "tech" clichés. Every one of them is already in use by three Georgian IT companies. |
| **Apples, bitten fruit, leaves, apple silhouettes** | **Trade-dress risk.** iLand is an authorised-reseller-adjacent business; Apple polices apple-shaped marks aggressively in classes 9 and 35. A logo containing any fruit form is unusable and possibly actionable. |
| **Device outlines, phone silhouettes** | Also Apple trade dress, and it dates instantly with each hardware generation. |
| **Rounded-square containers, badges, shields, frames** | Generators add these compulsively. The mark must be a free-standing glyph; the container belongs to the OS, not to you. |
| **Text and lettering** (except in §3.3) | Generators misspell. The wordmark is set in Noto Sans Georgian, not drawn by an AI. |
| **Mockups, presentation boards, grids of variants** | You want one mark on a plain field, not a Behance case study you have to crop. |

---

## 6. Evaluation checklist

Score every candidate out of 2 (0 = fails, 1 = marginal, 2 = clean). **Anything scoring 0 on rows 1–5
is dead regardless of how good it looks large.** Total 30.

| # | Test | How to run it | Score |
| --- | --- | --- | --- |
| 1 | **Legible at 16px** | Export at 16×16 PNG. Can you still see three distinct elements? Is the circle still a circle? | ☐ |
| 2 | **Works in one colour** | Fill everything with pure black. Does it survive without the opacity trick? (If not, you need the flat mono variant from §3.5-D.) | ☐ |
| 3 | **Works knocked out on dark** | Pure white on `#04070C`. No white box, no halo, no clipping. | ☐ |
| 4 | **No gradient dependency** | Does any element need a gradient, glow or shadow to separate from its neighbour? It must not. | ☐ |
| 5 | **No trade-dress risk** | No apple, no bitten fruit, no leaf, no device silhouette, nothing that reads as Apple's mark. Also reverse-image-search it. | ☐ |
| 6 | **Distinct from iSpace / iSTYLE / iStore** | Put it in a row with their marks. Those are greyscale apple.com clones — is yours obviously not a fourth one? | ☐ |
| 7 | **Distinct from Zoommer / Alta** | Against Zoommer's violet and Alta's red big-box grid: does yours read as calm and curated rather than discount? | ☐ |
| 8 | **Does not read as a travel agency** | Show it to three people with no context and ask "what does this business sell?" If anyone says holidays, flights or hotels, it fails. | ☐ |
| 9 | **Reproduces in embroidery** | Simulate at 25mm wide with a 0.4mm minimum stitch. Do any two elements merge? Does the tinted reflection disappear? | ☐ |
| 10 | **Reproduces as a single-colour stamp** | 12mm rubber stamp, one ink, no halftone. Print it, ink it, look at it. | ☐ |
| 11 | **Reads as an "i"** | Cover the wordmark. Does anyone see a lowercase i? (This is the difference between a monogram and a picture of a sunset.) | ☐ |
| 12 | **Does not read as something else** | The circle-above-a-bar family also produces: an eye, a power button, a magnifying glass, a settings toggle, a loading spinner. Ask three people what they see first. | ☐ |
| 13 | **Survives the app icon** | Place inside a rounded square at 60×60 with iOS's 20% safe-area inset. Does the horizon bar get clipped? | ☐ |
| 14 | **Blur test** | 1px Gaussian at 32px. If it becomes an indistinct smear, the elements are too close together. | ☐ |
| 15 | **Sits beside the Georgian wordmark** | Set next to **აილენდი** at real size. Mkhedruli has no caps and a tall body — does the mark's optical weight still balance? | ☐ |

**Additional gates before you commit** (pass/fail, not scored):

- Search the mark on Sakpatenti's Georgian trade mark register and on WIPO Global Brand Database.
- Reverse-image-search it (Google Lens + TinEye). Generators reproduce training data more often than
  their marketing admits.
- Check it does not collide with an existing icon set (Feather, Lucide, Material) — a "sunrise" icon
  exists in all three and is very close to this mark. Yours must be distinguishable in proportion and
  weight, and you must never ship the icon-set version.

---

## 7. After-steps

### 7.1 Vectorising a raster result

If a generator gives you a PNG you want to keep:

1. **Do not auto-trace and ship.** Illustrator's Image Trace, Inkscape's Trace Bitmap, `potrace` and
   vectorizer.ai all produce outlined blobs with 200–600 nodes, wobbling edges, and no real circles.
   That is a tracing of a guess.
2. **Redraw it.** Place the PNG on a locked layer at 40×40, turn on a 1-unit grid, and rebuild it with
   the ellipse tool and the line tool. Every curve should be a true circle or a true arc; every bar a
   true horizontal. Total node count for this mark should be **under 20**.
3. **Keep strokes as strokes** in the master file, and produce an outlined copy separately. Strokes
   let you retune weight for small sizes; outlines are for handoff to printers who reflow type.
4. **Snap to whole and half units.** The spec numbers (20 / 16.5 / 9.5 / 2.6 / 2.8 / 29.5 / 34.5) are
   already grid-friendly. Do not let a trace drag them to 16.4873.
5. **Run it through SVGO** (`svgo --multipass`) but check the output — SVGO will happily convert your
   `<circle>` into a path and merge your transform, which makes the file smaller and the source
   unmaintainable. Keep a readable master and optimise only the shipped copies.

### 7.2 The file set to ask for

| File | Format | Notes |
| --- | --- | --- |
| `iland-mark.svg` | SVG, viewBox 0 0 40 40 | Master. Strokes as strokes, no width/height, no CSS. |
| `iland-mark-mono.svg` | SVG | `currentColor` throughout, reflection at 35% opacity. |
| `iland-mark-mono-flat.svg` | SVG | Single ink, no opacity — embroidery, foil, laser, stamp. |
| `iland-mark-light.svg` / `-dark.svg` | SVG | Fixed-colour copies for contexts that cannot inherit colour. |
| `iland-lockup-h.svg` / `iland-lockup-v.svg` | SVG | Horizontal and stacked. One live-text copy, one outlined copy. |
| `favicon.svg` | SVG | 32×32, reflection bar omitted (see §3.5-E), inline-able as a data: URI. |
| `favicon.ico` | ICO | 16 + 32 + 48 in one file, for legacy. |
| `apple-touch-icon.png` | PNG 180×180 | Opaque `#04070C` background — iOS does not honour transparency. |
| `icon-192.png`, `icon-512.png` | PNG | PWA manifest. Supply `maskable` versions with 20% safe-area padding. |
| `og-image.png` | PNG 1200×630 | Mark + wordmark, `#04070C` ground. |
| `avatar-1000.png` | PNG 1000×1000 | Social profiles. Centred, generous clear space. |
| `iland-mark.pdf` / `.eps` | Vector | For printers and sign-makers who will not take SVG. |
| `iland-mark.dst` | Embroidery | Digitised from the mono-flat SVG, not from the master. |
| Clear space + min size sheet | PDF | Clear space = disc radius (9.5u) on all four sides; mark min 16px; lockup min 96px wide. |

Also ask for: the **hex list** as swatches (ASE + JSON), the **animated** SVG/Lottie of the disc draw,
and a one-page **misuse sheet** (do not recolour, do not stretch, do not add effects, do not rotate,
do not place on a busy photo, do not reintroduce the palm tree).

### 7.3 Trademark reality — read before filing

**AI-generated logo output generally cannot be registered or protected as-is.**

- **Copyright:** the US Copyright Office has repeatedly held that material generated by AI without
  sufficient human authorship is not copyrightable, and several other offices take a similar line.
  A logo you cannot claim authorship of is a logo you cannot fully defend.
- **Trademark:** registrability is a separate question from authorship, and a mark's *use in commerce*
  is what earns protection — but registries and opponents can and do probe originality, and an
  AI-generated mark carries a real risk of near-duplicating something in the training data or an
  existing registration.
- **Therefore:** treat every AI output as **a sketch**. Have a human designer redraw the final mark
  from scratch on the geometry in §3.5, keep the working files and dated revisions as evidence of
  human authorship, and only then file.
- **Where to file:** Sakpatenti (საქპატენტი, Georgia's National Intellectual Property Center) for
  Georgia; WIPO Madrid Protocol if iLand ever exports. Classes 9 (devices/accessories), 35 (retail
  services) and 37 (repair services) are the relevant ones for this business.
- **Clear it first:** search Sakpatenti's register, WIPO Global Brand Database, and EUIPO TMview for
  conflicting figurative marks in those classes before spending on filing fees.
- **Apple specifically:** iLand resells Apple hardware. Keep the mark free of any apple, fruit, leaf,
  bite, or device silhouette — and keep the wordmark free of a leading lowercase "i" *rendered in
  Apple's style*. "iLand" as a word is fine; "iLand" set in San Francisco with an Apple-grey gradient
  is asking for a letter.

> None of this is legal advice. Have a Georgian IP attorney clear the mark before you file or before
> you put it on a shopfront.

---

## 8. One-minute recap

1. Run **§3.5** in Claude or GPT → you have the specified mark, exact, in seven variants, today.
2. Run **§2**, **§3.1–§3.4** and **§4** → 40–80 alternatives to explore, with **§5** pasted into every
   negative field.
3. Score everything with **§6**. Kill anything that fails rows 1–5.
4. Redraw the winner by hand on the §3.5 numbers, produce the **§7.2** file set, then clear and file
   per **§7.3**.
5. Never ship a hairline. That is what went wrong last time.
