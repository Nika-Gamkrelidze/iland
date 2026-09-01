/* ==========================================================================
   NORVA — storefront
   Hash router + view renderers + the interactions that carry the brand.
   Reads everything from store.js, which is what the CMS writes to.
   ========================================================================== */

import * as S from './store.js';
import { deviceSVG } from './devices.js';
import { UI, TICKER, STORY } from './i18n.js';
import { createFluid } from './fluid.js';
import { createChoreography } from './fx.js';
import { createContrast } from './contrast.js';
import { IS_DEMO, demoBlocked, blockOn, mountBanner, RESET_DONE, RESET_LABEL } from './demo.js';

const $  = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

const esc = s => String(s ?? '').replace(/[&<>"']/g, c =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/** Localised UI string. */
const u = key => S.t(UI[key]);
/** Localised content bag from the CMS. */
const tt = bag => S.t(bag);

const main = $('#main');

/* Used only where a decorative label needs a name and no product is in hand. */
const SITE_NAME = { ka: 'NORVA', en: 'NORVA', ru: 'NORVA' };

/* Whose name goes on an order a demo visitor places. */
const DEMO_BUYER = { ka: 'დემო ვიზიტორი', en: 'Demo visitor', ru: 'Демо-посетитель' };

/* The page ground, per theme. The fluid solver and the theme-color meta both
   need it as a literal, so it is named once here rather than inlined twice —
   inlined, a palette change silently leaves the WebGL ground on the old value
   and the whole page paints the previous brand's background. */
const GROUND = { dark: '#131110', light: '#FAF9F7' };

/* ------------------------------------------------------------------ icons */

const ICON = {
  check:  '<path d="m4 12.5 5 5L20 6.5"/>',
  truck:  '<path d="M3 7h11v10H3zM14 10h4l3 3v4h-7z"/><circle cx="7" cy="18" r="2"/><circle cx="17.5" cy="18" r="2"/>',
  pin:    '<path d="M12 21s7-5.7 7-11a7 7 0 1 0-14 0c0 5.3 7 11 7 11Z"/><circle cx="12" cy="10" r="2.5"/>',
  shield: '<path d="M12 3l7 3v6c0 4.4-3 8-7 9-4-1-7-4.6-7-9V6l7-3Z"/><path d="m9 12 2 2 4-4"/>',
  back:   '<path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/>',
  screen: '<rect x="6" y="2.5" width="12" height="19" rx="3"/><path d="M10 5.5h4"/>',
  battery:'<rect x="2.5" y="8" width="16" height="8" rx="2"/><path d="M21 11v2"/><path d="M6 11v2"/>',
  water:  '<path d="M12 3s6 6.6 6 10.4A6 6 0 0 1 6 13.4C6 9.6 12 3 12 3Z"/>',
  data:   '<ellipse cx="12" cy="6" rx="7" ry="3"/><path d="M5 6v6c0 1.7 3 3 7 3s7-1.3 7-3V6"/><path d="M5 12v6c0 1.7 3 3 7 3s7-1.3 7-3v-6"/>',
  diag:   '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.6-3.6"/><path d="M8 11h6M11 8v6"/>',
  tradein:'<path d="M4 8h13l-3-3M20 16H7l3 3"/>',
  cart:   '<path d="M6 7h13l-1.4 9.3a2 2 0 0 1-2 1.7H9.4a2 2 0 0 1-2-1.7L6 7Z"/><path d="M9 7V5.5a3 3 0 0 1 6 0V7"/>',
  heart:  '<path d="M12 20s-7-4.4-7-9.4A4.1 4.1 0 0 1 12 8a4.1 4.1 0 0 1 7 2.6c0 5-7 9.4-7 9.4Z"/>',
  arrow:  '<path d="M5 12h14M13 6l6 6-6 6"/>',
  clock:  '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
};

const icon = (name, size = 20) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
        stroke-linecap="round" stroke-linejoin="round" width="${size}" height="${size}"
        aria-hidden="true">${ICON[name] || ''}</svg>`;

/* ------------------------------------------------------------- components */

/**
 * Product imagery. The catalogue artwork where a product has it, the parametric
 * archetype otherwise — so a product added in the CMS with no artwork still
 * renders something rather than an empty box.
 *
 * The artwork is drawn in a single fixed finish, so each product's colour list
 * is ordered to put that finish first. Picking another swatch still changes the
 * variant and the price; it does not repaint the artwork, which is how any
 * reseller with one shot per product behaves.
 */
function productMedia(p, { hex, className = '', eager = false } = {}) {
  if (p.image) {
    return `<img src="${esc(p.image)}" alt="${esc(p.name)}" class="${esc(className)} product-photo"
                 loading="${eager ? 'eager' : 'lazy'}" decoding="async">`;
  }
  return deviceSVG(p.device, hex || p.colors?.[0]?.hex || '#8C949C',
                   { className, ariaLabel: p.name });
}

/** The stock pill, using the shop's own phrasing. */
function stockPill(p) {
  const st = S.stockState(p);
  return `<span class="stock stock--${st.key}">${esc(S.t(st))}</span>`;
}

function badgeFor(p) {
  const map = {
    new:        `<span class="badge badge--new">${esc(u('conditionNew'))}</span>`,
    sale:       '',
    refurb:     `<span class="badge badge--refurb">${esc(u('conditionOpen'))}</span>`,
    bestseller: `<span class="badge badge--best">★</span>`,
  };
  return map[p.badge] || '';
}

/**
 * Price block. Renders the strike-through ONLY when there is a genuinely
 * higher price to strike — the old site printed a struck-through 0₾ on every
 * accessory, which reads as broken and quietly destroys trust.
 */
function priceBlock(p, { big = false } = {}) {
  const pr = S.priceOf(p);
  const per = S.monthly(pr.final, 12);
  return `
    <div class="price-row">
      <span class="price${big ? ' price--lg' : ''} num">${esc(S.gel(pr.final))}</span>
      ${pr.was ? `<span class="price-was num">${esc(S.gel(pr.was))}</span>
                  <span class="price-off">−${pr.off}%</span>` : ''}
    </div>
    ${pr.final >= 100
      ? `<div class="price-monthly">${esc(u('instalment'))} <b class="num">${esc(S.gel(per, { symbol: false }))}</b> ${esc(u('perMonth'))}</div>`
      : ''}`;
}

function productCard(p) {
  const color = p.colors?.[0]?.hex || '#8C949C';
  return `
  <article class="card" data-card="${esc(p.id)}" tabindex="0" role="link"
           aria-label="${esc(p.name)}">
    <div class="card__badges">${badgeFor(p)}</div>
    <button class="card__fav" aria-pressed="false" aria-label="ფავორიტებში დამატება"
            data-fav="${esc(p.id)}">${icon('heart', 15)}</button>
    <div class="card__media${p.image ? ' card__media--photo' : ''}" data-media="${esc(p.id)}">
      ${productMedia(p, { hex: color })}
    </div>
    <h3 class="card__name">${esc(p.name)}</h3>
    ${tt(p.tagline) || p.group
      ? `<p class="card__tag${tt(p.tagline) ? '' : ' dim'}">${esc(tt(p.tagline) || p.group)}</p>`
      : ''}
    <div class="card__foot">
      ${priceBlock(p)}
      <div class="flex between items-center mt-3">
        ${stockPill(p)}
        <div class="card__swatches">
          ${(p.colors || []).slice(0, 4).map((c, i) => `
            <button class="swatch" style="background:${esc(c.hex)}"
                    aria-pressed="${i === 0}" data-swatch="${esc(p.id)}|${esc(c.hex)}"
                    title="${esc(S.t(c))}" aria-label="${esc(S.t(c))}"></button>`).join('')}
        </div>
      </div>
    </div>
    <i class="card__floor" aria-hidden="true"></i>
  </article>`;
}

/**
 * A catalogue row. Same product, same fields, same actions as the card — the
 * category listing is a stock list, so it reads down a price column instead of
 * across a grid. `data-card` is kept so the existing click wiring reaches it.
 */
function productRow(p) {
  const color = p.colors?.[0]?.hex || '#8C949C';
  return `
  <article class="row" data-card="${esc(p.id)}" tabindex="0" role="link"
           aria-label="${esc(p.name)}">
    <div class="row__media${p.image ? ' card__media--photo' : ''}" data-media="${esc(p.id)}">
      ${productMedia(p, { hex: color })}
    </div>
    <div class="row__body">
      <h3 class="row__name">${esc(p.name)}</h3>
      <div class="row__meta">
        <span class="row__sku">${esc(p.sku)}</span>
        ${badgeFor(p)}
        ${stockPill(p)}
        <div class="row__swatches">
          ${(p.colors || []).slice(0, 4).map((c, i) => `
            <button class="swatch" style="background:${esc(c.hex)}"
                    aria-pressed="${i === 0}" data-swatch="${esc(p.id)}|${esc(c.hex)}"
                    title="${esc(S.t(c))}" aria-label="${esc(S.t(c))}"></button>`).join('')}
        </div>
      </div>
    </div>
    <div class="row__buy">${priceBlock(p)}</div>
  </article>`;
}

/** Twelve to a page. Nothing here paginated before; the biggest list was 138. */
const PAGE_SIZE = 12;

function pager(total, page) {
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  if (pages < 2) return `<div class="pager"><span class="pager__count">${total} ${esc(u('items'))}</span></div>`;
  return `
  <div class="pager">
    <span class="pager__count">${esc(u('pageOf'))} ${page + 1} ${esc(u('pageSep'))} ${pages} · ${total} ${esc(u('items'))}</span>
    <div class="pager__acts">
      <button class="pager__btn" data-page="prev"${page === 0 ? ' disabled' : ''}>${esc(u('prevPage'))}</button>
      <button class="pager__btn" data-page="next"${page >= pages - 1 ? ' disabled' : ''}>${esc(u('nextPage'))}</button>
    </div>
  </div>`;
}

/**
 * The instalment calculator — the signature control.
 * Every competitor prints a static monthly number; none lets you drive it.
 * This is both the most conversion-critical component and the most memorable.
 */
function calcBlock(amount) {
  const banks = S.getState().instalments || [];
  const below = amount < 100;
  return `
  <div class="calc${below ? ' is-below-min' : ''}" id="calc" data-amount="${amount}">
    <div class="calc__head">
      <strong>${esc(u('instalment'))}</strong>
      <div class="calc__banks" role="group" aria-label="${esc(u('instalment'))}">
        ${banks.map((b, i) => `
          <button class="calc__bank" data-bank="${esc(b.id)}" aria-pressed="${i === 0}">
            ${esc(b.name)} <span class="dim">${esc(b.label)}</span>
          </button>`).join('')}
      </div>
    </div>

    <div class="calc__figure">
      <span class="calc__amount num" id="calcAmount">—</span>
      <span class="calc__per">${esc(u('perMonth'))}</span>
    </div>

    <input class="slider" type="range" id="calcTerm" min="0" max="4" step="1" value="2"
           aria-label="${esc(u('months'))}">
    <div class="calc__terms" id="calcTerms"></div>

    <p class="calc__note">${esc(below ? u('instalmentMin') : u('instalmentNote'))}</p>
  </div>`;
}

/* ------------------------------------------------------------------ views */

function viewHome() {
  const st = S.getState();
  const banner = S.activeBanners(st)[0];
  const bannerProduct = banner?.product ? S.byId(banner.product) : null;
  const heroDevice = bannerProduct?.device || 'laptop';
  const heroColor = bannerProduct?.colors?.[0]?.hex || '#8C949C';

  const cats = st.categories.filter(c => !['service', 'gifts'].includes(c.id));

  return `
  <section class="hero">
    <div class="aurora" aria-hidden="true"></div>
    <div class="grain" aria-hidden="true"></div>
    <div class="wrap hero__grid">
      <div>
        <p class="hero__eyebrow"><span class="dot"></span>${esc(u('heroEyebrow'))}</p>
        <h1 class="hero__title display" data-adaptive>${esc(u('heroTitleA'))}<span class="lume">${esc(u('heroTitleB'))}</span></h1>
        <p class="hero__lede" data-adaptive>${esc(u('heroLede'))}</p>
        <div class="hero__cta">
          <a class="btn btn--primary btn--lg btn--magnetic" href="#/c/iphone">${esc(u('shopNow'))} ${icon('arrow', 17)}</a>
          <a class="btn btn--ghost btn--lg" href="#/service">${esc(u('bookRepair'))}</a>
        </div>
        <div class="hero__stats">
          <div class="hero__stat"><b class="num" data-count="9" data-adaptive>9</b><span data-adaptive="dim">${esc(u('statYears'))}</span></div>
          <div class="hero__stat"><b class="num" data-count="6200" data-adaptive>6,200</b><span data-adaptive="dim">${esc(u('statRepairs'))}</span></div>
          <div class="hero__stat"><b class="num" data-count="24" data-adaptive>24</b><span data-adaptive="dim">${esc(u('statWarranty'))}</span></div>
          <div class="hero__stat"><b class="num" data-count="4" data-adaptive>4</b><span data-adaptive="dim">${esc(u('statDelivery'))}</span></div>
        </div>
      </div>
      <div class="stage">
        <div class="stage__glow" aria-hidden="true"></div>
        <div class="stage__float">${deviceSVG(heroDevice, heroColor, { ariaLabel: bannerProduct?.name || S.t(SITE_NAME) })}</div>
      </div>
    </div>
  </section>

  <!-- categories -->
  <section class="section wrap" data-reveal>
    <div class="section__head">
      <div>
        <p class="eyebrow" data-adaptive="dim">${esc(u('browse'))}</p>
        <h2 class="section__title" data-adaptive>${esc(u('browseSub'))}</h2>
      </div>
    </div>
    <div class="grid">
      ${cats.map(c => {
        const n = S.inCategory(c.id).length;
        const sample = S.inCategory(c.id)[0];
        return `
        <a class="cat" href="#/c/${esc(c.id)}">
          <div>
            <h3 class="cat__name">${esc(S.t(c))}</h3>
            <span class="cat__count num">${n} ${esc(u('items'))}</span>
          </div>
          ${sample ? deviceSVG(sample.device, sample.colors?.[0]?.hex || '#8C949C') : ''}
        </a>`;
      }).join('')}
    </div>
  </section>

  <!-- featured -->
  <section class="section wrap" data-reveal>
    <div class="section__head">
      <div>
        <p class="eyebrow" data-adaptive="dim">${esc(u('featured'))}</p>
        <h2 class="section__title" data-adaptive>${esc(u('featuredSub'))}</h2>
      </div>
      <a class="btn btn--ghost btn--sm" href="#/c/iphone">${esc(u('seeAll'))} ${icon('arrow', 15)}</a>
    </div>
    <div class="rail">${S.featured().map(productCard).join('')}</div>
  </section>

  <!-- pinned story -->
  <section class="track" id="track" style="height:${STORY.length * 100}svh">
    <div class="track__stage">
      <div class="aurora" aria-hidden="true" style="opacity:.34"></div>
      <div class="track__grid">
        <div class="track__copy">
          ${STORY.map((s, i) => `
            <div class="panel${i === 0 ? ' is-on' : ''}" data-panel="${i}">
              <p class="eyebrow">${esc(u('storyEyebrow'))} · 0${i + 1}</p>
              <h3>${esc(tt(s.h))}</h3>
              <p>${esc(tt(s.p))}</p>
            </div>`).join('')}
        </div>
        <div class="track__media">
          <div class="stage__glow" aria-hidden="true"></div>
          <div id="storyDevice">${deviceSVG(STORY[0].device, STORY[0].color)}</div>
        </div>
      </div>
      <div class="track__dots" aria-hidden="true">
        ${STORY.map((_, i) => `<i class="${i === 0 ? 'is-on' : ''}"></i>`).join('')}
      </div>
    </div>
  </section>

  <!-- deals -->
  ${S.onSale().length ? `
  <section class="section wrap" data-reveal>
    <div class="section__head">
      <div>
        <p class="eyebrow" data-adaptive="dim">${esc(u('deals'))}</p>
        <h2 class="section__title" data-adaptive>${esc(u('dealsSub'))}</h2>
      </div>
    </div>
    <div class="rail">${S.onSale().slice(0, 8).map(productCard).join('')}</div>
  </section>` : ''}

  <!-- service teaser -->
  <section class="section wrap" data-reveal>
    <div class="section__head">
      <div>
        <p class="eyebrow" data-adaptive="dim">${esc(S.t(S.getState().categories.find(c => c.id === 'service')))}</p>
        <h2 class="section__title" data-adaptive>${esc(u('serviceTitle'))}</h2>
        <p class="section__sub mt-3" data-adaptive="dim">${esc(u('serviceSub'))}</p>
      </div>
      <a class="btn btn--ghost btn--sm" href="#/service">${esc(u('seeAll'))} ${icon('arrow', 15)}</a>
    </div>
    <div class="grid">${S.getState().services.slice(0, 3).map(serviceCard).join('')}</div>
  </section>`;
}

function serviceCard(s) {
  return `
  <article class="svc">
    <div class="svc__icon">${icon(s.icon || 'diag', 21)}</div>
    <h3 class="svc__name">${esc(tt(s.name))}</h3>
    <p class="svc__desc">${esc(tt(s.desc))}</p>
    <div class="svc__meta">
      <div>
        <b class="num">${s.from > 0 ? esc(S.gel(s.from)) + esc(u('from')) : esc(u('free'))}</b>
        <span>${esc(u('from') === '-დან' ? 'ფასი' : 'Price')}</span>
      </div>
      <div><b>${esc(tt(s.eta))}</b><span>${esc(u('turnaround'))}</span></div>
      ${s.warranty ? `<div><b class="num">${s.warranty} ${esc(u('monthsShort'))}</b><span>${esc(u('svcWarranty'))}</span></div>` : ''}
    </div>
    <button class="btn btn--ghost btn--sm mt-3" data-book="${esc(s.id)}">${esc(u('bookSlot'))}</button>
  </article>`;
}

/* Accessories are 155 products across eleven groups on the live site. Without a
   second axis of filtering that category is an undifferentiated wall. */
/* A product can belong to more than one group — the live site cross-lists
   AirPods Max under both Headphones and Made by Apple — so membership is tested
   against the whole list, not just the primary. */
const inGroup = (p, g) => (p.groups || (p.group ? [p.group] : [])).includes(g);

function groupChips(items) {
  const groups = [...new Set(items.flatMap(p => p.groups || (p.group ? [p.group] : [])))].sort();
  if (groups.length < 2) return '';
  return `<div class="flex wrap-flex gap-2 mt-5" id="groupRow">
    <button class="chip is-on" data-group="">${esc(u('all'))} <span class="dim num">${items.length}</span></button>
    ${groups.map(g => `<button class="chip" data-group="${esc(g)}">${esc(g)}
      <span class="dim num">${items.filter(p => inGroup(p, g)).length}</span></button>`).join('')}
  </div>`;
}

function viewCategory(catId) {
  const st = S.getState();
  const cat = st.categories.find(c => c.id === catId);
  if (!cat) return viewHome();
  if (catId === 'service') return viewService();

  const items = S.inCategory(catId, st);
  return `
  <section class="section wrap">
    <header class="page-head">
      <p class="eyebrow" data-adaptive="dim"><a href="#/">${esc(u('home'))}</a> · ${esc(S.t(cat))}</p>
      <h1 class="section__title mt-3" data-adaptive style="font-size:var(--step-5)">${esc(S.t(cat))}</h1>
    </header>
    ${groupChips(items)}
    <div class="cat-toolbar" id="sortRow">
      <span class="eyebrow">${esc(u('sortBy'))}</span>
      <button class="chip is-on" data-sort="popular">${esc(u('sortPopular'))}</button>
      <button class="chip" data-sort="asc">${esc(u('sortPriceUp'))}</button>
      <button class="chip" data-sort="desc">${esc(u('sortPriceDown'))}</button>
      <button class="chip" data-sort="off">${esc(u('sortDiscount'))}</button>
    </div>
    <div class="rows mt-5" id="catGrid">
      ${items.length ? items.slice(0, PAGE_SIZE).map(productRow).join('')
                     : `<p class="dim">${esc(u('nothingHere'))}</p>`}
    </div>
    <div id="catPager">${pager(items.length, 0)}</div>
  </section>`;
}

function viewProduct(id) {
  const p = S.byId(id);
  if (!p) return viewHome();
  const st = S.getState();
  const cat = st.categories.find(c => c.id === p.category);
  const color = p.colors?.[0]?.hex || '#8C949C';
  const size = p.storage?.[0]?.size || '—';
  const pr = S.variantPrice(p, size);
  const cross = st.products
    .filter(x => x.id !== p.id && (x.category === 'accessories' || x.category === p.category))
    .slice(0, 4);

  return `
  <section class="wrap pdp" id="pdp" data-product="${esc(p.id)}">
    <div>
      <p class="eyebrow" data-adaptive="dim"><a href="#/">${esc(u('home'))}</a> ·
        <a href="#/c/${esc(p.category)}">${esc(S.t(cat))}</a></p>
      <div class="pdp__stage${p.image ? ' pdp__stage--photo' : ''} mt-4" id="pdpStage">
        <div class="stage__glow" aria-hidden="true"></div>
        ${productMedia(p, { hex: color, eager: true })}
      </div>
      <div class="mt-6"${(p.specs || []).length ? '' : ' hidden'}>
        <h2 class="section__title" style="font-size:var(--step-2)">${esc(u('specs'))}</h2>
        <div class="mt-4">
          ${(p.specs || []).map(s => `
            <div class="spec">
              <span class="spec-key">${esc(S.getLang() === 'ka' ? s.ka : s.en)}</span>
              <span class="spec-value">${esc(s.v)}</span>
            </div>`).join('')}
          <div class="spec">
            <span class="spec-key">${esc(u('sku'))}</span>
            <span class="spec-value">${esc(p.sku)}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="pdp__buy">
      <div class="flex gap-2 items-center">${badgeFor(p)} ${stockPill(p)}</div>
      <h1 class="pdp__title mt-3">${esc(p.name)}</h1>
      ${tt(p.tagline) ? `<p class="muted mt-3">${esc(tt(p.tagline))}</p>` : ''}

      <div class="mt-5" id="pdpPrice">${priceBlock({ ...p, price: pr.base }, { big: true })}</div>

      <div class="opt">
        <div class="opt__label"><span>${esc(u('storage'))}</span><span id="storageHint">${esc(size)}</span></div>
        <div class="opt__row" id="storageRow">
          ${(p.storage || []).map((s, i) => `
            <button class="chip${i === 0 ? ' is-on' : ''}" data-storage="${esc(s.size)}">
              ${esc(s.size)}${s.delta ? ` <span class="dim num">+${S.gel(s.delta)}</span>` : ''}
            </button>`).join('')}
        </div>
      </div>

      <div class="opt">
        <div class="opt__label"><span>${esc(u('colour'))}</span><span id="colorHint">${esc(S.t(p.colors?.[0] || {}))}</span></div>
        <div class="opt__row" id="colorRow">
          ${(p.colors || []).map((c, i) => `
            <button class="swatch swatch--lg" style="background:${esc(c.hex)}"
                    aria-pressed="${i === 0}" data-color="${esc(c.hex)}" data-cname="${esc(S.t(c))}"
                    title="${esc(S.t(c))}" aria-label="${esc(S.t(c))}"></button>`).join('')}
        </div>
      </div>

      <div class="mt-6">${calcBlock(pr.final)}</div>

      <button class="btn btn--primary btn--lg btn--block mt-5 btn--magnetic" id="addBtn"
              ${S.stockState(p).key === 'out' ? 'disabled' : ''}>
        ${icon('cart', 18)} ${esc(S.stockState(p).key === 'out' ? u('outOfStock') : u('addToCart'))}
      </button>

      <div class="trust">
        <div class="trust__item">${icon('truck')}<div><b>${esc(u('delivery'))}</b><span>${esc(u('deliveryV'))}</span></div></div>
        <div class="trust__item">${icon('pin')}<div><b>${esc(u('pickup'))}</b><span>${esc(u('pickupV'))}</span></div></div>
        <div class="trust__item">${icon('shield')}<div><b>${esc(u('warranty'))}</b><span>${esc(u('warrantyV'))}</span></div></div>
        <div class="trust__item">${icon('back')}<div><b>${esc(u('returns'))}</b><span>${esc(u('returnsV'))}</span></div></div>
      </div>
    </div>
  </section>

  <section class="section wrap" data-reveal>
    <div class="section__head"><h2 class="section__title" data-adaptive>${esc(u('alsoBought'))}</h2></div>
    <div class="rail">${cross.map(productCard).join('')}</div>
  </section>`;
}

function viewService() {
  const st = S.getState();
  return `
  <section class="hero" style="padding-block:var(--sp-8) var(--sp-7)">
    <div class="aurora" aria-hidden="true" style="opacity:.45"></div>
    <div class="grain" aria-hidden="true"></div>
    <div class="wrap">
      <p class="eyebrow" data-adaptive="dim"><a href="#/">${esc(u('home'))}</a> · ${esc(S.t(st.categories.find(c => c.id === 'service')))}</p>
      <h1 class="hero__title display mt-4" data-adaptive style="font-size:var(--step-5)">${esc(u('serviceTitle'))}</h1>
      <p class="hero__lede" data-adaptive>${esc(u('serviceSub'))}</p>
    </div>
  </section>
  <section class="section wrap" style="padding-top:0">
    <div class="grid">${st.services.map(serviceCard).join('')}</div>
  </section>`;
}

/* ----------------------------------------------------------------- router */

function parse() {
  const h = location.hash.replace(/^#\/?/, '');
  const [seg, arg] = h.split('/');
  if (seg === 'c' && arg) return { name: 'category', arg };
  if (seg === 'product' && arg) return { name: 'product', arg };
  if (seg === 'service') return { name: 'service' };
  return { name: 'home' };
}

function paint() {
  const r = parse();
  const html =
    r.name === 'category' ? viewCategory(r.arg) :
    r.name === 'product'  ? viewProduct(r.arg)  :
    r.name === 'service'  ? viewService()       : viewHome();

  main.innerHTML = html;
  window.scrollTo({ top: 0, behavior: 'instant' });

  markNav(r);
  wireView(r);
  observeReveals();
  /* Synchronous, before the browser paints: arming the cards a task later would
     show them at rest and then snap them up to the pre-fall offset. */
  choreo?.attach(main);
  contrast?.attach(main);
}

/** View Transitions make the card → PDP change feel like one continuous object. */
let inTransition = false;
function render() {
  if (!document.startViewTransition || inTransition) return paint();
  inTransition = true;
  const vt = document.startViewTransition(() => paint());
  /* Both promises reject when a navigation interrupts a running transition
     ("Transition was aborted because of invalid state"). That is expected here —
     a fast click through the catalogue does it every time — but unhandled it
     surfaces as two uncaught rejections in the console on an otherwise healthy
     page. Swallow the abort; the DOM has already been updated by paint(). */
  vt.finished.catch(() => {}).finally(() => { inTransition = false; });
  vt.ready.catch(() => {});
  vt.updateCallbackDone.catch(() => {});
}

function markNav(r) {
  $$('#navList .nav__link').forEach(a => {
    const on = r.name === 'category' && a.dataset.cat === r.arg
            || r.name === 'service'  && a.dataset.cat === 'service';
    a.setAttribute('aria-current', on ? 'page' : 'false');
  });
}

/* ------------------------------------------------------ per-view wiring */

/**
 * Wire every card or row inside `root`. Split out of wireView so that a
 * re-rendered listing can rewire just itself, without re-entering wireView.
 */
function wireCards(root = document) {
  /* card → PDP, with the tapped device named so it morphs across the swap */
  $$('[data-card]', root).forEach(card => {
    const go = () => {
      const media = $('svg', card);
      if (media && document.startViewTransition) media.style.viewTransitionName = 'hero-device';
      location.hash = `#/product/${card.dataset.card}`;
    };
    card.addEventListener('click', e => {
      if (e.target.closest('[data-fav],[data-swatch]')) return;
      go();
    });
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); }
    });
  });

  /* recolour a card in place */
  $$('[data-swatch]', root).forEach(b => b.addEventListener('click', e => {
    e.stopPropagation();
    const [id, hex] = b.dataset.swatch.split('|');
    const p = S.byId(id);
    const media = $(`[data-media="${CSS.escape(id)}"]`, root);
    if (p && media && !p.image) media.innerHTML = deviceSVG(p.device, hex);
    b.closest('.card__swatches, .row__swatches')?.querySelectorAll('.swatch')
      .forEach(x => x.setAttribute('aria-pressed', String(x === b)));
  }));

  $$('[data-fav]', root).forEach(b => b.addEventListener('click', e => {
    e.stopPropagation();
    const on = b.getAttribute('aria-pressed') === 'true';
    b.setAttribute('aria-pressed', String(!on));
  }));
}

