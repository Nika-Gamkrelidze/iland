/* ==========================================================================
   iLand — adaptive text contrast
   Text that sits directly on the fluid flips between light and dark depending
   on what the fluid is doing underneath it, so a bright plume drifting behind a
   headline never leaves it unreadable.

   Why not mix-blend-mode: difference, the usual trick for this: it inverts the
   backdrop rather than choosing a colour, so over the brand's saturated teal it
   would produce magenta text. Sampling the actual composited luminance and
   picking a real colour keeps the type on-palette.

   The fluid renders a 40x24 copy of what it paints and reads it back at 12Hz;
   this module asks it for the peak luminance under each registered element and
   toggles one class. Elements are measured on a rAF-throttled loop, and only
   while they are on screen.
   ========================================================================== */

const FLIP_ON = 0.52;    /* luminance above which dark text wins            */
const FLIP_OFF = 0.42;   /* and below which it goes back — a hysteresis gap
                            so text on a threshold-hovering patch does not
                            strobe between the two states                   */

export function createContrast(fluid) {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const active = !reduced && !!fluid && fluid.supported === true
                 && typeof fluid.peakLuminanceIn === 'function';

  let watched = [];
  let io = null;
  let raf = 0;
  let running = false;

  function measure() {
    if (!running) return;
    for (const item of watched) {
      if (!item.visible || !item.el.isConnected) continue;
      /* Cached rect: re-measuring every element every frame is the layout
         thrash this whole codebase is trying to avoid. The observer refreshes
         it whenever the element moves in or out of view, and scroll/resize
         invalidate the whole set. */
      const lum = fluid.peakLuminanceIn(item.rect);
      const wantDark = item.dark ? lum > FLIP_OFF : lum > FLIP_ON;
      if (wantDark !== item.dark) {
        item.dark = wantDark;
        item.el.classList.toggle('on-light', wantDark);
      }
    }
    raf = requestAnimationFrame(measure);
  }

  function refreshRects() {
    for (const item of watched) {
      if (item.visible) item.rect = item.el.getBoundingClientRect();
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

    watched = els.map(el => ({ el, rect: el.getBoundingClientRect(), visible: false, dark: false }));

    io = new IntersectionObserver(entries => {
      for (const e of entries) {
        const item = watched.find(w => w.el === e.target);
        if (!item) continue;
        item.visible = e.isIntersecting;
        if (e.isIntersecting) item.rect = e.boundingClientRect;
        else if (item.dark) { item.dark = false; item.el.classList.remove('on-light'); }
      }
    }, { threshold: 0 });

    watched.forEach(w => io.observe(w.el));
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', onScroll, { passive: true });

    running = true;
    raf = requestAnimationFrame(measure);
  }

  function detach() {
    running = false;
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    io?.disconnect();
    io = null;
    removeEventListener('scroll', onScroll);
    removeEventListener('resize', onScroll);
    watched.forEach(w => w.el.classList.remove('on-light'));
    watched = [];
  }

  return { active, attach, detach };
}
