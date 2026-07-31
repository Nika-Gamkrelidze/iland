/* ==========================================================================
   iLand — adaptive text contrast, per glyph region
   Text sitting directly on the fluid takes its colour from what is actually
   behind each part of it: the glyphs standing on a bright plume go dark while
   the glyphs next to them stay light — the boundary runs THROUGH the text.

   Mechanism: the sim already renders a small copy of what it paints and reads
   it back (80x48, ~12Hz). That grid is converted into a tiny image where each
   cell is either the light text colour or the dark ink colour, smoothed at the
   threshold; the image is stretched over the viewport and clipped to the text
   with background-clip:text. The browser's bilinear upscale gives the soft
   edge, which matches the fluid — the fluid itself is soft.

   Why not mix-blend-mode:difference, the one-line version of this: difference
   inverts the backdrop rather than choosing a colour, so over the brand teal it
   paints magenta text. Building the colour map ourselves keeps both states on
   palette in both themes: in dark mode light text goes ink where the ground is
   bright, in light mode dark text goes paper-white where the dye is dark. Both
   fall out of the same luminance rule with no theme special-casing.

   The whole-element class flip is kept as the fallback for engines without
   background-clip:text.
   ========================================================================== */

const THRESH_LO = 0.40;   /* below this luminance, text is fully "light" state */
const THRESH_HI = 0.62;   /* above it, fully "dark" state; between = blend     */

/* Fallback (class flip) thresholds, with hysteresis so it cannot strobe. */
const FLIP_ON = 0.52;
const FLIP_OFF = 0.42;