function wireView(r) {
  wireCards();

  if (r.name === 'category') wireSort();
  if (r.name === 'product')  wirePDP(r.arg);
  if (r.name === 'home')     wireStory();
  if (r.name === 'service' || r.name === 'home') wireBooking();

  wirePointerFX();
  wireCounters();
}

function wireSort() {
  const grid = $('#catGrid');
  const pagerBox = $('#catPager');
  const cat = parse().arg;
  /* Sort and group are independent axes, so both re-run the same pipeline
     rather than each clobbering the other's result. */
  let sortMode = 'popular';
  let group = '';
  let page = 0;

  const select = () => {
    let items = S.inCategory(cat);
    if (group) items = items.filter(p => inGroup(p, group));
    if (sortMode === 'asc')  items = [...items].sort((a, b) => S.priceOf(a).final - S.priceOf(b).final);
    if (sortMode === 'desc') items = [...items].sort((a, b) => S.priceOf(b).final - S.priceOf(a).final);
    if (sortMode === 'off')  items = [...items].sort((a, b) => S.priceOf(b).off - S.priceOf(a).off);
    return items;
  };

  /* Rewire only what was replaced. The previous version called wireView() here,
     which calls wireSort() again — so the chips outside #catGrid collected a
     fresh listener on every click and the Nth click ran 2^N rebuilds. */
  const apply = () => {
    const items = select();
    const pages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
    page = Math.min(page, pages - 1);
    const slice = items.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);
    grid.innerHTML = items.length
      ? slice.map(productRow).join('')
      : `<p class="dim">${esc(u('nothingHere'))}</p>`;
    pagerBox.innerHTML = pager(items.length, page);
    wireCards(grid);
    wirePager();
    choreo?.attach(grid);
    contrast?.attach(grid);
  };

  function wirePager() {
    $$('#catPager .pager__btn').forEach(b => b.addEventListener('click', () => {
      page += b.dataset.page === 'next' ? 1 : -1;
      apply();
      grid.scrollIntoView({ block: 'start', behavior: 'smooth' });
    }));
  }
  wirePager();

  $$('#sortRow .chip').forEach(chip => chip.addEventListener('click', () => {
    $$('#sortRow .chip').forEach(c => c.classList.toggle('is-on', c === chip));
    sortMode = chip.dataset.sort;
    page = 0;
    apply();
  }));

  $$('#groupRow .chip').forEach(chip => chip.addEventListener('click', () => {
    $$('#groupRow .chip').forEach(c => c.classList.toggle('is-on', c === chip));
    group = chip.dataset.group || '';
    page = 0;
    apply();
  }));
}

