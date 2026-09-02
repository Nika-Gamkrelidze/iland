/* ==========================================================================
   NORVA — scroll choreography
   Product cards fall from above, land, and displace the fluid ground.

   Mechanism, and why it is this one:
   - IntersectionObserver fires a ONE-SHOT class toggle; CSS @keyframes does the
     fall; `animationend` fires the splash. Scroll-driven CSS animations were
     rejected because they are scrubbed rather than played — scroll back up and
     the card un-falls, and progress crosses 100% every time you cross the
     boundary, so there is no reliable "landed" event and you get a splat storm
     by construction. A rAF + getBoundingClientRect loop was rejected because it
     forces a layout per card per frame while a Navier-Stokes sim already owns
     the frame budget.
   - The observer watches a 1px SENTINEL pinned to each card's bottom edge, not
     the card. The splash happens at the contact line, so the trigger has to
     guarantee the bottom edge is on screen. Observing the card with a negative
     rootMargin fires when its TOP crosses, and on a phone in one column the
     bottom is then still below the fold — mobile would silently never splash.

   This module is purely additive. The pre-fall offset lives on a class that only
   JS adds, so if anything in here throws, every card is simply visible at rest.
   ========================================================================== */

const STAGGER_MS = 55;      /* within one observer batch — reads as hail, not a wave */
const MAX_STAGGER = 6;      /* cap so a big fling does not take a second to settle */

export function createChoreography(fluid) {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const active = !reduced && !!fluid && fluid.supported === true;

  /* Per-element, forever: a card never falls twice, so scrolling back up is
     silent. Re-splashing on every pass makes the page feel like a toy and
     doubles the fluid cost for no new information. */
  const landed = new WeakSet();
  let io = null;
  let container = null;
  let ioAlive = false;
  let watchdog = 0;

  /* The armed state sets opacity: 0 and depends on the observer to clear it, so
     if callbacks never arrive the page renders empty. That is not hypothetical:
     a browser that has stopped the rendering lifecycle for the page delivers no
     intersection records at all. One global timer distinguishes "observer is
     working, these cards are simply still below the fold" from "observer is
     dead" — and in the second case shows everything at rest.  */
  function armWatchdog() {
    clearTimeout(watchdog);
    watchdog = setTimeout(() => {
      if (ioAlive) return;
      for (const card of container?.querySelectorAll('.card.is-armed') || []) {
        card.classList.remove('is-armed');
        landed.add(card);
      }
      io?.disconnect();
      io = null;
    }, 1500);
  }

  function onEnter(entries) {
    ioAlive = true;
    /* A fling delivers one callback with many entries. Stagger within the batch
       so a whole row does not land on the same frame. */
    let n = 0;
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      const card = entry.target.closest('.card');
      if (!card || landed.has(card)) continue;

      landed.add(card);
      io.unobserve(entry.target);

      /* Nothing painted while hidden, so falling there would mean the card is
         simply missing when the user comes back. */
      if (document.visibilityState !== 'visible') {
        card.classList.remove('is-armed');
        continue;
      }

      const delay = Math.min(n, MAX_STAGGER) * STAGGER_MS;
      n++;
      card.style.setProperty('--fall-delay', `${delay}ms`);
      card.classList.add('is-falling');
    }
  }

  /* One delegated listener rather than 17. The shorthand runs two animations so
     this fires twice per card — filter on the name. Other things on the page
     animate and bubble through here too, hence the .card check. */
  function onAnimationEnd(e) {
    if (e.animationName !== 'fall-y') return;
    const card = e.target;
    if (!card.classList || !card.classList.contains('card')) return;
    /* Belt and braces: the one-shot guard lives in the observer, but a card that
       somehow re-animates must not splash twice. */
    if (card.classList.contains('is-landed')) return;

    card.classList.remove('is-falling', 'is-armed');
    card.classList.add('is-landed');
    card.style.removeProperty('--fall-delay');

    /* One layout read per card, at landing, not per frame. At animationend the
       card is at its resting position, so this rect IS the contact line. */
    const r = card.getBoundingClientRect();
    if (r.bottom < 0 || r.top > innerHeight) return;

    /* Bigger cards displace more ground. */
    const energy = Math.max(0.75, Math.min(1.35, r.width / 260));
    fluid.plumeUnder(r, { energy });
  }

  /**
   * Arm every card inside `el` and start watching.
   * Must be called synchronously after the container's innerHTML is set and
   * before the browser paints — otherwise cards appear at rest and then snap
   * up to their pre-fall offset, which flashes on every render.
   */
  function attach(el) {
    if (!active || !el) return;
    detach();
    container = el;

    const cards = el.querySelectorAll('.card');
    if (!cards.length) return;

    io = new IntersectionObserver(onEnter, {
      /* Fire slightly before the sentinel is fully on screen so the fall has
         started by the time the card is comfortably in view. */
      rootMargin: '0px 0px -8% 0px',
      threshold: 0,
    });

    for (const card of cards) {
      if (landed.has(card)) continue;
      card.classList.add('is-armed');
      const floor = card.querySelector('.card__floor');
      io.observe(floor || card);
    }

    el.addEventListener('animationend', onAnimationEnd);
    armWatchdog();
  }

  function detach() {
    clearTimeout(watchdog);
    ioAlive = false;
    if (io) { io.disconnect(); io = null; }
    if (container) container.removeEventListener('animationend', onAnimationEnd);
    container = null;
  }

  return { active, attach, detach };
}
