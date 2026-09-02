# NORVA — demo build

**This is a demo. Nothing in it is real.**

Every company, price, product, order, customer and review you will see is
invented. NORVA (ka: ნორვა) is a fictional Apple reseller and repair workshop.
There is **no backend, no database and no external API** — not one request
leaves the page. The catalogue and the cart live in memory and nowhere else,
so **a refresh is the reset**: reload and you are back to the shipped
catalogue, whatever the last visitor did to it. Only language and theme are
written to `sessionStorage`, because resetting a viewer's own preferences on
every refresh would be hostile rather than clean. Two visitors never see each
other's changes, and nothing a visitor types is stored anywhere but on their
own machine.

The site is trilingual (ka / en / ru) and prices are shown in GEL (₾).

---

## Running it locally

There is no build step, no package manager, no dependencies. It is a plain
tree of HTML, CSS and ES modules, so it only needs a static file server —
opening `index.html` off the filesystem will *not* work, because ES modules
are blocked on `file://`.

```sh
python3 -m http.server 4321
```

Run that from the repository root, then open:

- storefront — <http://localhost:4321/demo/index.html>
- CMS — <http://localhost:4321/demo/admin.html>

On the deployed site those same two pages are served at `/` and `/admin`
(see *Deploying* below).

## File layout

```
vercel.json              routing, headers and cache policy for the deploy
demo/
  index.html             storefront shell
  admin.html             CMS shell
  404.html               unmatched paths
  robots.txt             disallow everything
  site.webmanifest       name, colours, standalone display
  css/
    tokens.css           palette, type scale, spacing — the design tokens
    app.css              component and layout styles
    fluid.css            the animated background canvas
    fonts.css            @font-face declarations for the self-hosted fonts
  js/
    app.js               storefront: hash router and view renderers
    admin.js             CMS
    store.js             the single source of state (in memory; see *State*)
    seed.js              the invented catalogue, orders and copy
    i18n.js              ka / en / ru strings and language switching
    devices.js           parametric SVG hardware archetypes (drawn, not photographed)
    fluid.js             background simulation
    fx.js                scroll and pointer effects
    contrast.js          per-glyph text contrast against the background
    demo.js              everything that makes this a demo (see below)
  assets/
    fonts/               self-hosted woff2 (see *Fonts*)
    products/           product artwork, SVG
```

## Routes

The storefront is a single page with a hash router (`demo/js/app.js`). Four
routes:

| Route | View |
| --- | --- |
| `#/` | home |
| `#/c/<category>` | a category listing, e.g. `#/c/iphone` |
| `#/product/<id>` | one product |
| `#/service` | the repair workshop |

Anything unrecognised falls back to home.

## The CMS

`/admin` is a client-side CMS over the same store the storefront reads. It
edits products, categories, prices, stock, orders and the site copy, and the
storefront picks the changes up — including in another tab.

**It has no login.** That is deliberate. A password would be theatre here:
there is no server to authenticate against, every byte of state is per-visitor
and client-side, and a visitor who "logs in" would only ever be editing their
own throwaway copy of the data. Nothing they change is visible to anyone else,
and it is gone the moment they reload. In the real product this surface sits
behind real authentication; in the demo there is nothing to protect.

## Demo mode

Everything that exists only because this is a public demo — the banner, the
reset control, the "switched off in the demo" explanations — lives in
`demo/js/demo.js`, so it can be removed in one move.

Because there is no build step, nothing can substitute an environment variable
into the client at build time. The flag is therefore a constant:

```js
export const IS_DEMO = params.get('demo') !== '0';
```

So `IS_DEMO` is on by default, and appending **`?demo=0`** to the URL turns
the demo furniture off — useful for looking at the build itself without the
scaffolding. It changes nothing about how the data works; the store is still
in memory either way.

## State

Everything the demo lets you change — products, prices, stock, banners,
campaigns, workshop jobs, orders, site settings, the cart — is held in a plain
object in `demo/js/store.js` and written nowhere. The consequences are worth
being explicit about:

- **A refresh resets the demo.** There is no stale blob to inherit, no
  migration to write when the fixtures change, and no way for one visitor to
  leave a mess for the next person on a shared machine.
- **The reset control** in the demo banner and in the footer does the same
  thing as a reload, minus the scroll jump.
- **Cross-tab sync still works.** Open the storefront and `/admin` side by
  side and change a price: the storefront updates live. The state travels over
  a `BroadcastChannel`, which needs no storage to share it. A tab opened
  *later* starts from the factory catalogue rather than adopting a sibling's
  edits — deliberately, so that "reload to reset" stays true whether or not
  another tab happens to be open.
- **Language and theme are the one exception**, kept in `sessionStorage` under
  `nv.demo.pref.v1`. They are the viewer's preferences, not demo data.

## Fonts

The woff2 files under `demo/assets/fonts/` are self-hosted specifically so the
page makes **zero third-party requests** — no Google Fonts, no CDN, no
preconnect. The subsets and unicode-ranges are the upstream ones and the files
are unmodified. Note that the lari sign (₾, U+20BE) lives in the `latin-ext`
subset, so `latin-ext` must never be dropped.

This is also what lets the deployment run under a strict Content-Security-Policy
(`default-src 'self'`) with no external origins allowed at all.

## Deploying

The deploy is a static tree with no build. `vercel.json` does the routing:
`/` serves the storefront and `/admin` the CMS as *rewrites*, so the address
bar stays clean; unmatched paths serve `demo/404.html`; `X-Robots-Tag:
noindex, nofollow` and a strict CSP are set on everything; `demo/assets/` is
cached immutably and the HTML, JS and CSS are not (there is no content
hashing, so a returning visitor must never pair fresh HTML with a stale
module).

### Create a separate Vercel project for this branch

Do **not** add this branch to an existing project. Make a new one, so its URL
is stable and `main` is never deployed:

1. Vercel dashboard → **Add New…** → **Project**.
2. **Import** this Git repository.
3. **Set the Project Name explicitly.** Vercel defaults it to the repository
   name, and the project name is what determines the `*.vercel.app` URL. Pick
   something neutral — e.g. `norva-demo` — rather than accepting the default.
4. **Framework Preset:** `Other`.
5. **Build and Output Settings:**
   - *Build Command* — override on, left **empty** (there is nothing to build).
   - *Output Directory* — leave at the default. The repository **root** is what
     gets served; the paths in `vercel.json` (`/demo/index.html` and friends)
     assume that. Do not set it to `demo`.
   - *Install Command* — override on, left empty. There are no dependencies.
6. **Environment Variables:** none. There is nothing for one to configure —
   see *Demo mode* above.
7. **Deploy.**

### Point production at `demo-b`

By default Vercel treats `main` as the production branch, which would deploy
the wrong thing. After the first deploy:

- Project → **Settings** → **Git** → **Production Branch**
- Change it from `main` to **`demo-b`** and save.
- Redeploy so production is built from `demo-b`.

From then on, pushes to `demo-b` update the production URL and pushes to
`main` are not deployed at all.