function wirePDP(id) {
  const p = S.byId(id);
  if (!p) return;
  let size = p.storage?.[0]?.size || '—';
  let color = p.colors?.[0]?.hex || '#8C949C';

  const refresh = () => {
    const pr = S.variantPrice(p, size);
    $('#pdpPrice').innerHTML = priceBlock({ ...p, price: pr.base }, { big: true });
    const calc = $('#calc');
    if (calc) {
      calc.dataset.amount = pr.final;
      calc.classList.toggle('is-below-min', pr.final < 100);
      updateCalc();
    }
  };

  $$('#storageRow .chip').forEach(b => b.addEventListener('click', () => {
    $$('#storageRow .chip').forEach(x => x.classList.toggle('is-on', x === b));
    size = b.dataset.storage;
    $('#storageHint').textContent = size;
    refresh();
  }));

  $$('#colorRow .swatch').forEach(b => b.addEventListener('click', () => {
    $$('#colorRow .swatch').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    color = b.dataset.color;
    $('#colorHint').textContent = b.dataset.cname;
    if (!p.image) {
      const stage = $('#pdpStage');
      const glow = stage.querySelector('.stage__glow');
      stage.innerHTML = '';
      stage.appendChild(glow);
      stage.insertAdjacentHTML('beforeend', deviceSVG(p.device, color, { ariaLabel: p.name }));
    }
  }));

  $('#addBtn')?.addEventListener('click', () => {
    S.addToCart(p.id, { storage: size, color });
    toast(`${u('added')} — ${p.name}`);
    bumpCart();
  });

  wireCalc();
}