export function createContrast(fluid) {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clipOK = CSS.supports('-webkit-background-clip', 'text')
              || CSS.supports('background-clip', 'text');
  const active = !reduced && !!fluid && fluid.supported === true
                 && typeof fluid.groundSample === 'function';

  let watched = [];
  let io = null;
  let raf = 0;
  let running = false;
  let lastGen = -1;
  let ioDelivered = false;
  let watchdog = 0;

  /* One map for body text, one for the accent word — two small canvases shared
     by every adaptive element on the page, regenerated only when the sim's
     readback generation changes. */
  const textCnv = document.createElement('canvas');
  const accentCnv = document.createElement('canvas');
  const dimCnv = document.createElement('canvas');
  let textUrl = '', accentUrl = '', dimUrl = '';

  function cssColor(name, fallback) {
    const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return v || fallback;
  }

  function parseColor(c) {
    /* tokens are #rrggbb in this codebase; anything else goes through a probe */
    if (/^#[0-9a-f]{6}$/i.test(c)) {
      return [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
    }
    const d = document.createElement('div');
    d.style.color = c;
    document.body.appendChild(d);
    const m = getComputedStyle(d).color.match(/\d+/g) || [238, 243, 248];
    d.remove();
    return m.slice(0, 3).map(Number);
  }

  const smooth = t => t * t * (3 - 2 * t);

  /**
   * Paint one colour map: `light` where the ground is dark, `dark` where the
   * ground is bright, smoothstepped between the thresholds. The sample grid's
   * rows are bottom-up (GL order), so they are flipped here.
   */
  function paintMap(cnv, sample, light, dark) {
    const { grid, w, h } = sample;
    cnv.width = w; cnv.height = h;
    const ctx = cnv.getContext('2d');
    const img = ctx.createImageData(w, h);
    for (let y = 0; y < h; y++) {
      const srcRow = (h - 1 - y) * w;
      for (let x = 0; x < w; x++) {
        const lum = grid[srcRow + x];
        const t = smooth(Math.min(1, Math.max(0, (lum - THRESH_LO) / (THRESH_HI - THRESH_LO))));
        const o = (y * w + x) * 4;
        img.data[o]     = light[0] + (dark[0] - light[0]) * t;
        img.data[o + 1] = light[1] + (dark[1] - light[1]) * t;
        img.data[o + 2] = light[2] + (dark[2] - light[2]) * t;
        img.data[o + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
    return cnv.toDataURL();
  }

  function rebuildMaps() {
    const sample = fluid.groundSample();
    if (sample.gen === lastGen) return false;
    lastGen = sample.gen;

    /* Endpoints are literals, NOT theme tokens. The rule is physical — light
       glyphs on a dark backdrop, ink glyphs on a bright one — and it must hold
       in both themes. Keying the low-luminance endpoint off --text would paint
       dark-on-dark in light mode, where --text is itself the ink. */
    const light = [238, 243, 248];   /* #EEF3F8 */
    const ink = parseColor(cssColor('--ink', '#0B1119'));
    textUrl = paintMap(textCnv, sample, light, ink);

    /* Secondary text keeps its reduced weight in BOTH states — mapping it to
       the full-contrast pair would promote every caption to headline colour
       the moment a plume passes. #9FADBF on dark ground, #3C4654 on bright. */
    dimUrl = paintMap(dimCnv, sample, [159, 173, 191], [60, 70, 84]);

    /* Accent: bright teal on dark ground, deep teal on bright ground. */
    const lume = parseColor(cssColor('--lume', '#2FD6B4'));
    const lume900 = parseColor(cssColor('--lume-900', '#0A5346'));
    accentUrl = paintMap(accentCnv, sample, lume, lume900);
    return true;
  }

  function applyMap(el, rect, url) {
    /* innerWidth can briefly report 0 (backgrounded documents, some embeds);
       a 0x0 background-size would blank the text, which is the one failure
       this module must never cause. */
    const vw = document.documentElement.clientWidth || innerWidth;
    const vh = document.documentElement.clientHeight || innerHeight;
    if (!vw || !vh) return;
    el.style.backgroundImage = `url(${url})`;
    el.style.backgroundSize = `${vw}px ${vh}px`;
    el.style.backgroundPosition = `${-rect.left}px ${-rect.top}px`;
  }

  function clearMap(el) {
    el.classList.remove('ink-map');
    el.style.removeProperty('background-image');
    el.style.removeProperty('background-size');
    el.style.removeProperty('background-position');
    for (const sp of el.querySelectorAll('.lume')) {
      sp.style.removeProperty('background-image');
      sp.style.removeProperty('background-size');
      sp.style.removeProperty('background-position');
    }
  }

  function measure() {
    if (!running) return;
    const changed = rebuildMaps();
    for (const item of watched) {
      if (!item.visible || !item.el.isConnected) continue;

      if (clipOK) {
        if (!item.el.classList.contains('ink-map')) item.el.classList.add('ink-map');
        /* Position must track the element even when the map did not change —
           the page scrolls under a fixed background. Rects are cached and
           refreshed by the scroll handler, never measured here. */
        applyMap(item.el, item.rect, item.map === 'dim' ? dimUrl : textUrl);
        for (const sp of item.accents) {
          /* The accent span's own rect: offset within the parent is stable, so
             it is derived from the cached parent rect plus a cached delta. */
          applyMap(sp.el, {
            left: item.rect.left + sp.dx,
            top: item.rect.top + sp.dy,
          }, accentUrl);
        }
      } else {
        /* Fallback: whole-element flip with hysteresis. */
        const lum = fluid.peakLuminanceIn(item.rect);
        const wantDark = item.dark ? lum > FLIP_OFF : lum > FLIP_ON;
        if (wantDark !== item.dark) {
          item.dark = wantDark;
          item.el.classList.toggle('on-light', wantDark);
        }
      }
    }
    raf = requestAnimationFrame(measure);
  }

  function refreshRects() {
    for (const item of watched) {
      if (!item.visible) continue;
      item.rect = item.el.getBoundingClientRect();
      for (const sp of item.accents) {
        const r = sp.el.getBoundingClientRect();
        sp.dx = r.left - item.rect.left;
        sp.dy = r.top - item.rect.top;
      }
    }
  }

  let scrollTick = 0;
  const onScroll = () => {
    if (scrollTick) return;
    scrollTick = requestAnimationFrame(() => { scrollTick = 0; refreshRects(); });
  };

  function attach(root) {
    detach();
    if (!active || !root) return;

    const els = [...root.querySelectorAll('[data-adaptive]')];
    if (!els.length) return;

    watched = els.map(el => {
      const rect = el.getBoundingClientRect();
      return {
        el, rect, visible: false, dark: false,
        map: el.getAttribute('data-adaptive') === 'dim' ? 'dim' : 'text',
        accents: [...el.querySelectorAll('.lume')].map(sp => {
          const r = sp.getBoundingClientRect();
          return { el: sp, dx: r.left - rect.left, dy: r.top - rect.top };
        }),
      };
    });

    io = new IntersectionObserver(entries => {
      ioDelivered = true;
      for (const e of entries) {
        const item = watched.find(w => w.el === e.target);
        if (!item) continue;
        item.visible = e.isIntersecting;
        if (e.isIntersecting) item.rect = e.boundingClientRect;
        else if (clipOK) clearMap(item.el);
        else if (item.dark) { item.dark = false; item.el.classList.remove('on-light'); }
      }
    }, { threshold: 0 });

    watched.forEach(w => io.observe(w.el));

    /* If the observer never delivers (a page whose rendering lifecycle has
       stalled produces no records at all), treat everything as visible rather
       than silently doing nothing. */
    ioDelivered = false;
    clearTimeout(watchdog);
    watchdog = setTimeout(() => {
      if (!ioDelivered) { watched.forEach(w => { w.visible = true; }); refreshRects(); }
    }, 1500);

    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', onScroll, { passive: true });

    running = true;
    lastGen = -1;
    raf = requestAnimationFrame(measure);
  }

  function detach() {
    running = false;
    clearTimeout(watchdog);
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    io?.disconnect();
    io = null;
    removeEventListener('scroll', onScroll);
    removeEventListener('resize', onScroll);
    for (const w of watched) { clearMap(w.el); w.el.classList.remove('on-light'); }
    watched = [];
  }

  /** One synchronous pass, for tests and stalled-rAF environments. Refreshes
      rects first: the scroll handler's rAF coalescing never runs where rAF is
      stalled, so cached rects would otherwise be stale here. */
  function update() {
    refreshRects();
    const wasRunning = running;
    running = true;
    const r2 = raf; raf = 0;
    measure();
    if (raf) cancelAnimationFrame(raf);
    raf = r2;
    running = wasRunning;
  }

  return { active, clipOK, attach, detach, update };
}