/* ------------------------------------------- instalment calculator wiring */

let calcState = { bank: null, termIdx: 2 };

function currentTerms() {
  const banks = S.getState().instalments || [];
  const bank = banks.find(b => b.id === calcState.bank) || banks[0];
  return { bank, terms: bank?.months || [12] };
}

function updateCalc() {
  const calc = $('#calc');
  if (!calc) return;
  const amount = Number(calc.dataset.amount) || 0;
  const { bank, terms } = currentTerms();
  const idx = Math.min(calcState.termIdx, terms.length - 1);
  const months = terms[idx];

  const slider = $('#calcTerm');
  slider.max = String(terms.length - 1);
  slider.value = String(idx);
  slider.style.setProperty('--fill', `${(idx / Math.max(1, terms.length - 1)) * 100}%`);

  $('#calcTerms').innerHTML = terms.map((m, i) =>
    `<button class="chip${i === idx ? ' is-on' : ''}" data-term="${i}">${m} ${esc(u('months'))}</button>`).join('');
  $$('#calcTerms .chip').forEach(b => b.addEventListener('click', () => {
    calcState.termIdx = Number(b.dataset.term);
    updateCalc();
  }));

  /* The figure counts to its new value — motion exactly where the purchase
     decision is made. Never overshoot on money: it reads as a toy. */
  animateNumber($('#calcAmount'), amount < 100 ? 0 : S.monthly(amount, months, bank));
}

/**
 * Count a figure up to its new value.
 * The final value is written synchronously FIRST and the animation is layered
 * on top, so the correct number is in the DOM even if rAF never runs — which
 * happens whenever the tab is backgrounded. A price that renders as "—"
 * because a frame callback was throttled is not an acceptable failure mode.
 */
function animateNumber(node, to) {
  if (!node) return;
  const from = Number(String(node.textContent).replace(/[^\d]/g, '')) || 0;
  node.textContent = S.gel(to, { symbol: false });
  if (from === to || matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const t0 = performance.now(), dur = 520;
  const ease = x => 1 - Math.pow(1 - x, 4);
  const step = now => {
    const k = Math.min(1, (now - t0) / dur);
    node.textContent = S.gel(Math.round(from + (to - from) * ease(k)), { symbol: false });
    if (k < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

function wireCalc() {
  const calc = $('#calc');
  if (!calc) return;
  const banks = S.getState().instalments || [];
  calcState.bank ||= banks[0]?.id;

  $$('.calc__bank', calc).forEach(b => b.addEventListener('click', () => {
    $$('.calc__bank', calc).forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    calcState.bank = b.dataset.bank;
    calcState.termIdx = Math.min(calcState.termIdx, (currentTerms().terms.length - 1));
    updateCalc();
  }));

  $('#calcTerm').addEventListener('input', e => {
    calcState.termIdx = Number(e.target.value);
    updateCalc();
  });

  updateCalc();
}

/* --------------------------------------------------------- pinned story */

function wireStory() {
  const track = $('#track');
  if (!track) return;
  const panels = $$('.panel', track);
  const dots = $$('.track__dots i', track);
  const holder = $('#storyDevice');
  let current = -1;

  const onScroll = () => {
    const r = track.getBoundingClientRect();
    const total = track.offsetHeight - innerHeight;
    const k = Math.min(0.999, Math.max(0, -r.top / Math.max(1, total)));
    const i = Math.floor(k * STORY.length);
    if (i === current) return;
    current = i;
    panels.forEach((p, n) => p.classList.toggle('is-on', n === i));
    dots.forEach((d, n) => d.classList.toggle('is-on', n === i));
    holder.innerHTML = deviceSVG(STORY[i].device, STORY[i].color);
  };

  addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* -------------------------------------------------------------- booking */

/* Nobody in this market lets you book a repair online, and nobody publishes
   what it costs. So the booking flow states the price, the turnaround and the
   warranty up front, before asking for a single detail. */
function wireBooking() {
  $$('[data-book]').forEach(b => b.addEventListener('click', () => {
    const s = S.getState().services.find(x => x.id === b.dataset.book);
    if (s) openBooking(s);
  }));
}

function nextSlots(count = 6) {
  const out = [];
  const d = new Date();
  const days = { ka: ['კვი', 'ორშ', 'სამ', 'ოთხ', 'ხუთ', 'პარ', 'შაბ'],
                 en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
                 ru: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'] }[S.getLang()];
  for (let i = 0; out.length < count; i++) {
    const day = new Date(d.getTime() + i * 864e5);
    for (const hh of ['11:00', '14:30', '17:00']) {
      if (out.length >= count) break;
      out.push({ id: `${day.toISOString().slice(0, 10)}T${hh}`,
                 label: `${days[day.getDay()]} ${day.getDate()} · ${hh}` });
    }
  }
  return out;
}

function openBooking(s) {
  const dlg = $('#bookDrawer');
  const devices = S.getState().categories
    .filter(c => ['iphone', 'ipad', 'mac', 'watch'].includes(c.id));
  const slots = nextSlots();

  $('#bookBody').innerHTML = `
    <div class="svc__icon">${icon(s.icon || 'diag', 21)}</div>
    <h3 class="svc__name mt-3">${esc(tt(s.name))}</h3>
    <p class="muted mt-3">${esc(tt(s.desc))}</p>

    <div class="svc__meta" style="border-top:0;padding-top:var(--sp-4)">
      <div><b class="num">${s.from > 0 ? esc(S.gel(s.from)) + esc(u('from')) : esc(u('free'))}</b><span>${esc(u('from') === '-დან' ? 'ფასი' : 'Price')}</span></div>
      <div><b>${esc(tt(s.eta))}</b><span>${esc(u('turnaround'))}</span></div>
      ${s.warranty ? `<div><b class="num">${s.warranty} ${esc(u('monthsShort'))}</b><span>${esc(u('svcWarranty'))}</span></div>` : ''}
    </div>

    <div class="opt">
      <div class="opt__label"><span>${esc(u('bookDevice'))}</span></div>
      <div class="opt__row" id="bookDevices">
        ${devices.map((c, i) => `<button class="chip${i === 0 ? ' is-on' : ''}" data-dev="${esc(c.id)}">${esc(S.t(c))}</button>`).join('')}
      </div>
    </div>

    <div class="opt">
      <div class="opt__label"><span>${esc(u('bookSlotLabel'))}</span></div>
      <div class="opt__row" id="bookSlots">
        ${slots.map((sl, i) => `<button class="chip${i === 0 ? ' is-on' : ''}" data-slot="${esc(sl.id)}">${esc(sl.label)}</button>`).join('')}
      </div>
    </div>

    <label class="opt" style="display:block">
      <span class="opt__label"><span>${esc(u('bookPhone'))}</span></span>
      <input type="tel" id="bookPhone" inputmode="tel" placeholder="5xx xx xx xx"
             style="width:100%;padding:.75em 1em;border-radius:var(--r-2);border:1px solid var(--line);background:var(--surface)">
    </label>
    <p class="calc__note" id="bookErr" role="alert" style="color:var(--danger);display:none"></p>`;

  $('#bookFoot').innerHTML =
    `<button class="btn btn--primary btn--block btn--lg" id="bookConfirm">${esc(u('bookConfirm'))}</button>`;

  const pick = sel => $$(sel + ' .chip').forEach(b => b.addEventListener('click', () => {
    $$(sel + ' .chip').forEach(x => x.classList.toggle('is-on', x === b));
  }));
  pick('#bookDevices'); pick('#bookSlots');

  $('#bookConfirm').addEventListener('click', () => {
    const phone = $('#bookPhone').value.replace(/\D/g, '');
    const err = $('#bookErr');
    if (phone.length < 9) {
      err.textContent = u('bookPhoneErr');
      err.style.display = 'block';
      $('#bookPhone').focus();
      return;
    }
    const slot = $('#bookSlots .chip.is-on')?.textContent.trim();
    /* Confirming would hold a real slot and text a real number. */
    if (IS_DEMO) { demoBlocked('booking'); return; }
    dlg.close();
    toast(`${tt(s.name)} · ${slot} ✓`);
  });

  dlg.showModal();
}

/* ------------------------------------------------------- pointer effects */

/* One delegated listener, one rAF, CSS custom properties as the only writes.
   Coarse pointers get nothing, which is correct — a tilt you cannot aim is
   just jitter. */
function wirePointerFX() {
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  let queued = false, ev = null;

  const flush = () => {
    queued = false;
    if (!ev) return;
    const card = ev.target.closest('.card');
    if (card) {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${((ev.clientX - r.left) / r.width) * 100}%`);
      card.style.setProperty('--my', `${((ev.clientY - r.top) / r.height) * 100}%`);
    }
    const mag = ev.target.closest('.btn--magnetic');
    if (mag) {
      const r = mag.getBoundingClientRect();
      mag.style.setProperty('--dx', String(ev.clientX - (r.left + r.width / 2)));
      mag.style.setProperty('--dy', String(ev.clientY - (r.top + r.height / 2)));
    }
  };

  document.addEventListener('pointermove', e => {
    ev = e;
    if (!queued) { queued = true; requestAnimationFrame(flush); }
  }, { passive: true });

  document.addEventListener('pointerout', e => {
    const mag = e.target.closest?.('.btn--magnetic');
    if (mag) { mag.style.setProperty('--dx', '0'); mag.style.setProperty('--dy', '0'); }
  }, { passive: true });
}

/* --------------------------------------------------------- count-up stats */

function wireCounters() {
  const nodes = $$('[data-count]');
  if (!nodes.length) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      io.unobserve(en.target);
      const to = Number(en.target.dataset.count);
      const t0 = performance.now(), dur = 900;
      const ease = x => 1 - Math.pow(1 - x, 3);
      const step = now => {
        const k = Math.min(1, (now - t0) / dur);
        en.target.textContent = Math.round(to * ease(k)).toLocaleString('en-US');
        if (k < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  }, { threshold: 0.4 });

  nodes.forEach(n => io.observe(n));
}

/* ------------------------------------------------------- reveal fallback */

/* Only runs where scroll-driven CSS animations are unsupported. The resting
   state is authored visible, so a failure here can never blank the page. */
let revealIO = null;
function observeReveals() {
  if (CSS.supports('animation-timeline: view()')) return;
  revealIO?.disconnect();
  revealIO = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (en.isIntersecting) { en.target.classList.add('is-in'); revealIO.unobserve(en.target); }
    });
  }, { threshold: 0.08 });
  $$('[data-reveal]').forEach(n => revealIO.observe(n));
}

/* ------------------------------------------------------------------ cart */

const drawer = $('#cartDrawer');

function renderCart() {
  const lines = S.getCart();
  const body = $('#cartBody'), foot = $('#cartFoot');

  if (!lines.length) {
    body.innerHTML = `<div class="empty">
      ${icon('cart', 44)}
      <p style="font-weight:650;color:var(--text)">${esc(u('cartEmpty'))}</p>
      <p class="mt-3">${esc(u('cartEmptySub'))}</p></div>`;
    foot.innerHTML = '';
    return;
  }

  body.innerHTML = lines.map(l => {
    const p = S.byId(l.id);
    const hex = p?.colors?.find(c => c.id === l.color)?.hex || l.color || '#8C949C';
    return `
    <div class="line-item">
      <div class="line-item__media">${p?.image
        ? `<img src="${esc(p.image)}" alt="" loading="lazy" decoding="async">`
        : deviceSVG(l.device, hex)}</div>
      <div>
        <p class="line-item__name">${esc(l.name)}</p>
        <p class="line-item__meta">${esc(l.storage)} · <span class="num">${esc(S.gel(l.price))}</span></p>
        <div class="qty mt-3">
          <button data-dec="${esc(l.key)}" aria-label="−">−</button>
          <output class="num">${l.qty}</output>
          <button data-inc="${esc(l.key)}" aria-label="+">+</button>
        </div>
      </div>
      <button class="icon-btn" data-rm="${esc(l.key)}" aria-label="${esc(u('remove'))}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <path d="m6 6 12 12M18 6 6 18"/></svg>
      </button>
    </div>`;
  }).join('');

  const total = S.cartTotal();
  foot.innerHTML = `
    <div class="total-row">
      <span class="muted">${esc(u('total'))}</span>
      <b class="num">${esc(S.gel(total))}</b>
    </div>
    ${total >= 100 ? `<p class="calc__note" style="margin-top:-.5rem;margin-bottom:1rem">
      ${esc(u('instalment'))} <b class="num" style="color:var(--accent)">${esc(S.gel(S.monthly(total, 12), { symbol: false }))}</b> ${esc(u('perMonth'))}</p>` : ''}
    <button class="btn btn--primary btn--block btn--lg" id="checkout">${esc(u('checkout'))}</button>`;

  /* Checkout had no handler at all: the biggest button on the conversion path
     did nothing. There is no payment step to fake, so it does the one honest
     thing — it creates the order, and the order really does show up in the CMS. */
  $('#checkout')?.addEventListener('click', () => {
    const order = S.placeOrder(S.t(DEMO_BUYER));
    if (!order) return;
    drawer.close();
    toast(`${u('orderPlaced')}${order.id} ${u('orderPlacedSub')}`);
  });

  $$('[data-inc]', body).forEach(b => b.addEventListener('click', () => {
    const l = S.getCart().find(x => x.key === b.dataset.inc); S.setQty(l.key, l.qty + 1);
  }));
  $$('[data-dec]', body).forEach(b => b.addEventListener('click', () => {
    const l = S.getCart().find(x => x.key === b.dataset.dec); S.setQty(l.key, l.qty - 1);
  }));
  $$('[data-rm]', body).forEach(b => b.addEventListener('click', () => S.removeFromCart(b.dataset.rm)));
}

function bumpCart() {
  const el = $('#cartCount');
  el.classList.remove('is-bump');
  void el.offsetWidth;
  el.classList.add('is-bump');
}

function syncCartCount() {
  const n = S.cartCount();
  const el = $('#cartCount');
  el.textContent = String(n);
  el.dataset.n = String(n);
}

/* ----------------------------------------------------------------- toast */

function toast(msg) {
  const zone = $('#toastZone');
  const el = document.createElement('div');
  el.className = 'toast';
  el.innerHTML = `${icon('check', 17)}<span>${esc(msg)}</span>`;
  zone.appendChild(el);
  setTimeout(() => {
    el.classList.add('is-out');
    el.addEventListener('animationend', () => el.remove(), { once: true });
  }, 2400);
}

/* ------------------------------------------------------------- chrome --- */

function renderNav() {
  const st = S.getState();
  $('#navList').innerHTML = st.categories.map(c =>
    `<a class="nav__link" data-cat="${esc(c.id)}"
        href="#/${c.id === 'service' ? 'service' : 'c/' + c.id}">${esc(S.t(c))}</a>`).join('');
}

function renderMenu() {
  const st = S.getState();
  $('#menuList').innerHTML = st.categories.map(c => {
    const n = c.id === 'service' ? st.services.length : S.inCategory(c.id).length;
    return `<a class="menu-link" data-mcat="${esc(c.id)}"
               href="#/${c.id === 'service' ? 'service' : 'c/' + c.id}">
              ${esc(S.t(c))} <span class="num">${n}</span>
            </a>`;
  }).join('');

  $('#menuFoot').innerHTML = `
    <div class="lang" role="group" aria-label="ენა" id="menuLang" style="display:flex;width:max-content">
      ${S.LANGS.map(l => `<button data-lang="${l}" aria-pressed="${l === S.getLang()}">
        ${l === 'ka' ? 'ქარ' : l.toUpperCase()}</button>`).join('')}
    </div>
    <a class="btn btn--ghost btn--block mt-4" href="admin.html">${esc(u('adminLink'))} →</a>`;

  $$('#menuLang button').forEach(b => b.addEventListener('click', () => {
    S.setLang(b.dataset.lang);
    applyLang();
    render();
  }));

  $$('#menuList .menu-link').forEach(a =>
    a.addEventListener('click', () => $('#menuDrawer').close()));
}

function renderTicker() {
  const items = [...TICKER, ...TICKER]  /* duplicated exactly twice for a seamless -50% loop */
    .map(x => `<span class="marquee__item"><span class="marquee__dot"></span>${S.t(x)}</span>`).join('');
  $('#marqueeTrack').innerHTML = items;
}

/* The Help column used to hold four links to the empty hash, which quietly
   bounced the visitor to the home page. There are no policy routes in this
   product, so the footer states each policy instead of pretending to link. */
function renderFooter() {
  const st = S.getState();
  const s = st.site;
  $('#footGrid').innerHTML = `
    <div class="foot__col">
      <a href="#/" class="logo" style="margin-bottom:var(--sp-4)">
        <svg viewBox="0 0 40 40" fill="none" aria-hidden="true">
          <path d="M14 9H8v22h6" stroke="var(--accent)" stroke-width="2.6" stroke-linecap="square"/>
          <path d="M26 9h6v22h-6" stroke="var(--accent)" stroke-width="2.6" stroke-linecap="square"/>
          <path d="M20 13v14" stroke="currentColor" stroke-width="2.6" stroke-linecap="square"/>
        </svg>
        <span class="logo__word">NORVA</span>
      </a>
      <p>${esc(S.t(s.address))}</p>
      <p>${esc(S.t(s.hours))}</p>
    </div>
    <div class="foot__col">
      <h4>${esc(u('footShop'))}</h4>
      ${st.categories.map(c => `<a href="#/${c.id === 'service' ? 'service' : 'c/' + c.id}">${esc(S.t(c))}</a>`).join('')}
    </div>
    <div class="foot__col">
      <h4>${esc(u('footHelp'))}</h4>
      <a href="#/service">${esc(S.t(st.categories.find(c => c.id === 'service')))}</a>
      <p>${esc(u('shipping'))} · ${esc(S.t(UI.deliveryV))}</p>
      <p>${esc(u('returns'))} · ${esc(S.t(UI.returnsV))}</p>
      <p>${esc(u('warranty'))} · ${esc(S.t(UI.warrantyV))}</p>
    </div>
    <div class="foot__col">
      <h4>${esc(u('footVisit'))}</h4>
      ${s.phones.map(ph => `<a href="#/" data-block="contact">${esc(ph)}</a>`).join('')}
      <a href="#/" data-block="contact">${esc(s.email)}</a>
      <a href="admin.html">${esc(u('adminLink'))} →</a>
      <!-- The banner carries a reset too, but it is dismissible; a visitor who
           dismissed it and then emptied the catalogue in the open CMS would
           otherwise have no way back. -->
      <a href="#/" id="footReset">${esc(S.t(RESET_LABEL))}</a>
    </div>`;

  /* The numbers and the address are invented, so tapping one must not dial. */
  $$('#footGrid [data-block]').forEach(a =>
    a.addEventListener('click', blockOn(a.dataset.block)));

  $('#footReset')?.addEventListener('click', e => {
    e.preventDefault();
    S.resetToFactory();
    toast(S.t(RESET_DONE));
  });

  $('#footLegal').textContent =
    `© ${new Date().getFullYear()} ${s.legal} · ${s.taxId} · ${u('rights')}`;
}

function applyLang() {
  const lang = S.getLang();
  document.documentElement.lang = lang;
  $$('.lang button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
  $('#searchInput').placeholder = u('searchPh');
  $('#cartTitle').textContent = u('cart');
  $('#bookTitle').textContent = u('bookTitle');
  renderNav(); renderMenu(); renderTicker(); renderFooter();
}

function applyTheme() {
  const th = S.getTheme();
  document.documentElement.dataset.theme = th;

  /* The fluid runs in both themes. It cannot simply be recoloured, though:
     on a light ground, screen-blending dye over near-white is a no-op, so the
     display pass switches to subtractive ink-on-paper compositing. */
  if (fluid) {
    document.body.classList.add('has-fluid');
    fluid.setGround(th === 'dark' ? GROUND.dark : GROUND.light, th !== 'dark');
    fluid.resume();
  }
  $('#themeIcon').innerHTML = th === 'dark'
    ? '<circle cx="12" cy="12" r="4.5"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5 5l1.4 1.4M17.6 17.6 19 19M19 5l-1.4 1.4M6.4 17.6 5 19"/>'
    : '<path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z"/>';
  $('meta[name=theme-color]')?.setAttribute('content', th === 'dark' ? GROUND.dark : GROUND.light);
}

/* Procedural grain — a data-URI SVG turbulence tile, so there is no asset to
   ship and no request to make. */
function makeGrain() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180">
    <filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.82" numOctaves="3" stitchTiles="stitch"/>
    <feColorMatrix type="saturate" values="0"/></filter>
    <rect width="180" height="180" filter="url(#n)" opacity="0.42"/></svg>`;
  document.documentElement.style.setProperty(
    '--grain-url', `url("data:image/svg+xml,${encodeURIComponent(svg)}")`);
}

/* ------------------------------------------------------------------ boot */

function wireChrome() {
  $('#themeBtn').addEventListener('click', () => {
    S.setTheme(S.getTheme() === 'dark' ? 'light' : 'dark');
    applyTheme();
  });

  $$('.lang button').forEach(b => b.addEventListener('click', () => {
    S.setLang(b.dataset.lang);
    applyLang();
    render();
  }));

  $('#cartBtn').addEventListener('click', () => { renderCart(); drawer.showModal(); });
  $('#cartClose').addEventListener('click', () => drawer.close());
  drawer.addEventListener('click', e => { if (e.target === drawer) drawer.close(); });

  const menu = $('#menuDrawer');
  $('#menuBtn').addEventListener('click', () => menu.showModal());
  $('#menuClose').addEventListener('click', () => menu.close());
  menu.addEventListener('click', e => { if (e.target === menu) menu.close(); });

  const book = $('#bookDrawer');
  $('#bookClose').addEventListener('click', () => book.close());
  book.addEventListener('click', e => { if (e.target === book) book.close(); });

  /* search */
  const pop = $('#searchPop'), input = $('#searchInput'), res = $('#searchRes');
  const toggle = on => {
    pop.classList.toggle('hide', !on);
    $('#searchBtn').setAttribute('aria-expanded', String(on));
    if (on) input.focus();
  };
  $('#searchBtn').addEventListener('click', () => toggle(pop.classList.contains('hide')));
  document.addEventListener('click', e => {
    if (!e.target.closest('#searchPop') && !e.target.closest('#searchBtn')) toggle(false);
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') toggle(false); });

  input.addEventListener('input', () => {
    const hits = S.search(input.value);
    if (!input.value.trim()) { res.innerHTML = ''; return; }
    res.innerHTML = hits.length
      ? hits.map(p => `<button data-go="${esc(p.id)}">
          ${productMedia(p)}
          <span><b style="display:block;font-size:var(--step--1)">${esc(p.name)}</b>
          <span class="dim num" style="font-size:var(--step--2)">${esc(S.gel(S.priceOf(p).final))}</span></span>
        </button>`).join('')
      : `<p class="dim" style="padding:var(--sp-3)">${esc(u('noResults'))}</p>`;
    $$('[data-go]', res).forEach(b => b.addEventListener('click', () => {
      location.hash = `#/product/${b.dataset.go}`;
      toggle(false); input.value = ''; res.innerHTML = '';
    }));
  });

  /* marquee pause — WCAG 2.2.2 needs a real control, hover does not count on touch */
  const mq = $('#marquee'), pause = $('#marqueePause');
  pause.addEventListener('click', () => {
    const on = mq.classList.toggle('is-paused');
    pause.setAttribute('aria-pressed', String(on));
    pause.textContent = on ? '▶' : '⏸';
  });

  /* nav gains its border and shadow once you leave the hero */
  const navEl = $('#nav');
  addEventListener('scroll', () => {
    navEl.classList.toggle('is-stuck', scrollY > 8);
  }, { passive: true });
}

/* ------------------------------------------------------------ fluid ground */

let fluid = null;
let choreo = null;
let contrast = null;

function bootFluid() {
  const canvas = $('#fluid');
  if (!canvas) return;

  fluid = createFluid(canvas, {
    palette: ['#E3AE55', '#8E9BEA', '#F2D49A'],
    ground: '#131110',
  });

  if (!fluid.supported) {
    /* The CSS gradient on #fluid stays as the background. Nothing else to do —
       and nothing else may call into the sim.
       Silent on purpose: reduced-motion and software renderers land here on a
       perfectly healthy visit, so this is not something to log at a visitor. */
    fluid = null;
    return;
  }

  /* No boot seed: the ground starts clean and colour appears only from the
     pointer and from card landings. */

  /* Drag pushes the fluid. Listened on window rather than the canvas, because
     the canvas is behind the DOM with pointer-events: none. */
  let px = 0, py = 0, tracking = false;
  addEventListener('pointerdown', e => { tracking = true; px = e.clientX; py = e.clientY; }, { passive: true });
  addEventListener('pointerup', () => { tracking = false; }, { passive: true });
  addEventListener('pointercancel', () => { tracking = false; }, { passive: true });
  addEventListener('pointermove', e => {
    /* Fine pointers paint on hover; coarse ones only while dragging, so a scroll
       gesture does not smear dye across the screen. */
    const fine = e.pointerType === 'mouse';
    if (!fine && !tracking) return;
    const dx = e.clientX - px, dy = e.clientY - py;
    px = e.clientX; py = e.clientY;
    if (Math.abs(dx) + Math.abs(dy) < 1.5) return;
    fluid.pointerAt(e.clientX, e.clientY, dx, dy);
  }, { passive: true });

  choreo = createChoreography(fluid);
  contrast = createContrast(fluid);

  /* Debug handle: lets the fluid be inspected and driven from the console
     without shipping a GUI. Read-only from the site's point of view. */
  window.norva = { fluid, choreo, contrast };
}

function boot() {
  mountBanner({
    here: 'shop',
    onReset: () => { S.resetToFactory(); toast(S.t(RESET_DONE)); },
  });
  makeGrain();
  applyTheme();
  applyLang();
  wireChrome();
  syncCartCount();
  bootFluid();
  applyTheme();      /* again, now that `fluid` exists, to set has-fluid */
  render();

  addEventListener('hashchange', render);

  S.subscribe((_, reason) => {
    if (reason === 'cart') { syncCartCount(); if (drawer.open) renderCart(); return; }
    /* an admin edit in another tab — repaint everything */
    if (reason === 'external' || reason === 'import' || reason === 'reset' || reason === 'update') {
      applyLang();
      render();
      syncCartCount();
    }
  });
}

boot();
